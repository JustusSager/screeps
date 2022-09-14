/*
Creep holt aus Storage und Containern Energy und verteilt sie auf den Spawn, Extensions und Tower.
Nicht dafür gemacht den Raum in dem es geschaffen wurde zu verlassen.
*/
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
            var target = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_SPAWN ||
                            structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_TOWER) &&
                            structure.energy < structure.energyCapacity &&
                            structure.room == creep.room;
                }
            })[0];
            // try to transfer energy, if the target is not in range
            if (target != null) {
                if(speak){creep.say('Extension');}
                if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // move towards the spawn
                    creep.moveTo(target);
                }
            }
            else {
                if(speak){creep.say('Controller');}
                if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller);
                }
            }
        }
        // if creep is supposed to get energy from target
        else {
            var source_container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.structureType == STRUCTURE_CONTAINER ||
                            structure.structureType == STRUCTURE_STORAGE) &&
                            structure.store[RESOURCE_ENERGY] != 0 &&
                            structure.room == creep.room)
                }
            });
            if (source_container != null) {
                if(speak){creep.say('Storage');}
                if (creep.withdraw(source_container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source_container);
                }
            }
        }
    }
};