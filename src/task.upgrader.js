/*
Creep holt sich Energy aus Storage, Container oder Spawn und sucht die nächste Construction Site und baut diese.
Kann über memory.room_target auch zu Targets in anderen Räumen geschickt werden.
*/
require('prototype.creep')();

module.exports = {
    // a function to run the logic for this role
    run: function(creep, speak) {
        // if creep is bringing energy to the spawn but has no energy left
        if (creep.memory.working == true && creep.store[RESOURCE_ENERGY] == 0) {
            creep.say('GetEnergy');
            creep.memory.working = false;
            creep.memory.task = "searching"
            creep.memory.target = "searching"
        }
        // if creep is harvesting energy but is full
        else if (creep.memory.working == false && creep.store.getFreeCapacity([RESOURCE_ENERGY]) == 0) {
            creep.say('Upgrade');
            creep.memory.working = true;
        }

        // if creep is supposed to transfer energy to the spawn
        if (creep.memory.working == true) {
            if (creep.memory.room_target != undefined && creep.room.name != creep.memory.room_target) {
                if(speak){creep.say('GoToRoom');}
                var exit_direction = creep.room.findExitTo(creep.memory.room_target);
                creep.moveTo(creep.pos.findClosestByPath(exit_direction));
            }
            else if (creep.memory.target != undefined && Game.getObjectById(creep.memory.target)) {
                if (creep.upgradeController(Game.getObjectById(creep.memory.target)) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.target));
                }
            }
            else {
                creep.memory.task = "searching"
                creep.memory.target = "searching"
            }
        }
        // if creep is supposed to get energy from target
        else {
            if (!creep.getResourceEnergy(speak)) {
                creep.memory.task = "searching"
                creep.memory.target = "searching"
            }
        }
    }
};
