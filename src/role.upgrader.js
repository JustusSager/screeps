/*
Creep holt sich Energy aus einem Container, Storage oder Spawn, geht zum Controller und upgradet ihn.
Bewegt sich nicht zwischen Räumen.
*/
module.exports = {
    // a function to run the logic for this role
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
            // try to transfer energy, if the spawn is not in range move towards the source
            if(speak){creep.say('Controller');}
            if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
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
                if(speak){creep.say('Container');}
                if (creep.withdraw(source_container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source_container);
                }
            }
            else {
                var source_spawn = creep.room.find(FIND_MY_SPAWNS)[0]; // find closest source
                if(speak){creep.say('Spawn');}
                // try to harvest energy, if the source is not in range move towards the source
                if (creep.withdraw(source_spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source_spawn);
                }
            }
        }
    }
};
