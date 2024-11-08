require('prototype.spawn')();
require('prototype.creep')();
require('prototype.room')();
require('prototype.tower')();
const config = require('config');

function deref(objectID) {
    return Game.getObjectById(objectID) || Game.flags[objectID] || Game.creeps[objectID] || Game.spawns[objectID] || null;
}

module.exports.loop = function () {

    let spawn = Game.spawns['Spawn1'];
    spawn.initMemory();
    let room = spawn.room;
    let room_stage = room.memory.stage;
    room.updateMemory();

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

    for (let link_source_id of room.memory.link_source_ids) {
        try {
            let link_source = deref(link_source_id);
            if (link_source.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
                link_source.transferEnergy(deref(room.memory.link_storage_id));
            }

        } catch (e) {
        }
    }

    let harvesters = _.filter(creeps, creep => creep.memory.role === 'Harvester');
    let max_num_harvesters = _.filter(room.memory.source_metas, s => s['num_containers'] === 0 && s['num_links'] === 0).length +
        (room_stage < 3 ? 3 : 1);

    let miners = _.filter(creeps, creep => creep.memory.role === 'Miner');

    let transporters = _.filter(creeps, creep => creep.memory.role === 'Transporter');
    let max_num_transporters = _.filter(room.memory.source_metas, s => s['num_containers'] > 0 && s['num_links'] === 0).length;

    let upgraders = _.filter(creeps, creep => creep.memory.role === 'Upgrader');
    let max_num_upgraders = config.stageOptions.numUpgraders[room_stage];

    let builders = _.filter(creeps, creep => creep.memory.role === 'Builder');
    let max_num_builders =
        room_stage < 2 ?
        0 :
        (
            room_stage === 8 ?
            Math.min(4, Math.ceil(room.memory.construction_sites.all.length / 10)) :
            2 + Math.min(4, Math.floor(room.memory.construction_sites.all.length / 10))
        )

    let repairers = _.filter(creeps, creep => creep.memory.role === 'Repairer');
    let max_num_repairers = config.stageOptions.numRepairers[room_stage];

    let managers = _.filter(creeps, creep => creep.memory.role === 'Manager');
    let secretaries = _.filter(creeps, creep => creep.memory.role === 'Secretary');
    let creeps_without_role = _.filter(creeps, creep => !creep.memory.role || creep.memory.role === 'idle');
    let creeps_without_task = _.filter(creeps, creep => !creep.memory.task || !creep.memory.task.name || creep.memory.task.name === 'idle');

    let energyCapacity = spawn.room.energyCapacityAvailable;
    let energyAvailable = spawn.room.energyAvailable;
    let spawnResult = undefined;

    if (room_stage >= 4 && room.memory.storage_id !== undefined) {
        if (managers.length === 0) {
            spawnResult = spawn.createManagerCreep(energyAvailable);
        }
        if (secretaries.length < 1) {
            spawnResult = spawn.createTransporterCreep(energyAvailable, 'Secretary');
        }
    }
    if (room_stage >= 2 && harvesters.length > 0) {
        for (const [source_id, source_meta] of Object.entries(room.memory.source_metas)) {
            if (!_.some(miners, m => m.memory.sourceID === source_id)) {
                if (source_meta.num_links > 0) {
                    spawnResult = spawn.createMinerCreep(energyCapacity, source_id, true);
                } else if (source_meta.num_containers > 0) {
                    spawnResult = spawn.createMinerCreep(energyCapacity, source_id, false);
                }
                console.log('Spawn Miner: ' + spawnResult);
                break;
            }
        }
    }
    if (spawnResult === undefined) {
        if (room_stage >= 2 && transporters.length < max_num_transporters) {
            spawnResult = spawn.createTransporterCreep(energyCapacity, 'Transporter');
            console.log('Spawn Transporter: ' + spawnResult);
            if (spawnResult === ERR_NOT_ENOUGH_ENERGY && transporters.length === 0) {
                spawnResult = spawn.createTransporterCreep(energyAvailable, 'Transporter');
                console.log('Spawn microTransporter: ' + spawnResult);
            }
        } else if (harvesters.length < max_num_harvesters) {
            spawnResult = spawn.createGenericCreep(energyCapacity, "Harvester");
            console.log('Spawn Harvester: ' + spawnResult);
            if (spawnResult === ERR_NOT_ENOUGH_ENERGY && harvesters.length === 0) {
                spawnResult = spawn.createGenericCreep(energyAvailable, "Harvester");
                console.log('Spawn microHarvester: ' + spawnResult);
            }
        } else if (upgraders.length < max_num_upgraders) {
            spawnResult = spawn.createGenericCreep(energyCapacity, "Upgrader");
            console.log('Spawn Upgrader: ' + spawnResult);
        } else if (builders.length < max_num_builders) {
            spawnResult = spawn.createGenericCreep(energyCapacity, "Builder");
            console.log('Spawn Builder: ' + spawnResult);
        } else if (repairers.length < max_num_repairers) {
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
            'H: ' + harvesters.length + '/' + max_num_harvesters +
            ' U: ' + upgraders.length + '/' + max_num_upgraders +
            ' B: ' + builders.length + '/' + max_num_builders +
            ' R: ' + repairers.length + '/' + max_num_repairers +
            ' TM: ' + transporters.length + "/" + max_num_transporters;
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
