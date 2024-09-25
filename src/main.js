require('prototype.spawn')();
require('roles');
require('tasks');
const config = require('config');

module.exports.loop = function () {

    let spawn = Game.spawns['Spawn1'];
    let creeps = _.values(Game.creeps);

    let harvesters = _.filter(creeps, creep => creep.memory.role === 'Harvester');
    let upgraders = _.filter(creeps, creep => creep.memory.role === 'Upgrader');
    let builders = _.filter(creeps, creep => creep.memory.role === 'Builder');
    let creeps_without_role = _.filter(creeps, creep => !creep.memory.role || creep.memory.role === 'idle');

    console.log("H" + harvesters.length + "/" + config.numHarvesters +
        " U" + upgraders.length + "/" + config.numUpgraders +
        " B" + builders.length + "/" + config.numBuilders +
        " I" + creeps_without_role.length);

    let energyCapacity = spawn.room.energyCapacityAvailable;
    let energyAvailable = spawn.room.energyAvailable;
    if (harvesters.length < config.numHarvesters) {
        if (creeps_without_role.length > 0) {
            creeps_without_role[0].memory.role = 'Harvester';
        } else {
            if (spawn.createGenericCreep(energyCapacity, "Harvester") === ERR_NOT_ENOUGH_ENERGY && harvesters.length === 0) {
                spawn.createGenericCreep(energyAvailable, "Harvester");
            }
        }
    } else if (upgraders.length < config.numUpgraders) {
        if (creeps_without_role.length > 0) {
            creeps_without_role[0].memory.role = 'Upgrader';
        } else {
            spawn.createGenericCreep(energyCapacity, "Upgrader");
        }
    } else if (builders.length < config.numBuilders) {
        if (creeps_without_role.length > 0) {
            creeps_without_role[0].memory.role = 'Builder';
        } else {
            spawn.createGenericCreep(energyCapacity, "Builder");
        }
    }

    for (let creep of creeps) {
        creep.initTask();
        creep.updateTask();
        creep.run();
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
