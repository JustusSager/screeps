module.exports = {
    run: function(creep, speak) {
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
            var target_spawn = creep.pos.findClosestByPath(FIND_MY_SPAWNS, {
                filter: (s) => {
                    s.store.getFreeCapacity > 100;
                }
            })
            if (target_spawn) {
                if(speak){creep.say('Spawn');}
                if (creep.transfer(target_spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target_spawn);
                }
                return;
            }
            
            var target_extension = creep.find_extensions_not_full();
            if (target_extension) {
                if(speak){creep.say('Extension');}
                if (creep.transfer(target_extension, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target_extension);
                }
                return;
            }
            
            var target_tower = creep.find_towers_not_full();
            if (target_tower) {
                if(speak){creep.say('Tower');}
                if (creep.transfer(target_tower, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target_tower);
                }
                return;
            }
            var target_lab = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) => {
                    s.structureType == STRUCTURE_LAB &&
                    s.store.getFreeCapacity > 0;
                }
            })
            if (target_lab) {
                if(speak){creep.say('Lab');}
                if (creep.transfer(target_lab, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target_lab);
                }
                return;
            }
        }
        // if creep is supposed to get energy from target
        else {
            var source = creep.find_storage_not_empty();
            if (source) {
                if (speak) {creep.say('Storage');}
                if (creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source);
                }
                return;
            }
            source = Game.getObjectById(creep.room.memory.storage_link);
            if (source) {
                if (speak) {creep.say('Link');}
                if (creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source);
                }
                return;
            }
        }
    }
};