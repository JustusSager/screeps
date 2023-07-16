require('prototype.room')();
require('prototype.spawn')();
require('creep-tasks');

var basebuilding = require('basebuilding');

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
const roleSettler = require('role.settler');
var roleGeneric = require('role.generic');
var roleKing = require('role.king');
var roleQueen = require('role.queen');

var structSpawn = require('struct.spawn');
var structTower = require('struct.tower');
var structLink = require('struct.link');


module.exports.loop = function () {
    
    // Room memory
    for (let i in Game.rooms) {
        try {
            Game.rooms[i].handle_memory();
        } catch (error) {
            console.log(error);
        }
    }

    // run spawners
    for (let i in Game.spawns) {
        try {
            Game.spawns[i].init_memory();
            structSpawn.run(Game.spawns[i]);
        } catch (error) {
            console.log(error);
        }
        
    }
    // run towers and links
    try {
        structTower.run();
        structLink.run();
    } catch (error) {
        console.log(error);
    }


    // run creeps
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        // roleCreep.run(creep, false);

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
            // roleUpgrader.run(creep, false);
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
        else if (creep.memory.role == 'settler') {
            roleSettler.run(creep, false);
        }
        else if (creep.memory.role == 'generic') {
            roleGeneric.run(creep, true)
        }
        else if (creep.memory.role == 'king') {
            roleKing.run(creep, false)
        }
        else if (creep.memory.role == 'queen') {
            roleQueen.run(creep, false)
        }
    }
    try {
        basebuilding.run();
    } catch (error) {
        console.log(error)
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

    let creeps = _.values(Game.creeps);
    let upgraders = _.filter(creeps, creep => creep.memory.role.includes("upgrader"));

    for (let upgrader of upgraders) {
        if (upgrader.isIdle) {
            roleUpgrader.newTask(upgrader);
        }
    }
    for (let creep of upgraders) {
        creep.run();
    }
}
