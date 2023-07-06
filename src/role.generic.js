/*
Creep holt sich Energy aus Storage, Container oder Spawn und sucht die nächste Construction Site und baut diese.
Kann über memory.room_target auch zu Targets in anderen Räumen geschickt werden.
*/
require('prototype.creep')();
var taskBuilder = require('task.builder');
var taskUpgrader = require('task.upgrader');

module.exports = {
    // a function to run the logic for this role
    run: function(creep, speak) {
        if(!creep.memory.task) {
            creep.memory.task = "searching"
        }
        if(!creep.memory.target) {
            creep.memory.target = "searching"
        }

        if (creep.memory.task == "searching") {
            if (creep.room.memory.construction_sites.length > 0) {
                if (speak) creep.say("builder")
                creep.memory.task = "builder"
                creep.memory.target = creep.room.memory.construction_sites[0].id
            } else {
                if (speak) creep.say("upgrader")
                creep.memory.task = "upgrader"
                creep.memory.target = creep.room.controller.id
            }
        }

        if (creep.memory.task == "builder") {
            taskBuilder.run(creep, speak)
        } else if (creep.memory.task == "upgrader") {
            taskUpgrader.run(creep, speak)
        }

    }
}