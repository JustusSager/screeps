const config = require("config");

module.exports = {
    run: function(creep, speak) {
        if (creep.pos != Game.flags[creep.memory.target].pos) {
            creep.moveTo(Game.flags[creep.memory.target].pos);
        }
        
        var links = Game.flags[creep.memory.target].memory.structureLinks;
        var towers = Game.flags[creep.memory.target].memory.structureTowers;
        var storages = Game.flags[creep.memory.target].memory.structureStorages;
        var spawns = Game.flags[creep.memory.target].memory.structureSpawns;
        var terminals = Game.flags[creep.memory.target].memory.structureTerminals;
        
        if (creep.store[RESOURCE_ENERGY] > 0) {
            if (spawns.length > 0 && Game.getObjectById(spawns[0]).store.getFreeCapacity(RESOURCE_ENERGY) > 50) {
                creep.transfer(Game.getObjectById(spawns[0]), RESOURCE_ENERGY);
            }
            else if (towers.length > 0 && Game.getObjectById(towers[0]).store.getFreeCapacity(RESOURCE_ENERGY) > 50) {
                creep.transfer(Game.getObjectById(towers[0]), RESOURCE_ENERGY);
            }
            else if (towers.length > 1 && Game.getObjectById(towers[1]).store.getFreeCapacity(RESOURCE_ENERGY) > 50) {
                creep.transfer(Game.getObjectById(towers[1]), RESOURCE_ENERGY);
            }
            else if (terminals.length > 0 && Game.getObjectById(terminals[0]).store[RESOURCE_ENERGY] < config.structureTerminal.energyLowerThreshold) {
                creep.transfer(Game.getObjectById(terminals[0]), RESOURCE_ENERGY);
            }
            else if (storages.length > 0){
                creep.transfer(Game.getObjectById(storages[0]), RESOURCE_ENERGY);
            }
        } else {
            if (links.length > 0 && Game.getObjectById(links[0]).store[RESOURCE_ENERGY] > 0) {
                creep.withdraw(Game.getObjectById(links[0]), RESOURCE_ENERGY);
            }
            else if (terminals.length > 0 && Game.getObjectById(terminals[0]).store[RESOURCE_ENERGY] > config.structureTerminal.energyUpperTheshold) {
                creep.withdraw(terminals[0], RESOURCE_ENERGY);
            }
            else if (storages.length > 0) {
                creep.withdraw(Game.getObjectById(storages[0]), RESOURCE_ENERGY);
            }
        }
    }
};