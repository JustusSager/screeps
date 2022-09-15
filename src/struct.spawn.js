require('prototype.spawn')();

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
        var numberDistributors = _.sum(Game.creeps, (c) => (c.memory.role == 'distributor' && c.memory.room_home == spawn.room.name));
        var numberHarvesters = _.sum(Game.creeps, (c) => (c.memory.role == 'harvester' && c.memory.room_home == spawn.room.name));
        var numberMiners = _.sum(Game.creeps, (c) => (c.memory.role == 'miner' && c.memory.room_home == spawn.room.name));
        var numberRepairers = _.sum(Game.creeps, (c) => (c.memory.role == 'repairer' && c.memory.room_home == spawn.room.name));
        var numberUpgraders = _.sum(Game.creeps, (c) => (c.memory.role == 'upgrader' && c.memory.room_home == spawn.room.name));
        var numberlongDistanceHarvesters = _.sum(Game.creeps, (c) => (c.memory.role == 'longDistanceHarvester' && c.memory.room_home == spawn.room.name));
        
        // Create body blueprint
        var longDistanceHarvesterBody = [WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
        
        //renew creep
        var creeps_in_range = spawn.pos.findInRange(FIND_MY_CREEPS, 1, {
            filter: (c) => c.ticksToLive < 1000 &&
                c.hitsMax > 1000
        })
        if (creeps_in_range.length > 0) {
            spawn.renewCreep(creeps_in_range[0])
        }

        // Spawn new creep
        var name = undefined;

        var energy_sources = spawn.room.find(FIND_SOURCES);
        var number_construction_sites = spawn.room.find(FIND_CONSTRUCTION_SITES).length;
        
        if (!spawn.spawning) {
            let creeps_in_room = Game.creeps;
            for (let source of energy_sources) {
                if (!_.some(creeps_in_room, c => c.memory.role == 'miner' && c.memory.source_id == source.id)) {
                    let containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
                        filter: s => s.structureType == STRUCTURE_CONTAINER
                    });
                    if (containers.length > 0) {
                        name = spawn.spawnCreep(
                            [WORK, WORK, WORK, WORK, WORK, MOVE], 'miner' + Game.time, {
                                memory: {
                                    role: 'miner',
                                    room_home: spawn.room.name,
                                    source_id: source.id
                                }
                            }
                        );
                        break;
                    }
                }
            }
        }
        
        if (!spawn.spawning && name != undefined) {
            if (spawn.room.find(FIND_HOSTILE_CREEPS).length > 0 || numberDefenders < spawn.memory.maxDefenders) {
                let energy = spawn.room.energyAvailable > 800 ? 800 : spawn.room.energyAvailable;
                name = spawn.createFighterCreep(energy, 'defender');
            }
            else if (numberMiners < energy_sources.length && numberHarvesters < spawn.memory.maxHarvesters) {
                let energy = spawn.room.energyAvailable > 800 ? 800 : spawn.room.energyAvailable;
                name = spawn.createBalancedCreep(energy, 'harvester');
            }
            else if (numberUpgraders < spawn.memory.maxUpgraders){
                let energy = spawn.room.energyAvailable > 800 ? 800 : spawn.room.energyAvailable;
                name = spawn.createBalancedCreep(energy, 'upgrader');
            }
            else if (numberBuilders < (number_construction_sites/3) + 1 && numberBuilders < spawn.memory.maxBuilders){
                let energy = spawn.room.energyAvailable > 800 ? 800 : spawn.room.energyAvailable;
                name = spawn.createBalancedCreep(energy, 'builder');
            }
            else if (numberRepairers < spawn.memory.maxRepairers){
                let energy = spawn.room.energyAvailable > 800 ? 800 : spawn.room.energyAvailable;
                name = spawn.createBalancedCreep(energy, 'repairer');
            }
            else if (numberTransporters < spawn.memory.maxTransporters) {
                let energy = spawn.room.energyAvailable > 800 ? 800 : spawn.room.energyAvailable;
                name = spawn.createCarrierCreep(energy, 'transporter');
            }
            else if (numberDistributors < spawn.memory.maxDistributors) {
                let energy = spawn.room.energyAvailable > 800 ? 800 : spawn.room.energyAvailable;
                name = spawn.createCarrierCreep(energy, 'distributor');
            }
            else if (spawn.memory.claim_room != undefined) {
                if (!(createWorkerCreep(spawn, [CLAIM, MOVE], 'claimer', false, spawn.memory.claim_room) < 0)) {
                    delete spawn.memory.claim_room;
                }
            }
            else if (numberlongDistanceHarvesters < spawn.memory.maxLongDistanceHarvesters) {
                name = createWorkerCreep(spawn, longDistanceHarvesterBody, 'longDistanceHarvester', false, 'E57S4');
            }
        }
        
        console.log(
            'Room: ' + spawn.room.name + ' ' + spawn.name + ': ' +
            'Defender: ' + numberDefenders + '/' + spawn.memory.maxDefenders + 
            ', Harvester: ' + numberHarvesters + '/' + (energy_sources.length - numberMiners) + '/' + spawn.memory.maxHarvesters + 
            ', Miner: ' + numberMiners + '/' + energy_sources.length + '/X' +
            ', Builder: ' + numberBuilders + '/' + ((number_construction_sites/3) + 1) + '/' + spawn.memory.maxBuilders + 
            ', Repairer: ' + numberRepairers + '/' + spawn.memory.maxRepairers + 
            ', Upgrader: ' + numberUpgraders + '/' + spawn.memory.maxUpgraders + 
            ', Transporter: ' + numberTransporters + '/' + spawn.memory.maxTransporters +
            ', Distributor: ' + numberDistributors + '/' + spawn.memory.maxDistributors +
            ', LongDistanceHarvester: ' + numberlongDistanceHarvesters + '/' + spawn.memory.maxLongDistanceHarvesters
        );
        
        if (name) {
            console.log(name);
        }
    }
};
