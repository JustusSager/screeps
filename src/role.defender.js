/*
Greift Hostiles im Target Room an
*/
module.exports = {
    run: function(creep, speak) {
        if (creep.room.name == creep.memory.room_target) {
            var target_hostile_creep = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
            if (target_hostile_creep) {
                if(creep.attack(target_hostile_creep) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target_hostile_creep);
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