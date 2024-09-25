require('prototype.spawn')();
require('prototype.creep')();
require('tasks')();
const config = require('config');

module.exports.loop = function () {

    let spawn = Game.spawns['Spawn1'];
    spawn.initMemory();
    let creeps = _.values(Game.creeps);

    let harvesters = _.filter(creeps, creep => creep.memory.role === 'Harvester');
    let upgraders = _.filter(creeps, creep => creep.memory.role === 'Upgrader');
    let builders = _.filter(creeps, creep => creep.memory.role === 'Builder');
    let creeps_without_role = _.filter(creeps, creep => !creep.memory.role || creep.memory.role === 'idle');
    let creeps_without_task = _.filter(creeps, creep => !creep.memory.task || !creep.memory.task.name || creep.memory.task.name === 'idle');

    let energyCapacity = spawn.room.energyCapacityAvailable;
    let energyAvailable = spawn.room.energyAvailable;
    let spawnResult = undefined;
    if (harvesters.length < config.numHarvesters) {
        if (creeps_without_role.length > 0) {
            creeps_without_role[0].memory.role = 'Harvester';
        } else {
            if (spawn.createGenericCreep(energyCapacity, "Harvester") === ERR_NOT_ENOUGH_ENERGY && harvesters.length === 0) {
                spawnResult = spawn.createGenericCreep(energyAvailable, "Harvester");
            }
        }
    } else if (upgraders.length < config.numUpgraders) {
        if (creeps_without_role.length > 0) {
            creeps_without_role[0].memory.role = 'Upgrader';
        } else {
            spawnResult = spawn.createGenericCreep(energyCapacity, "Upgrader");
        }
    } else if (builders.length < config.numBuilders) {
        if (creeps_without_role.length > 0) {
            creeps_without_role[0].memory.role = 'Builder';
        } else {
            spawnResult = spawn.createGenericCreep(energyCapacity, "Builder");
        }
    }
    if (spawnResult) {
        console.log("Spawning: " + spawnResult);
    }

    for (let creep of creeps) {
        creep.initTask();
        creep.updateTask();
        creep.run();
    }

    for (let v of config.roomVisual) {
        let text = v.room + ' (' + Game.rooms[v.room].controller.level + ') ' + spawn.name +
            ': E: ' + Game.rooms[v.room].energyAvailable + '/' + Game.rooms[v.room].energyCapacityAvailable +
            ' C: ' + creeps_without_role.length + "/" + creeps_without_task.length + "/" + creeps.length +
            ' H: ' + harvesters.length + '/' + config.numHarvesters +
            ' U: ' + upgraders.length + '/' + config.numUpgraders +
            ' B: ' + builders.length + '/' + config.numBuilders;
        new RoomVisual(Game.rooms[v.room].name).text(text, v.x, v.y, {color: v.color, font: v.font});
    }

    // clear memory
    for (let i in Memory.creeps) {
        if (!Game.creeps[i]) {
            delete Memory.creeps[i];
        }
    }
    for (let i in Memory.spawns) {
        if (!Game.spawns[i]) {
            delete Memory.spawns[i];
        }
    }
}
