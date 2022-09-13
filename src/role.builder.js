var roleUpgrader = require('role.upgrader');

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
            var constructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES); // find closest source
            if (creep.memory.room_target != undefined && creep.room.name != creep.memory.room_target) {
                if(speak){creep.say('GoToRoom');}
                var exit_direction = creep.room.findExitTo(creep.memory.room_target);
                creep.moveTo(creep.pos.findClosestByPath(exit_direction));
            }
            else if (constructionSite != undefined) {
                if(speak) {creep.say('Build');}
                if (creep.build(constructionSite) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(constructionSite);
                }
            }
            // try to transfer energy, if the spawn is not in range move towards the source
            else {
                roleUpgrader.run(creep, speak);
            }
        }
        // if creep is supposed to get energy from target
        else {
            var source_storage = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.structureType == STRUCTURE_CONTAINER ||
                            structure.structureType == STRUCTURE_STORAGE) &&
                            structure.store[RESOURCE_ENERGY] != 0 &&
                            structure.room == creep.room)
                }
            });
            if (creep.memory.room_home != undefined && creep.room.name != creep.memory.room_home) {
                if(speak){creep.say('GoHome');}
                var exit_direction = creep.room.findExitTo(creep.memory.room_home);
                creep.moveTo(creep.pos.findClosestByPath(exit_direction));
            }
            else if (source_storage != null) {
                if(speak) {creep.say('Storage');}
                if (creep.withdraw(source_storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source_storage);
                }
            }
            else {
                var source_spawn = creep.room.find(FIND_MY_SPAWNS)[0]; // find closest source
                if(speak) {creep.say('Spawn');}
                // try to harvest energy, if the source is not in range move towards the source
                if (creep.withdraw(source_spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source_spawn);
                }
            }
        }
    }
};