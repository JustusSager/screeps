/*
Creep sucht eine Energy Ressource und baut diese ab, bei vollem Inventar geht sie zum Spawn, Extensions, oder Towers, falls alle voll sucht sie ein Container oder Storage.
Kann auch verwendet werden um Energy in anderen Räumen abzubauen.
*/
var build = false;

module.exports = {
    // a function to run the logic for this role
    run: function(creep, speak) {
        
        if (!creep.memory.task) {
            creep.memory.task = 'upgrade';
        }
        
        // if creep is bringing energy to the spawn but has no energy left
        if (creep.memory.working == true && creep.store[RESOURCE_ENERGY] == 0) {
            creep.say('MineEnergy');
            creep.memory.working = false;
        }
        // if creep is harvesting energy but is full
        else if (creep.memory.working == false && creep.store.getFreeCapacity([RESOURCE_ENERGY]) == 0) {
            creep.say('StoreEnergy');
            creep.memory.working = true;
            
            if (creep.memory.task == 'upgrade') {
                creep.memory.task = 'build'
            } else if (creep.memory.task == 'build') {
                creep.memory.task = 'store';
            } else if (creep.memory.task == 'store') {
                creep.memory.task = 'upgrade';
            }
        }

        // if creep is supposed to transfer energy
        if (creep.memory.working == true) {
            if (creep.room.name == creep.memory.room_home) {
                let target_construction = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
                if (target_construction && creep.memory.task == 'build') {
                    if(speak) {creep.say('Build');}
                    if (creep.build(target_construction) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target_construction);
                    }
                    return;
                }

                let target_spawn = creep.room.find(FIND_MY_SPAWNS, {filter: (s) => s.energy < s.energyCapacity})[0];
                if (target_spawn) {
                    if(speak){creep.say('Spawn');}
                    if (creep.transfer(target_spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        // move towards the spawn
                        creep.moveTo(target_spawn);
                    }
                    return;
                }

                if(speak){creep.say('Controller');}
                if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller);
                }
                return;
            }
            else {
                if(speak){creep.say('GoingHome');}
                var exit_direction = creep.room.findExitTo(creep.memory.room_home);
                creep.moveTo(creep.pos.findClosestByPath(exit_direction));
            }
        }
        // if creep is supposed to harvest energy from source
        else {
            if (creep.room.name == creep.memory.room_target) {
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
            else {
                // Find and move to target room
                if(speak){creep.say('GoToRoom');}
                var exit_direction = creep.room.findExitTo(creep.memory.room_target);
                creep.moveTo(creep.pos.findClosestByPath(exit_direction));
            }
        }
    }
};
