require('prototype.room')();
require('prototype.spawn')();
require('prototype.flag')();
require('prototype.creep')();

var basebuilding = require('basebuilding');

var roleDefender = require('role.defender');
var roleMiner = require('role.miner');
var roleTransporter = require('role.transporter');
var roleClaimer = require('role.claimer');

var structSpawn = require('struct.spawn');
var structTower = require('struct.tower');
var structLink = require('struct.link');

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
        creep.run(speak = true);
    }

    /*
    try {
        basebuilding.run();
    } catch (error) {
        console.log(error)
    }
    */

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
