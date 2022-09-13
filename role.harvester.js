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
        if (creep.memory.room_home != undefined && creep.room.name != creep.memory.room_home) {
            if(speak){creep.say('GoToRoom');}
            var exit_direction = creep.room.findExitTo(creep.memory.room_home);
            creep.moveTo(creep.pos.findClosestByPath(exit_direction));
        }
        else if (creep.memory.working == true) {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_TOWER) &&
                        structure.energy < structure.energyCapacity;
                }
            });
            
            if (creep.room.find(FIND_MY_SPAWNS)[0].energy < 300) {
                if(speak){creep.say('Spawn');}
                if (creep.transfer(creep.room.find(FIND_MY_SPAWNS)[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // move towards the spawn
                    creep.moveTo(creep.room.find(FIND_MY_SPAWNS)[0]);
                }
            }
            else if (targets.length > 0) {
                if(speak){creep.say('Extension');}
                if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                }
            }
            else {
                var target_container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return ((structure.structureType == STRUCTURE_CONTAINER ||
                                structure.structureType == STRUCTURE_STORAGE) &&
                                structure.store.getFreeCapacity([RESOURCE_ENERGY]) > 0 &&
                                structure.room == creep.room)
                    }
                });
                if(speak){creep.say('Container');}
                if (creep.transfer(target_container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target_container);
                }
            }
        }
        // if creep is supposed to harvest energy from source
        else {
            // find closest source
            var source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
            if(speak){creep.say('Source');}
            // try to harvest energy, if the source is not in range
            var code = creep.harvest(source)
            if (code == ERR_NOT_IN_RANGE) {
                // move towards the source
                creep.moveTo(source);
            }
        }
    }
};
