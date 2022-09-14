/*
Creep geht in den Target Room und claimt den, in dem Raum vorhandenen Controller
*/
module.exports = {
    run: function(creep, speak) {
        if (creep.room.name == creep.memory.room_target) {
            if(speak){creep.say('ClaimController');}
            if (creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
        }
        else {
            if(speak){creep.say('GoToRoom');}
            var exit_direction = creep.room.findExitTo(creep.memory.room_target);
            creep.moveTo(creep.pos.findClosestByPath(exit_direction));
        }
    }
};