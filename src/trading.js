const config = require("config");

module.exports = {
    run: function(room) {
        if (room.terminal && Game.time % 10 == 4) {
            if (room.terminal.store[RESOURCE_ENERGY] >= config.structureTerminal.energyLowerThreshold) {
                for (let resource of RESOURCES_ALL) {
                    if (!(resource in config.structureTerminal.mineralLowerThresholds)) {
                        continue;
                    }
                    if (room.terminal.store[resource] > config.structureTerminal.mineralLowerThresholds[resource]) {
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
                }
            }
        }
    }
}
