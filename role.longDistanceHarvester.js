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
            if (creep.room.name == creep.memory.room_home) {
                // Store energy if in home room
                // find container and storage in room
                var target_container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_STORAGE &&
                                structure.store.getFreeCapacity([RESOURCE_ENERGY]) > 0 &&
                                structure.room == creep.room)
                    }
                });
                if (target_container != null) {
                    if(speak){creep.say('Container');}
                    if (creep.transfer(target_container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        // move towards the target
                        creep.moveTo(target_container);
                    }
                }
                else if (Game.spawns.Spawn1.energy < 300) {
                    if(speak){creep.say('Spawn');}
                    if (creep.transfer(Game.spawns.Spawn1, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        // move towards the spawn
                        creep.moveTo(Game.spawns.Spawn1);
                    }
                }
                else {
                    var targets = creep.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_EXTENSION ||
                                    structure.structureType == STRUCTURE_TOWER ||
                                    structure.structureType == STRUCTURE_CONTAINER) &&
                                structure.energy < structure.energyCapacity;
                        }
                    });
                    if(speak){creep.say('Extension');}
                    if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        // move towards the spawn
                        creep.moveTo(targets[0]);
                    }
                }
            }
            else {
                // Find and move to home room
                if(speak){creep.say('Going Home');}
                var exit_direction = creep.room.findExitTo(creep.memory.room_home);
                creep.moveTo(creep.pos.findClosestByPath(exit_direction));
            }
        }
        // if creep is supposed to harvest energy from source
        else {
            if (creep.room.name == creep.memory.room_target) {
                // Find and harvest source if inside target room
                var source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
                if(speak){creep.say('Source');}
                var code = creep.harvest(source)
                if (code == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source);
                }
            }
            else {
                // Find and move to target room
                if(speak){creep.say('GoToRoom');}
                var exit_direction = creep.room.findExitTo(creep.memory.room_target);
                creep.moveTo(creep.pos.findClosestByPath(exit_direction));
            }
        }
    }
};
