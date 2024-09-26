require('prototype.spawn')();
require('prototype.creep')();
require('prototype.room')();
require('tasks')();
const config = require('config');

module.exports.loop = function () {

    let spawn = Game.spawns['Spawn1'];
    spawn.initMemory();
    let room = spawn.room;
    room.updateMemory();
    room.updateConstructionSites();
    let creeps = _.values(Game.creeps);

    let harvesters = _.filter(creeps, creep => creep.memory.role === 'Harvester');
    let miners = _.filter(creeps, creep => creep.memory.role === 'Miner');
    let transporters = _.filter(creeps, creep => creep.memory.role === 'Transporter');
    let upgraders = _.filter(creeps, creep => creep.memory.role === 'Upgrader');
    let builders = _.filter(creeps, creep => creep.memory.role === 'Builder');
    let creeps_without_role = _.filter(creeps, creep => !creep.memory.role || creep.memory.role === 'idle');
    let creeps_without_task = _.filter(creeps, creep => !creep.memory.task || !creep.memory.task.name || creep.memory.task.name === 'idle');

    let energyCapacity = spawn.room.energyCapacityAvailable;
    let energyAvailable = spawn.room.energyAvailable;
    let spawnResult = undefined;

    if (harvesters.length > 0) {
        let sources = spawn.room.find(FIND_SOURCES);
        for (let source of sources) {
            if (!_.some(creeps, m => m.memory.sourceID === source.id && m.memory.role === 'Miner')) {
                if (source.pos.findInRange(FIND_STRUCTURES, 1, {filter: s => s.structureType === STRUCTURE_CONTAINER}).length > 0) {
                    spawnResult = spawn.createMinerCreep(energyCapacity, source.id);
                    console.log('Spawn Miner: ' + spawnResult);
                    break;
                }
            }
        }
    }
    if (spawnResult === undefined) {
        if (room.memory.stage > 1 && transporters.length < miners.length) {
            spawnResult = spawn.createTransporterCreep(energyCapacity);
            console.log('Spawn Transporter: ' + spawnResult);
            if (spawnResult === ERR_NOT_ENOUGH_ENERGY && transporters.length === 0) {
                spawnResult = spawn.createTransporterCreep(energyAvailable);
                console.log('Spawn microTransporter: ' + spawnResult);
            }
        } else if (harvesters.length < config.numHarvesters) {
            spawnResult = spawn.createGenericCreep(energyCapacity, "Harvester");
            console.log('Spawn Harvester: ' + spawnResult);
            if (spawnResult === ERR_NOT_ENOUGH_ENERGY && harvesters.length === 0) {
                spawnResult = spawn.createGenericCreep(energyAvailable, "Harvester");
                console.log('Spawn microHarvester: ' + spawnResult);
            }
        } else if (upgraders.length < config.numUpgraders) {
            spawnResult = spawn.createGenericCreep(energyCapacity, "Upgrader");
            console.log('Spawn Upgrader: ' + spawnResult);
        } else if (room.memory.stage > 1 && builders.length < config.numBuilders) {
            spawnResult = spawn.createGenericCreep(energyCapacity, "Builder");
            console.log('Spawn Builder: ' + spawnResult);
        }
    }

    for (let creep of creeps) {
        creep.initTask();
        creep.updateTask();
        creep.run();
    }

    for (let v of config.roomVisual) {
        let text_general =
            v.room + ' (' + Game.rooms[v.room].controller.level + ') ' + spawn.name +
            ': Energy: ' + Game.rooms[v.room].energyAvailable + '/' + Game.rooms[v.room].energyCapacityAvailable +
            ' Creeps: ' + creeps_without_role.length + "/" + creeps_without_task.length + "/" + creeps.length;
        let text_creeps =
            'H: ' + harvesters.length + '/' + config.numHarvesters +
            ' U: ' + upgraders.length + '/' + config.numUpgraders +
            ' B: ' + builders.length + '/' + config.numBuilders +
            ' TM: ' + transporters.length + "/" + miners.length;
        new RoomVisual(Game.rooms[v.room].name).text(text_general, v.x, v.y, {color: v.color, font: v.font});
        new RoomVisual(Game.rooms[v.room].name).text(text_creeps, v.x, v.y + 1, {color: v.color, font: v.font});
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
