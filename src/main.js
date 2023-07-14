require('prototype.room')();
require('prototype.spawn')();

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
        Game.rooms[i].handle_memory();
    }

    // run spawners
    for (let i in Game.spawns) {
        // Init spawn memory
        Game.spawns[i].init_memory();
        
        structSpawn.run(Game.spawns[i]);
        
    }
    // run towers
    structTower.run();
    structLink.run();


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

    basebuilding.run();

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
