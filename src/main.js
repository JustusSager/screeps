require('prototype.room')();

var bunkerbuilding = require('bunkerbuilding');

var roleCreep = require('role.creep');
var roleDefender = require('role.defender');
var roleHarvester = require('role.harvester');
var roleMiner = require('role.miner');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var roleUpgrader = require('role.upgrader');
var roleTransporter = require('role.transporter');
var roleDistributor = require('role.distributor');
var roleRemoteHarvestUpgrader = require('role.RemoteHarvestUpgrader');
var roleClaimer = require('role.claimer');
var structSpawn = require('struct.spawn');
var structTower = require('struct.tower');


module.exports.loop = function () {
    
    bunkerbuilding.run();

    // run spawners
    for (let i in Game.spawns) {
        
        structSpawn.run(Game.spawns[i]);
        
        // init room memory
        Game.spawns[i].room.init_memory();
        
        // update room memory
        Game.spawns[i].room.update_memory(false);
    }
    // run towers
    structTower.run();

    // run creeps
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        roleCreep.run(creep, false);

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
        else if (creep.memory.role == 'longDistanceHarvester' || creep.memory.role == 'RemoteHarvestUpgrader') {
            roleRemoteHarvestUpgrader.run(creep, false);
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
    for(var i in Memory.spawns) {
        if(!Game.spawns[i]) {
            delete Memory.spawns[i];
        }
    }
}
