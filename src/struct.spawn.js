require('prototype.spawn')();

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
        var numberBuilders = _.sum(Game.creeps, (c) => (c.memory.role == 'builder' && c.memory.room_home == spawn.room.name));
        var numberTransporters = _.sum(Game.creeps, (c) => (c.memory.role == 'transporter' && c.memory.room_home == spawn.room.name));
        var numberGenerics = _.sum(Game.creeps, (c) => (c.memory.role == 'generic' && c.memory.room_home == spawn.room.name));
        var numberHarvesters = _.sum(Game.creeps, (c) => (c.memory.role == 'harvester' && c.memory.room_home == spawn.room.name));
        var numberMiners = _.sum(Game.creeps, (c) => (c.memory.role == 'miner' && c.memory.room_home == spawn.room.name));
        var numberRepairers = _.sum(Game.creeps, (c) => (c.memory.role == 'repairer' && c.memory.room_home == spawn.room.name));
        var numberUpgraders = _.sum(Game.creeps, (c) => (c.memory.role == 'upgrader' && c.memory.room_home == spawn.room.name));
        var numberRemoteHarvesters = _.sum(Game.creeps, (c) => (c.memory.role == 'longDistanceHarvester' && c.memory.room_home == spawn.room.name));
        var numberKings = _.sum(Game.creeps, (c) => (c.memory.role == 'king' && c.memory.room_home == spawn.room.name));
        var numberQueens = _.sum(Game.creeps, (c) => (c.memory.role == 'queen' && c.memory.room_home == spawn.room.name));

        //renew creep
        var creeps_in_range = spawn.pos.findInRange(FIND_MY_CREEPS, 1, {
            filter: (c) => c.ticksToLive < 200 &&
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
                    let containers = Game.getObjectById(source.id).pos.findInRange(FIND_STRUCTURES, 1, {
                        filter: s => s.structureType == STRUCTURE_CONTAINER
                    });
                    let links = Game.getObjectById(source.id).pos.findInRange(FIND_STRUCTURES, 2, {
                        filter: s => s.structureType == STRUCTURE_LINK
                    });
                    if (links.length > 0) {
                        name = spawn.createMinerCreep('miner', source.id, true);
                        break;
                    }
                    else if (containers.length > 0) {
                        name = spawn.createMinerCreep('miner', source.id, false);
                        break;
                    }
                }
            }
        }

        if (!spawn.spawning && name == undefined) {
            if ((spawn.room.find(FIND_HOSTILE_CREEPS).length > 0 || !spawn.memory.target_attack) && numberDefenders < spawn.memory.maxDefenders) {
                let target = spawn.memory.target_attack ? spawn.memory.target_attack : spawn.room.name
                name = spawn.createFighterCreep('defender', target);
            }
            else if (numberMiners < spawn.room.memory.energy_sources.length && numberHarvesters < spawn.memory.maxHarvesters) {
                name = spawn.createBalancedCreep('harvester', spawn.room.name);
            }
            else if (numberGenerics < spawn.memory.maxGenerics) {
                name = spawn.createBalancedCreep('generic', spawn.room.name);
            }
            else if (numberUpgraders < spawn.memory.maxUpgraders){
                name = spawn.createBalancedCreep('upgrader', spawn.room.name);
            }
            else if (numberTransporters < (numberMiners * 2 + Math.ceil(spawn.room.memory.amount_dropped_energy / 1000))) {
                name = spawn.createCarrierCreep('transporter');
            }
            else if (numberRepairers < spawn.memory.maxRepairers){
                name = spawn.createBalancedCreep('repairer', spawn.room.name);
            }
            else if (numberKings < 1){
                target = _.filter(Game.flags, f => f.room = spawn.room && f.name == 'BunkerFlag')[0].name;
                name = spawn.createKingCreep(target);
            }
            else if (numberQueens < 1){
                name = spawn.createCarrierCreep('queen');
            }
            else if (spawn.memory.claim_room != undefined) {
                if (!(createWorkerCreep(spawn, [CLAIM, MOVE], 'claimer', false, spawn.memory.claim_room) < 0)) {
                    delete spawn.memory.claim_room;
                }
            }
            else if (numberRemoteHarvesters < spawn.memory.maxLongDistanceHarvesters && spawn.memory.target_remote_harvesting.length > 0) {
                name = spawn.createBalancedCreep('longDistanceHarvester', spawn.memory.target_remote_harvesting[RemoteHarvesterTargetsCounter%2]);
                RemoteHarvesterTargetsCounter++;
                if (RemoteHarvesterTargetsCounter == spawn.memory.target_remote_harvesting.length) {
                    RemoteHarvesterTargetsCounter = 0;
                }
            }
        }
        let text = spawn.room.name + ' (' + spawn.room.controller.level + ') ' + spawn.name +
          ': E: ' + spawn.room.energyAvailable + '/' + spawn.room.energyCapacityAvailable +
          ' Def: ' + numberDefenders + '/' + spawn.memory.maxDefenders +
          ' H: ' + numberHarvesters + '/' + (spawn.room.memory.energy_sources.length - numberMiners) + '/' + spawn.memory.maxHarvesters +
          ' M: ' + numberMiners + '/' + spawn.room.memory.energy_sources.length +
          ' G: ' + numberGenerics + '/' + spawn.memory.maxGenerics +
          ' R: ' + numberRepairers + '/' + spawn.memory.maxRepairers +
          ' B: ' + numberBuilders + '/' + Math.floor(spawn.room.memory.num_construction_sites/5) + 
          ' U: ' + numberUpgraders + '/' + spawn.memory.maxUpgraders +
          ' T: ' + numberTransporters + '/' + (numberMiners * 2 + Math.ceil(spawn.room.memory.amount_dropped_energy / 1000)) +
          ' RH: ' + numberRemoteHarvesters + '/' + spawn.memory.maxLongDistanceHarvesters

        new RoomVisual(spawn.room.name).text(text, 25, 2, {color: 'green', font: 0.8});

        console.log(text);

        if (name) {
            console.log(name);
        }
    }
};
