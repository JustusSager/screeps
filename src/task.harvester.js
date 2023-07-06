/*
Creep holt sich Energy aus Storage, Container oder Spawn und sucht die nächste Construction Site und baut diese.
Kann über memory.room_target auch zu Targets in anderen Räumen geschickt werden.
*/
require('prototype.creep')();

module.exports = {
    // a function to run the logic for this role
    run: function(creep, speak) {
        if (creep.store.getFreeCapacity([RESOURCE_ENERGY]) > 0) {
            if (creep.room.name == creep.memory.room_target) {
                // find closest source
                var source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
                if(speak){creep.say('Source');}
                // try to harvest energy, if the source is not in range
                if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    // move towards the source
                    creep.moveTo(source);
                }
            } else {
                // Find and move to target room
                if(speak){creep.say('GoToRoom');}
                var exit_direction = creep.room.findExitTo(creep.memory.room_target);
                creep.moveTo(creep.pos.findClosestByPath(exit_direction));
            }
        } else {
            creep.say('Done');
            creep.memory.task = "searching"
            creep.memory.target = "searching"
            creep.memory.working = true;
        }
    }
};
