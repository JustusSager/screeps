module.exports = {
    run: function(creep, speak) {

        if (creep.room.energyAvailable > (creep.room.energyCapacityAvailable * 0.9)) {
            creep.memory.task = "searching"
            creep.memory.target = "searching"
        }
        
        // if creep is bringing energy to the spawn but has no energy left
        if (creep.memory.working == true && creep.store[RESOURCE_ENERGY] == 0) {
            creep.say('GetEnergy');
            creep.memory.working = false;
        }
        // if creep is harvesting energy but is full
        else if (creep.memory.working == false && creep.store.getFreeCapacity([RESOURCE_ENERGY]) == 0) {
            creep.say('StoreEnergy');
            creep.memory.working = true;
        }

        // if creep is supposed to transfer energy to the spawn
        if (creep.memory.working == true) {
            var target_extension = creep.find_extensions_not_full();
            if (target_extension) {
                if(speak){creep.say('Extension');}
                if (creep.transfer(target_extension, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // move towards the spawn
                    creep.moveTo(target_extension);
                }
                return;
            }
            
            var target_spawn = creep.room.find(FIND_MY_SPAWNS, {filter: (s) => s.energy < s.energyCapacity})[0];
            if (target_spawn) {
                if(speak){creep.say('Spawn');}
                if (creep.transfer(target_spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // move towards the spawn
                    creep.moveTo(target_spawn);
                }
                return;
            }
            
            var target_tower = creep.find_towers_not_full();
            if (target_tower) {
                if(speak){creep.say('Tower');}
                if (creep.transfer(target_tower, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // move towards the spawn
                    creep.moveTo(target_tower);
                }
                return;
            }
            creep.say("ER TR");
        }
        // if creep is supposed to get energy from target
        else {
            var source_ground = creep.find_dropped_rescources();
            if (source_ground) {
                if (speak) {creep.say('DroppedItem');}
                if (creep.pickup(source_ground) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source_ground);
                }
                return;
            }
            
            var source_tombstone = creep.find_tombstones();
            if (source_tombstone) {
                if (speak) {creep.say('Tombstone');}
                if (creep.withdraw(source_tombstone, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source_tombstone);
                }
                return;
            }
            
            var source_container = creep.find_container_storage_not_empty();
            if (source_container) {
                if (speak) {creep.say('Container');}
                if (creep.withdraw(source_container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source_container);
                }
                return;
            }
        }
    }
};