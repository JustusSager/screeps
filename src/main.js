require('prototype.spawn')();
require('prototype.creep')();
require('prototype.room')();
const config = require('config');

module.exports.loop = function () {

    let spawn = Game.spawns['Spawn1'];
    spawn.initMemory();
    let room = spawn.room;
    let room_stage = room.memory.stage;
    room.updateMemory();
    room.updateConstructionSites();

    let creeps = _.values(Game.creeps);
    for (let creep of creeps) {
        try {
            creep.initTask();
            creep.run();
        } catch (e) {
            console.log(e);
        }
    }

    let towers = room.find(FIND_MY_STRUCTURES, {filter: s => s.structureType === STRUCTURE_TOWER});
    for (let tower of towers) {
        try {
            tower.run();
        } catch (e) {
            console.log(e);
        }

    }

    let harvesters = _.filter(creeps, creep => creep.memory.role === 'Harvester');
    let miners = _.filter(creeps, creep => creep.memory.role === 'Miner');
    let transporters = _.filter(creeps, creep => creep.memory.role === 'Transporter');
    let upgraders = _.filter(creeps, creep => creep.memory.role === 'Upgrader');
    let builders = _.filter(creeps, creep => creep.memory.role === 'Builder');
    let repairers = _.filter(creeps, creep => creep.memory.role === 'Repairer');
    let managers = _.filter(creeps, creep => creep.memory.role === 'Manager');
    let secretaries = _.filter(creeps, creep => creep.memory.role === 'Secretary');
    let creeps_without_role = _.filter(creeps, creep => !creep.memory.role || creep.memory.role === 'idle');
    let creeps_without_task = _.filter(creeps, creep => !creep.memory.task || !creep.memory.task.name || creep.memory.task.name === 'idle');

    let energyCapacity = spawn.room.energyCapacityAvailable;
    let energyAvailable = spawn.room.energyAvailable;
    let spawnResult = undefined;

    if (room_stage >= 2 && harvesters.length > 0) {
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
        if (room_stage >= 4 && spawn.pos.findInRange(FIND_MY_STRUCTURES, 2, {
            filter: s => s.structureType === STRUCTURE_STORAGE
        })) {
            if (managers.length === 0) {
                spawnResult = spawn.createManagerCreep(energyAvailable);
            }
            if (secretaries.length < 1) {
                spawnResult = spawn.createTransporterCreep(energyAvailable, 'Secretary');
            }
        }
        if (room_stage >= 2 && transporters.length < miners.length) {
            spawnResult = spawn.createTransporterCreep(energyCapacity, 'Transporter');
            console.log('Spawn Transporter: ' + spawnResult);
            if (spawnResult === ERR_NOT_ENOUGH_ENERGY && transporters.length === 0) {
                spawnResult = spawn.createTransporterCreep(energyAvailable, 'Transporter');
                console.log('Spawn microTransporter: ' + spawnResult);
            }
        } else if (harvesters.length < config.stageOptions.numHarvesters[room_stage]) {
            spawnResult = spawn.createGenericCreep(energyCapacity, "Harvester");
            console.log('Spawn Harvester: ' + spawnResult);
            if (spawnResult === ERR_NOT_ENOUGH_ENERGY && harvesters.length === 0) {
                spawnResult = spawn.createGenericCreep(energyAvailable, "Harvester");
                console.log('Spawn microHarvester: ' + spawnResult);
            }
        } else if (upgraders.length < config.stageOptions.numUpgraders[room_stage]) {
            spawnResult = spawn.createGenericCreep(energyCapacity, "Upgrader");
            console.log('Spawn Upgrader: ' + spawnResult);
        } else if (builders.length < config.stageOptions.numBuilders[room_stage]) {
            spawnResult = spawn.createGenericCreep(energyCapacity, "Builder");
            console.log('Spawn Builder: ' + spawnResult);
        } else if (repairers.length < config.stageOptions.numRepairers[room_stage]) {
            spawnResult = spawn.createGenericCreep(energyCapacity, "Repairer");
            console.log('Spawn Repairer: ' + spawnResult);
        }
    }

    for (let v of config.roomVisual) {
        let text_general =
            v.room + ' (RCL ' + Game.rooms[v.room].controller.level + ' Stage ' + room_stage + ') ' + spawn.name +
            ': Energy: ' + Game.rooms[v.room].energyAvailable + '/' + Game.rooms[v.room].energyCapacityAvailable +
            ' Creeps: ' + creeps_without_role.length + "/" + creeps_without_task.length + "/" + creeps.length;
        let text_creeps =
            'H: ' + harvesters.length + '/' + config.stageOptions.numHarvesters[room_stage] +
            ' U: ' + upgraders.length + '/' + config.stageOptions.numUpgraders[room_stage] +
            ' B: ' + builders.length + '/' + config.stageOptions.numBuilders[room_stage] +
            ' R: ' + repairers.length + '/' + config.stageOptions.numRepairers[room_stage] +
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
