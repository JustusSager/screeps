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
        // easiers memory access as constants
        const max_spawn_energy = spawn.room.memory.max_spawn_energy;
        const energy_available = spawn.room.energyAvailable;
        const numDefenders = spawn.room.memory.creepRoles_current.defenders
        const numMiners = spawn.room.memory.creepRoles_current.miners
        const numTransporters = spawn.room.memory.creepRoles_current.transporters;
        const numWorkers = spawn.room.memory.creepRoles_current.workers;
        const maxDefenders = spawn.room.memory.creepRoles_max.defenders;
        const target_attack = spawn.memory.target_attack;

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

        if (!spawn.spawning && energy_available >= 150) {
            let creeps_in_room = Game.creeps;
            for (let source of spawn.room.memory.energy_sources) {
                if (!_.some(creeps_in_room, c => c.memory.role == 'miner' && c.memory.source_id == source.id)) {
                    let energy = energy_available > max_spawn_energy ? max_spawn_energy : energy_available;
                    let links = Game.getObjectById(source.id).pos.findInRange(FIND_STRUCTURES, 2, {
                        filter: s => s.structureType == STRUCTURE_LINK
                    });
                    let source_keepers = Game.getObjectById(source.id).pos.findInRange(FIND_STRUCTURES, 10, {
                        filter: s => s.structureType == STRUCTURE_KEEPER_LAIR
                    });
                    if (source_keepers == 0) {
                        name = spawn.createMinerCreep(energy, 'miner', source.id, (links > 0));
                    }
                    
                }
            }
            for (let mineral_source_id of spawn.room.memory.mineral_sources) {
                if (!Game.getObjectById(mineral_source_id).pos.inRangeTo(STRUCTURE_EXTRACTOR, 1)) {
                    continue;
                }
                if (!_.some(creeps_in_room, c => c.memory.role == 'miner' && c.memory.source_id == mineral_source_id)) {
                    let energy = energy_available > max_spawn_energy ? max_spawn_energy : energy_available;
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
            if ((spawn.room.find(FIND_HOSTILE_CREEPS).length > 0 || !target_attack) && numDefenders < maxDefenders) {
                let energy = energy_available > max_spawn_energy ? max_spawn_energy : energy_available;
                let target = target_attack ? target_attack : spawn.room.name
                name = spawn.createFighterCreep(energy, 'defender', target);
            }
            else if (numTransporters < (numMiners)) {
                let energy = energy_available > max_spawn_energy ? max_spawn_energy : energy_available;
                name = spawn.createCarrierCreep(energy, 'transporter');
            }
            else if (numWorkers < (1 + Math.floor(spawn.room.memory.amount_dropped_energy / 250))) {
                let energy = energy_available > max_spawn_energy ? max_spawn_energy : energy_available;
                name = spawn.createBalancedCreep(energy, 'worker');
            }
        }

        if (name) {
            console.log(name);
        }
    }
};
