require('roles');
require('tasks');

module.exports.loop = function () {

    let spawn = Game.spawns['Spawn1'];
    let creeps = _.values(Game.creeps);

    let harvesters = _.filter(creeps, creep => creep.memory.role === 'Harvester');
    let upgraders = _.filter(creeps, creep => creep.memory.role === 'Upgrader');
    let creeps_without_role = _.filter(creeps, creep => !creep.memory.role || creep.memory.role === 'idle');

    console.log("H" + harvesters.length + " U" + upgraders.length + " I" + creeps_without_role.length);

    if (harvesters.length < 3) {
        if (creeps_without_role.length > 0) {
            creeps_without_role[0].memory.role = 'Harvester';
        } else {
            spawn.spawnCreep([WORK, CARRY, MOVE], "Harvester" + Game.time, {
                memory: {role: 'Harvester'}
            });
        }
    } else if (upgraders.length < 2) {
        if (creeps_without_role.length > 0) {
            creeps_without_role[0].memory.role = 'Upgrader';
        } else {
            spawn.spawnCreep([WORK, CARRY, MOVE], "Upgrader" + Game.time, {
                memory: {role: 'Upgrader'}
            });
        }
    }

    for (let creep of creeps) {
        creep.initTask();
        creep.updateTask();
        creep.run();
    }

    // clear memory
    for (var i in Memory.creeps) {
        if (!Game.creeps[i]) {
            delete Memory.creeps[i];
        }
    }
    for (var i in Memory.spawns) {
        if (!Game.spawns[i]) {
            delete Memory.spawns[i];
        }
    }
}