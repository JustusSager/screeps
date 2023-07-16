require('creep-tasks');

var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');


module.exports.loop = function () {

    let spawn = Game.spawns['Spawn1'];
    let creeps = _.values(Game.creeps);

    let harvesters = _.filter(creeps, creep => creep.name.includes("Harvester"));
    let upgraders = _.filter(creeps, creep => creep.name.includes("Upgrader"));

    if (harvesters.length < 1) {
        spawn.spawnCreep([WORK, CARRY, MOVE], "Harvester" + Game.time);
    } else if (upgraders.length < 1) {
        spawn.spawnCreep([WORK, CARRY, MOVE], "Upgrader" + Game.time);
    }


    for (let harvester of harvesters) {
        if (harvester.isIdle) {
            roleHarvester.newTask(harvester);
        }
    }
    for (let upgrader of upgraders) {
        if (upgrader.isIdle) {
            roleUpgrader.newTask(upgrader);
        }
    }

    for (let creep of creeps) {
        creep.run();
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
