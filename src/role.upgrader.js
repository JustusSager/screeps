/*
Creep holt sich Energy aus einem Container, Storage oder Spawn, geht zum Controller und upgradet ihn.
Bewegt sich nicht zwischen Räumen.
*/
let Tasks = require('creep-tasks')

let roleUpgrader = {
    newTask: function(creep) {
        if (creep.store[RESOURCE_ENERGY] > 0) {
            creep.task = Tasks.upgrade(creep.room.controller);
        } else {
            creep.task = Tasks.harvest(creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE));
        }
    }
};

module.exports = roleUpgrader;
