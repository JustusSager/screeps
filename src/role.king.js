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
            if (spawns.length > 0) {
                creep.transfer(Game.getObjectById(spawns[0]), RESOURCE_ENERGY);
            }
            else if (towers.length > 0) {
                creep.transfer(Game.getObjectById(towers[0]), RESOURCE_ENERGY);
            }
            else if (terminals.length > 0 && Game.getObjectById(terminals[0]).store[RESOURCE_ENERGY] < config.structureTerminal.energyLowerThreshold) {
                creep.transfer(terminals_too_less[0], RESOURCE_ENERGY);
            }
            else if (storages.length > 0){
                creep.transfer(Game.getObjectById(storages[0]), RESOURCE_ENERGY);
            }
        } else {
            if (links.length > 0) {
                creep.withdraw(Game.getObjectById(links[0]), RESOURCE_ENERGY);
            }
            else if (terminals.length > 0 && Game.getObjectById(terminals[0]).store[RESOURCE_ENERGY] > config.structureTerminal.energyUpperTheshold) {
                creep.transfer(terminals_too_full[0], RESOURCE_ENERGY);
            }
            else if (storages.length > 0) {
                creep.withdraw(Game.getObjectById(storages[0]), RESOURCE_ENERGY);
            }
        }
    }
};