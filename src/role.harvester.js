/*
Creep sucht eine Energy Ressource und baut diese ab, bei vollem Inventar geht sie zum Spawn, Extensions, oder Towers, falls alle voll sucht sie ein Container oder Storage.
Kann auch verwendet werden um Energy in anderen Räumen abzubauen.
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

        // if creep is supposed to transfer energy
        if (creep.memory.working == true) {
            if (creep.room.name == creep.memory.room_home) {
                var target = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_SPAWN ||
                                structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_TOWER) &&
                                structure.energy < structure.energyCapacity;
                    }
                })[0];
                if (target) {
                    if(speak){creep.say('Spawn');}
                    if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
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
                    if(speak){creep.say('Storage');}
                    if (creep.transfer(target_container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target_container);
                    }
                }
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
