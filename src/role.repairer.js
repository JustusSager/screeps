/*
Creep holt sich Energy aus Storage, Container oder Spawn und sucht die nächste zu reparierende Structure und repariert diese. 
Falls es keine Structure zu reparieren gibt führt der creep die builder role aus.
Nur für einen Raum gedacht.
*/
require('prototype.creep')();
var roleBuilder = require('role.builder');

module.exports = {
    // a function to run the logic for this role
    run: function(creep, speak) {
        
        // if creep is bringing energy to the spawn but has no energy left
        if (creep.memory.working == true && creep.store[RESOURCE_ENERGY] == 0) {
            creep.say('GetEnergy');
            creep.memory.working = false;
        }
        // if creep is harvesting energy but is full
        else if (creep.memory.working == false && creep.store.getFreeCapacity([RESOURCE_ENERGY]) == 0) {
            creep.say('Repair');
            creep.memory.working = true;
        }

        // if creep is supposed to transfer energy to the spawn
        if (creep.memory.working == true) {
            var structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: (s) => s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL}); // find closest source
            if (structure != undefined) {
                if(speak){creep.say('Repair');}
                if (creep.repair(structure) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(structure);
                }
            }
            // try to transfer energy, if the spawn is not in range move towards the source
            else {
                roleBuilder.run(creep, speak);
            }
        }
        // if creep is supposed to get energy from target
        else {
            creep.getResourceEnergy(speak);
        }
    }
};