var roleDefender = require('role.defender');
var roleHarvester = require('role.harvester');
var roleMiner = require('role.miner');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var roleUpgrader = require('role.upgrader');
var roleTransporter = require('role.transporter');
var roleDistributor = require('role.distributor');
var roleLongDistanceHarvester = require('role.longDistanceHarvester');
var roleClaimer = require('role.claimer');
var structSpawn = require('struct.spawn');
var structTower = require('struct.tower');

module.exports.loop = function () {
    // run spawners
    for (let i in Game.spawns) {
        structSpawn.run(Game.spawns[i]);
    }
    // run towers
    structTower.run();

    // run creeps
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];

        if (creep.memory.role == 'defender') {
            roleDefender.run(creep, false);
        }
        else if (creep.memory.role == 'harvester') {
            roleHarvester.run(creep, false);
        }
        else if (creep.memory.role == 'miner') {
            roleMiner.run(creep, false);
        }
        else if (creep.memory.role == 'builder') {
            roleBuilder.run(creep, false);
        }
        else if (creep.memory.role == 'repairer') {
            roleRepairer.run(creep, false);
        }
        else if (creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep, false);
        }
        else if (creep.memory.role == 'transporter') {
            roleTransporter.run(creep, false);
        }
        else if (creep.memory.role == 'distributor') {
            roleDistributor.run(creep, false);
        }
        else if (creep.memory.role == 'longDistanceHarvester') {
            roleLongDistanceHarvester.run(creep, false);
        }
        else if (creep.memory.role == 'claimer') {
            roleClaimer.run(creep, false);
        }
    }

    // clear memory
    for(var i in Memory.creeps) {
        if(!Game.creeps[i]) {
            delete Memory.creeps[i];
        }
    }
}
