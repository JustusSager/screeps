const config = require("config");

module.exports = {
    run: function() {
        // if (Game.time % 10 != 4) return;

        var terminal_resources = {};
        for (let i in Game.rooms) {
            if (!Game.rooms[i].terminal) continue;
            terminal_resources[i] = Game.rooms[i].terminal.store;
        }

        console.log(JSON.stringify(terminal_resources))

        for (let i in Game.rooms) {
            if (!Game.rooms[i].terminal) continue;

            var room = Game.rooms[i];

            if (room.terminal.store[RESOURCE_ENERGY] >= config.structureTerminal.energyLowerThreshold) {
                for (let resource of RESOURCES_ALL) {
                    if (!(resource in config.structureTerminal.mineralThresholds)) {
                        continue;
                    }
                    if (room.terminal.store[resource] > config.structureTerminal.mineralThresholds[resource] * config.structureTerminal.mineralSellFactor) {
                        var orders = Game.market.getAllOrders(
                            order => order.resourceType == resource &&
                            order.type == ORDER_BUY &&
                            Game.market.calcTransactionCost(config.structureTerminal.transactionVolume, room.name, order.roomName) < config.structureTerminal.maxTransactionCost
                            );
                        console.log(resource + " Transactions found: " + orders.length);
                        orders.sort(function(a,b){return b.price - a.price;})
                        console.log("Best price: " + orders[0].price);

                        if (orders[0].price > 0.7) {
                            var result = Game.market.deal(orders[0].id, config.structureTerminal.transactionVolume, room.name);
                            console.log(result);
                        }
                    }

                    if (room.terminal.store[resource] < config.structureTerminal.mineralThresholds[resource] * config.structureTerminal.mineralTransportFactor) {
                        for (let j in terminal_resources) {
                            if (terminal_resources[j] && terminal_resources[j][resource] && terminal_resources[j][resource] > config.structureTerminal.mineralThresholds[resource] && terminal_resources[j][RESOURCE_ENERGY] > config.structureTerminal.energyLowerThreshold) {
                                Game.rooms[j].terminal.send(
                                    resource, 
                                    (config.structureTerminal.mineralThresholds[resource] - room.terminal.store[resource]),
                                    room.name,
                                    'Room '  + room.name + 'needed ' + (config.structureTerminal.mineralThresholds[resource] - room.terminal.store[resource]) + ' ' + resource + '.'
                                )
                                console.log('Room '  + room.name + 'needed ' + (config.structureTerminal.mineralThresholds[resource] - room.terminal.store[resource]) + ' ' + resource + '.');
                                break;
                            }
                        }
                    }
                }
            }
        }
    }
}
