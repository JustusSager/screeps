module.exports = {
    run: function(creep, speak) {
        
        // if creep is bringing energy to the spawn but has no energy left
        if (creep.memory.working == true && creep.store[RESOURCE_ENERGY] == 0) {
            creep.say('MineEnergy');
            creep.memory.working = false;
        }
        // if creep is harvesting energy but is full
        else if (creep.memory.working == false && creep.store.getFreeCapacity([RESOURCE_ENERGY]) == 0) {
            creep.say('StoreEnergy');
            creep.memory.working = true;
        }

        // if creep is supposed to transfer energy to the spawn
        if (creep.memory.working == true) {
            if (creep.room.name == creep.memory.room_home) {
                let storage_container_link = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return ((structure.structureType == STRUCTURE_CONTAINER ||
                                structure.structureType == STRUCTURE_STORAGE ||
                                structure.structureType == STRUCTURE_LINK) &&
                                structure.store[RESOURCE_ENERGY] > creep.store.getFreeCapacity([RESOURCE_ENERGY])
                                )
                    }
                });
                if (storage_container_link) {
                    if (creep.transfer(storage_container_link, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(storage_container_link);
                    }
                }
                else {
                    if(speak){creep.say('Controller');}
                    if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.controller);
                    }
                }
            }
            else {
                var exit_direction = creep.room.findExitTo(creep.memory.room_home);
                creep.moveTo(creep.pos.findClosestByPath(exit_direction));
            }
        }
        // if creep is supposed to harvest energy from source
        else {
            if (creep.room.name == creep.memory.room_target) {
                var container = creep.find_container_storage_not_empty();
                if (container) {
                    if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(container);
                    }
                }
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
