/*
Creep holt sich Energy aus Storage, Container oder Spawn und sucht die nächste Construction Site und baut diese.
Kann über memory.room_target auch zu Targets in anderen Räumen geschickt werden.
*/
require('prototype.creep')();

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
            creep.getResourceEnergy(speak);
        }
    }
};