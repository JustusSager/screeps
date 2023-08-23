require('prototype.spawn')();

var config = require('config');

var RemoteHarvesterTargetsCounter = 0;

function body_cost(body_blueprint) {
    var result = 0;
    for (var i in body_blueprint) {
        switch (body_blueprint[i]) {
            case WORK:
                result = result + 100;
                break;
            case CARRY:
                result = result + 50;
                break;
            case MOVE:
                result = result + 50;
                break;
            case CLAIM:
                result = result + 600;
                break;
        }
    }
    return result;
}

function createWorkerCreep(spawner, body_blueprint, role, urgent, room_target) {
    if (urgent && spawner.room.energyAvailable < body_cost(body_blueprint)) {
        console.log('creating tiny creep');
        var body_blueprint = [WORK, CARRY, MOVE];
    }
    if (spawner.room.energyAvailable < body_cost(body_blueprint)) {
        console.log('Warning: Not enough energy to spawn ' + role + ' creep');
        return;
    }
    var code = spawner.spawnCreep(body_blueprint, role + Game.time, {
        memory: {
            role: role,
            working: true,
            room_home: spawner.room.name,
            room_target: room_target
        }
    });
    return code;
}

module.exports = {
    run: function(spawn) {

        var numberDefenders = _.sum(Game.creeps, (c) => (c.memory.role == 'defender' && c.memory.room_home == spawn.room.name));
        var numberExtractors = _.sum(Game.creeps, (c) => (c.memory.role == 'extractor' && c.memory.room_home == spawn.room.name));
        var numberTransporters = _.sum(Game.creeps, (c) => (c.memory.role == 'transporter' && c.memory.room_home == spawn.room.name));
        var numberGenerics = _.sum(Game.creeps, (c) => (c.memory.role == 'generic' && c.memory.room_home == spawn.room.name && c.memory.room_home == c.memory.room_target));
        var numberRemoteGenerics = _.sum(Game.creeps, (c) => (c.memory.role == 'generic' && c.memory.room_target && c.memory.room_home == spawn.room.name && c.memory.room_home != c.memory.room_target));
        var numberMiners = _.sum(Game.creeps, (c) => (c.memory.role == 'miner' && c.memory.room_home == spawn.room.name));
        var numberRepairers = _.sum(Game.creeps, (c) => (c.memory.role == 'repairer' && c.memory.room_home == spawn.room.name));
        var numberUpgraders = _.sum(Game.creeps, (c) => (c.memory.role == 'upgrader' && c.memory.room_home == spawn.room.name));
        var numberKings = _.sum(Game.creeps, (c) => (c.memory.role == 'king' && c.memory.room_home == spawn.room.name));
        var numberQueens = _.sum(Game.creeps, (c) => (c.memory.role == 'queen' && c.memory.room_home == spawn.room.name));

        var numHarvest = _.sum(Game.creeps, (c) => (c.memory.task && c.memory.task.name == 'harvest' && c.memory.room_home == spawn.room.name));
        var numUpgrade = _.sum(Game.creeps, (c) => (c.memory.task && c.memory.task.name == 'upgrade' && c.memory.room_home == spawn.room.name));
        var numBuild = _.sum(Game.creeps, (c) => (c.memory.task && c.memory.task.name == 'build' && c.memory.room_home == spawn.room.name));
        var numRepair = _.sum(Game.creeps, (c) => (c.memory.task && c.memory.task.name == 'repair' && c.memory.room_home == spawn.room.name));
        var numWithdraw = _.sum(Game.creeps, (c) => (c.memory.task && c.memory.task.name == 'withdraw' && c.memory.room_home == spawn.room.name));
        var numPickup = _.sum(Game.creeps, (c) => (c.memory.task && c.memory.task.name == 'pickup' && c.memory.room_home == spawn.room.name));
        var numTransfer = _.sum(Game.creeps, (c) => (c.memory.task && c.memory.task.name == 'transfer' && c.memory.room_home == spawn.room.name));

        //renew creep
        var creeps_in_range = spawn.pos.findInRange(FIND_MY_CREEPS, 1, {
            filter: (c) => c.ticksToLive < 1400 &&
                c.hitsMax > 1000
        })
        if (creeps_in_range.length > 0 && spawn.energy > 100) {
            spawn.renewCreep(creeps_in_range[0])
        }
        

        // Spawn new creep
        var name = undefined;

        if (!spawn.spawning && spawn.room.energyAvailable >= 150) {
            let creeps_in_room = Game.creeps;
            for (let source of spawn.room.memory.energy_sources) {
                if (!_.some(creeps_in_room, c => c.memory.role == 'miner' && c.memory.source_id == source.id)) {
                    let energy = spawn.room.energyAvailable > spawn.memory.max_spawn_energy ? spawn.memory.max_spawn_energy : spawn.room.energyAvailable;
                    let containers = Game.getObjectById(source.id).pos.findInRange(FIND_STRUCTURES, 1, {
                        filter: s => s.structureType == STRUCTURE_CONTAINER
                    });
                    let links = Game.getObjectById(source.id).pos.findInRange(FIND_STRUCTURES, 2, {
                        filter: s => s.structureType == STRUCTURE_LINK
                    });
                    if (links.length > 0) {
                        name = spawn.createMinerCreep(energy, 'miner', source.id, true);
                        break;
                    }
                    else if (containers.length > 0) {
                        name = spawn.createMinerCreep(energy, 'miner', source.id, false);
                        break;
                    }
                }
            }
            for (let mineral_source_id of spawn.room.memory.mineral_sources) {
                if (!Game.getObjectById(mineral_source_id).pos.inRangeTo(STRUCTURE_EXTRACTOR, 1)) {
                    continue;
                }
                if (!_.some(creeps_in_room, c => c.memory.role == 'miner' && c.memory.source_id == mineral_source_id)) {
                    let energy = spawn.room.energyAvailable > spawn.memory.max_spawn_energy ? spawn.memory.max_spawn_energy : spawn.room.energyAvailable;
                    let containers = Game.getObjectById(mineral_source_id).pos.findInRange(FIND_STRUCTURES, 1, {
                        filter: s => s.structureType == STRUCTURE_CONTAINER
                    });
                    if (containers.length > 0) {
                        name = spawn.createMinerCreep(energy, 'miner', mineral_source_id, false);
                        break;
                    }
                }
                
            }
        }

        if (!spawn.spawning && name == undefined) {
            if ((spawn.room.find(FIND_HOSTILE_CREEPS).length > 0 || !spawn.memory.target_attack) && numberDefenders < spawn.memory.maxDefenders) {
                let energy = spawn.room.energyAvailable > spawn.memory.max_spawn_energy ? spawn.memory.max_spawn_energy : spawn.room.energyAvailable;
                let target = spawn.memory.target_attack ? spawn.memory.target_attack : spawn.room.name
                name = spawn.createFighterCreep(energy, 'defender', target);
            }
            else if (numberGenerics < spawn.memory.maxGenerics) {
                let energy = spawn.room.energyAvailable > spawn.memory.max_spawn_energy ? spawn.memory.max_spawn_energy : spawn.room.energyAvailable;
                name = spawn.createBalancedCreep(energy, 'generic', spawn.room.name);
            }
            else if (numberKings < 1 && spawn.room.controller.level > 4){
                let energy = spawn.room.energyAvailable > spawn.memory.max_spawn_energy ? spawn.memory.max_spawn_energy : spawn.room.energyAvailable;
                target = _.filter(Game.flags, f => f.room == spawn.room && f.name.includes('BunkerFlag'))[0].name;
                name = spawn.createKingCreep(energy, target);
            }
            else if (numberQueens < 1 && spawn.room.controller.level > 4){
                let energy = spawn.room.energyAvailable > spawn.memory.max_spawn_energy ? spawn.memory.max_spawn_energy : spawn.room.energyAvailable;
                name = spawn.createCarrierCreep(energy, 'queen');
            }
            else if (numberUpgraders < spawn.memory.maxUpgraders){
                let energy = spawn.room.energyAvailable > spawn.memory.max_spawn_energy ? spawn.memory.max_spawn_energy : spawn.room.energyAvailable;
                name = spawn.createBalancedCreep(energy, 'upgrader', spawn.room.name);
            }
            else if (numberTransporters < ((numberMiners - (spawn.room.memory.source_links ? spawn.room.memory.source_links.length : 0)) * config.structureSpawn.transporterMultiplier + Math.floor(spawn.room.memory.amount_dropped_energy / 1000))) {
                let energy = spawn.room.energyAvailable > spawn.memory.max_spawn_energy ? spawn.memory.max_spawn_energy : spawn.room.energyAvailable;
                name = spawn.createCarrierCreep(energy, 'transporter');
            }
            else if (numberRepairers < spawn.memory.maxRepairers){
                let energy = spawn.room.energyAvailable > spawn.memory.max_spawn_energy ? spawn.memory.max_spawn_energy : spawn.room.energyAvailable;
                name = spawn.createBalancedCreep(energy, 'repairer', spawn.room.name);
            }
            else if (numberExtractors < 1 && spawn.room.find(FIND_MY_STRUCTURES, s => s.structureType == STRUCTURE_EXTRACTOR && s.room.name == spawn.room.name).length > 0) {
                let energy = spawn.room.energyAvailable > 600 ? 600 : spawn.room.energyAvailable;
                name = spawn.createBalancedCreep(energy, 'extractor', spawn.room.name);
            }
            else if (spawn.memory.claim_room != undefined) {
                if (!(createWorkerCreep(spawn, [CLAIM, MOVE], 'claimer', false, spawn.memory.claim_room) < 0)) {
                    delete spawn.memory.claim_room;
                }
            }
            else if (numberRemoteGenerics < spawn.memory.maxLongDistanceHarvesters && spawn.memory.target_remote_harvesting.length > 0) {
                let energy = spawn.room.energyAvailable > spawn.memory.max_spawn_energy ? spawn.memory.max_spawn_energy : spawn.room.energyAvailable;
                name = spawn.createBalancedCreep(energy, 'generic', spawn.memory.target_remote_harvesting[RemoteHarvesterTargetsCounter%2]);
                RemoteHarvesterTargetsCounter++;
                if (RemoteHarvesterTargetsCounter == spawn.memory.target_remote_harvesting.length) {
                    RemoteHarvesterTargetsCounter = 0;
                }
            }
        }
        let text_role = spawn.room.name + ' (' + spawn.room.controller.level + ') ' + spawn.name +
          ': E' + spawn.room.energyAvailable + '/' + spawn.room.energyCapacityAvailable +
          ' M' + numberMiners + '/' + spawn.room.memory.energy_sources.length +
          ' Def' + numberDefenders + '/' + spawn.memory.maxDefenders +
          ' G' + numberGenerics + '/' + spawn.memory.maxGenerics +
          ' RG' + numberRemoteGenerics + '/' + spawn.memory.maxLongDistanceHarvesters +
          ' K' + numberKings + 
          ' Q' + numberQueens +
          ' U' + numberUpgraders + '/' + spawn.memory.maxUpgraders +
          ' T' + numberTransporters + '/' + ((numberMiners - (spawn.room.memory.source_links ? spawn.room.memory.source_links.length : 0)) * config.structureSpawn.transporterMultiplier + Math.floor(spawn.room.memory.amount_dropped_energy / 1000)) +
          ' R' + numberRepairers + '/' + spawn.memory.maxRepairers +
          ' Ex' + numberExtractors + '/' + spawn.room.memory.mineral_sources.length
          

        let text_task = 'Tasks: ' +
            ' H' + numHarvest + 
            ' B' + numBuild + 
            ' R' + numRepair +
            ' U'  + numUpgrade +
            ' W' + numWithdraw + 
            ' P' + numPickup + 
            ' T' + numTransfer


        new RoomVisual(spawn.room.name).text(text_role, 25, 2, {color: 'green', font: 0.8});
        new RoomVisual(spawn.room.name).text(text_task, 25, 3, {color: 'green', font: 0.8});

        console.log(text_role);
        console.log(text_task);

        if (name) {
            console.log(name);
        }
    }
};
