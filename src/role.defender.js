/*
Greift Hostiles im Target Room an
*/
module.exports = {
    run: function(creep, speak) {
        if (creep.room.name == creep.memory.room_target) {
            var target = creep.room.find(FIND_HOSTILE_CREEPS)[0];
            if (target) {
                if(creep.attack(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
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