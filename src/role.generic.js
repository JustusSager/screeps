/*
Creep holt sich Energy aus Storage, Container oder Spawn und sucht die nächste Construction Site und baut diese.
Kann über memory.room_target auch zu Targets in anderen Räumen geschickt werden.
*/
require('prototype.creep')();

var taskHarvester = require('task.harvester');
var taskBuilder = require('task.builder');
var taskUpgrader = require('task.upgrader');
var taskTransporter = require('task.transporter');

module.exports = {
    // a function to run the logic for this role
    run: function(creep, speak) {
        if(!creep.memory.task) {
            creep.memory.task = "searching"
        }
        if(!creep.memory.target) {
            creep.memory.target = "searching"
        }

        if (creep.room.name != creep.memory.room_home) {
            let exit_direction = creep.room.findExitTo(creep.memory.room_home);
            creep.moveTo(creep.pos.findClosestByPath(exit_direction));
            return;
        }

        if (creep.memory.task == "searching") {
            if (creep.store.getFreeCapacity([RESOURCE_ENERGY]) > 0 && !creep.getResourceEnergy()) { // TODO funktioniert nicht
                creep.memory.task = "harvester";
                creep.memory.target = "energy_source";
            } else if (creep.room.energyAvailable < (creep.room.energyCapacityAvailable * 0.5)) {
                if (speak) creep.say("transporter");
                creep.memory.task = "transporter";
                creep.memory.target = "transporter";
            } else if (creep.room.memory.construction_sites && creep.room.memory.construction_sites.length > 0) {
                if (speak) creep.say("builder");
                creep.memory.task = "builder";
                creep.memory.target = creep.room.memory.construction_sites[0].id;
            } else if (!creep.room.memory.construction_sites && creep.room.find(FIND_CONSTRUCTION_SITES).length > 0) {
                creep.memory.task = "builder";
                creep.memory.target = creep.room.find(FIND_CONSTRUCTION_SITES)[0].id;
            }
            else {
                if (speak) creep.say("upgrader")
                creep.memory.task = "upgrader";
                creep.memory.target = creep.room.controller.id;
            }
        }

        if (creep.memory.task == "harvester") {
            taskHarvester.run(creep, speak);
        }
        else if (creep.memory.task == "transporter") {
            taskTransporter.run(creep, speak)
        }
        else if (creep.memory.task == "builder") {
            taskBuilder.run(creep, speak);
        } 
        else if (creep.memory.task == "upgrader") {
            taskUpgrader.run(creep, speak);
        }

    }
}