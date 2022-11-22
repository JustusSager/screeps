/*
Creep sucht eine Energy Ressource und baut diese ab, bei vollem Inventar geht sie zum Spawn, Extensions, oder Towers, falls alle voll sucht sie ein Container oder Storage.
Kann auch verwendet werden um Energy in anderen Räumen abzubauen.
*/
var build = false;

module.exports = {
    // a function to run the logic for this role
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

        // if creep is supposed to transfer energy
        if (creep.memory.working == true) {
            if (creep.room.name == creep.memory.room_home) {
                let construction_target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
                if (construction_target && build) {
                    if(speak) {creep.say('Build');}
                    if (creep.build(construction_target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(construction_target);
                    }
                    build = false;
                    return;
                }
                if(speak){creep.say('Controller');}
                if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller);
                }
                build = true;
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
