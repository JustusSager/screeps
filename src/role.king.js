const config = require("config");

module.exports = {
    run: function(creep, speak) {
        if (creep.pos != Game.flags[creep.memory.target].pos) {
            creep.moveTo(Game.flags[creep.memory.target].pos);
        }
        
        var links = Game.flags[creep.memory.target].pos.findInRange(FIND_STRUCTURES, 1, {
            filter: s => s.structureType == STRUCTURE_LINK
        });
        var towers = Game.flags[creep.memory.target].pos.findInRange(FIND_STRUCTURES, 1, {
            filter: s => s.structureType == STRUCTURE_TOWER && s.store.getFreeCapacity(RESOURCE_ENERGY) > 50
        });
        var storages = Game.flags[creep.memory.target].pos.findInRange(FIND_STRUCTURES, 1, {
            filter: s => s.structureType == STRUCTURE_STORAGE
        });
        var spawns = Game.flags[creep.memory.target].pos.findInRange(FIND_MY_SPAWNS, 1, {
            filter: s => s.store.getFreeCapacity(RESOURCE_ENERGY) > 50
        });
        var terminals_too_less = Game.flags[creep.memory.target].pos.findInRange(FIND_STRUCTURES, 1, {
            filter: s => s.structureType == STRUCTURE_TERMINAL && s.store[RESOURCE_ENERGY] < config.structureTerminal.energyLowerThreshold
        });
        var terminals_too_full = Game.flags[creep.memory.target].pos.findInRange(FIND_STRUCTURES, 1, {
            filter: s => s.structureType == STRUCTURE_TERMINAL && s.store[RESOURCE_ENERGY] > config.structureTerminal.energyUpperTheshold
        });
        
        if (creep.store[RESOURCE_ENERGY] > 0) {
            if (spawns.length > 0) {
                creep.transfer(spawns[0], RESOURCE_ENERGY);
            }
            else if (towers.length > 0) {
                creep.transfer(towers[0], RESOURCE_ENERGY);
            }
            else if (terminals_too_less.length > 0) {
                creep.transfer(terminals_too_less[0], RESOURCE_ENERGY);
            }
            else if (storages.length > 0){
                creep.transfer(storages[0], RESOURCE_ENERGY);
            }
        } else {
            if (links.length > 0) {
                creep.withdraw(links[0], RESOURCE_ENERGY);
            }
            else if (terminals_too_full.length > 0) {
                creep.transfer(terminals_too_full[0], RESOURCE_ENERGY);
            }
            else if (storages.length > 0) {
                creep.withdraw(storages[0], RESOURCE_ENERGY);
            }
        }
    }
};