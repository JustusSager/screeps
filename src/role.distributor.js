/*
Creep holt aus Storage und Containern Energy und verteilt sie auf den Spawn, Extensions und Tower.
Nicht dafür gemacht den Raum in dem es geschaffen wurde zu verlassen.
*/
require('prototype.creep')();

module.exports = {
    run: function(creep, speak) {
        
        // if creep is bringing energy to the spawn but has no energy left
        if (creep.memory.working == true && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.working = false;
        }
        // if creep is harvesting energy but is full
        else if (creep.memory.working == false && creep.store.getFreeCapacity([RESOURCE_ENERGY]) == 0) {
            creep.memory.working = true;
        }

        // if creep is supposed to transfer energy to the spawn
        if (creep.memory.working == true) {
            var target_spawn = creep.room.find(FIND_MY_SPAWNS, {filter: (s) => s.energy < s.energyCapacity})[0];
            var target_extension = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION &&
                            structure.energy < structure.energyCapacity);
                }
            })[0];
            var target_tower = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_TOWER &&
                            structure.energy < structure.energyCapacity);
                }
            })[0];
            // try to transfer energy, if the target is not in range
            if (target_spawn) {
                if(speak){creep.say('Spawn');}
                if (creep.transfer(target_spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // move towards the spawn
                    creep.moveTo(target_spawn);
                }
            } else if (target_extension) {
                if(speak){creep.say('Extension');}
                if (creep.transfer(target_extension, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // move towards the spawn
                    creep.moveTo(target_extension);
                }
            } else if (target_tower) {
                if(speak){creep.say('Tower');}
                if (creep.transfer(target_tower, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // move towards the spawn
                    creep.moveTo(target_tower);
                }
            } else {
                if(speak){creep.say('Controller');}
                if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller);
                }
            }
        }
        // if creep is supposed to get energy from target
        else {
            creep.getResourceEnergy(speak);
        }
    }
};