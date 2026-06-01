/*
Greift Hostiles im Target Room an
*/
module.exports = {
    run: function(creep, speak) {
        if (creep.room.name == creep.memory.room_target) {
            var target_hostile_creep = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS || FIND_HOSTILE_STRUCTURES || FIND_HOSTILE_SPAWNS);
            var target_hostile_structure = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
                filter: (s) => s.structureType = STRUCTURE_TOWER || s.structureType == STRUCTURE_SPAWN
            })
            if (target_hostile_creep) {
                if(creep.attack(target_hostile_creep) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target_hostile_creep);
                }
            }
            else if (target_hostile_structure) {
                if(creep.attack(target_hostile_structure) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target_hostile_structure);
                }
            }
        }
        else {
            if(speak){creep.say('GoToRoom');}
            var exit_direction = creep.room.findExitTo(creep.memory.room_target);
            creep.moveTo(creep.pos.findClosestByPath(exit_direction));
        }
    }
};
