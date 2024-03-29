require('prototype.room')();
require('prototype.spawn')();
require('prototype.flag')();
require('prototype.creep')();

var basebuilding = require('basebuilding');

var roleCreep = require('role.creep');
var roleDefender = require('role.defender');
var roleMiner = require('role.miner');
var roleTransporter = require('role.transporter');
var roleRemoteHarvestUpgrader = require('role.RemoteHarvestUpgrader');
var roleClaimer = require('role.claimer');
var roleKing = require('role.king');
var roleQueen = require('role.queen');

var structSpawn = require('struct.spawn');
var structTower = require('struct.tower');
var structLink = require('struct.link');

var taskManager = require('creep-tasks');
var trading = require('trading');

module.exports.loop = function () {
    
    // Room memory
    for (let i in Game.rooms) {
        try {
            Game.rooms[i].handle_memory();
        } catch (error) {
            console.log(error);
        }
    }
    
    trading.run();

    for (let i in Game.flags) {
        Game.flags[i].handle_memory();
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
        else if (creep.memory.role == 'miner') {
            roleMiner.run(creep, false);
        }
        else if (creep.memory.role == 'transporter') {
            roleTransporter.run(creep, false);
        }
        else if (creep.memory.role == 'longDistanceHarvester' || creep.memory.role == 'RemoteHarvestUpgrader') {
            roleRemoteHarvestUpgrader.run(creep, false);
        }
        else if (creep.memory.role == 'claimer') {
            roleClaimer.run(creep, false);
        }
        else if (creep.memory.role == 'king') {
            roleKing.run(creep, false)
        }
        else if (creep.memory.role == 'queen') {
            roleQueen.run(creep, false)
        }
    }

    let creeps_for_tasks = _.filter(Game.creeps, c => c.memory.role == 'generic' || c.memory.role == 'repairer' || c.memory.role == 'upgrader' || c.memory.role == 'extractor');
    for (var i in creeps_for_tasks) {
        taskManager.run(creeps_for_tasks[i]);
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
}
