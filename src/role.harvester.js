let Tasks = require('creep-tasks');

let roleHarvester = {

    // Harvesters harvest from sources, preferring unattended ones and deposit to Spawn1
    // This module demonstrates the RoomObject.targetedBy functionality

    newTask: function (creep) {
        if (creep.store.getFreeCapacity() > 0) {
            let sources = creep.room.find(FIND_SOURCES);
            creep.task = Tasks.harvest(creep, sources[0]);
        } else {
            let spawn = Game.spawns['Spawn1'];
            creep.task = Tasks.transfer(creep, spawn);
        }
    }

};

module.exports = roleHarvester;
