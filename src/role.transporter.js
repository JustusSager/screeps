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
            var target_storage = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_STORAGE &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                            structure.room == creep.memory.home_room;
                }
            });
            // try to transfer energy, if the target is not in range
            if (target_storage != null) {
                if (speak) {creep.say('Storage');}
                if (creep.transfer(target_storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // move towards the spawn
                    creep.moveTo(target_storage);
                }
            }
            else if (creep.room.find(FIND_MY_SPAWNS)[0].energy < 300) {
                if (speak) {creep.say('Spawn');}
                if (creep.transfer(creep.room.find(FIND_MY_SPAWNS)[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // move towards the spawn
                    creep.moveTo(creep.room.find(FIND_MY_SPAWNS)[0]);
                }
            }
            else {
                if (speak) {creep.say('Controller');}
                if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller);
                }
            }
        }
        // if creep is supposed to get energy from target
        else {
            var source_ground = creep.room.find(FIND_DROPPED_RESOURCES)[0];
            var source_tombstone = creep.pos.findClosestByPath(FIND_TOMBSTONES, {
                filter: (structure) => {
                    return (structure.store[RESOURCE_ENERGY] > 0 &&
                            structure.room == creep.room)
                }
            });
            var source_container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER &&
                            structure.store[RESOURCE_ENERGY] > 200 &&
                            structure.room == creep.room)
                }
            });
            if (source_ground) {
                if (speak) {creep.say('DroppedItem');}
                if (creep.pickup(source_ground) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source_ground);
                }
            }
            else if (source_tombstone != null) {
                if (speak) {creep.say('Tombstone');}
                if (creep.withdraw(source_tombstone, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source_tombstone);
                }
            }
            else if (source_container != null) {
                if (speak) {creep.say('Container');}
                if (creep.withdraw(source_container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source_container);
                }
            }
        }
    }
};