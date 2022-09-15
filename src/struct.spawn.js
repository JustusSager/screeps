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
    run: function() {
        for(var i in Game.spawns) {
            
            var numberDefenders = _.sum(Game.creeps, (c) => (c.memory.role == 'defender' && c.memory.room_home == Game.spawns[i].room.name));
            var numberBuilders = _.sum(Game.creeps, (c) => (c.memory.role == 'builder' && c.memory.room_home == Game.spawns[i].room.name));
            var numberTransporters = _.sum(Game.creeps, (c) => (c.memory.role == 'transporter' && c.memory.room_home == Game.spawns[i].room.name));
            var numberDistributors = _.sum(Game.creeps, (c) => (c.memory.role == 'distributor' && c.memory.room_home == Game.spawns[i].room.name));
            var numberHarvesters = _.sum(Game.creeps, (c) => (c.memory.role == 'harvester' && c.memory.room_home == Game.spawns[i].room.name));
            var numberMiners = _.sum(Game.creeps, (c) => (c.memory.role == 'miner' && c.memory.room_home == Game.spawns[i].room.name));
            var numberRepairers = _.sum(Game.creeps, (c) => (c.memory.role == 'repairer' && c.memory.room_home == Game.spawns[i].room.name));
            var numberUpgraders = _.sum(Game.creeps, (c) => (c.memory.role == 'upgrader' && c.memory.room_home == Game.spawns[i].room.name));
            var numberlongDistanceHarvesters = _.sum(Game.creeps, (c) => (c.memory.role == 'longDistanceHarvester' && c.memory.room_home == Game.spawns[i].room.name));
            
            // Create and check body blueprint
            var workerBody = [WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE];
            var longDistanceHarvesterBody = [WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
            var upgraderBody = [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];
            var transporterBody = [WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
            var fighterBody = [TOUGH, ATTACK, MOVE, MOVE];
            
            // Skip if Spawner already spawning
            if (Game.spawns[i].spawning) {
                continue;
            }
            
            // Spawn new creep
            var name = undefined;
            
            let sources = Game.spawns[i].room.find(FIND_SOURCES);
            let creeps_in_room = Game.creeps;
            for (let source of sources) {
                if (!_.some(creeps_in_room, c => c.memory.role == 'miner' && c.memory.source_id == source.id)) {
                    let containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
                        filter: s => s.structureType == STRUCTURE_CONTAINER
                    });
                    if (containers.length > 0) {
                        name = Game.spawns[i].spawnCreep(
                            [WORK, WORK, WORK, WORK, WORK, MOVE], 'miner' + Game.time, {
                                memory: {
                                    role: 'miner',
                                    room_home: Game.spawns[i].room.name,
                                    source_id: source.id
                                }
                            }
                        );
                        break;
                    }
                }
            }
            
            if (!Game.spawns[i].spawning) {
                if (Game.spawns[i].room.find(FIND_HOSTILE_CREEPS).length > 0 || numberDefenders < Game.spawns[i].memory.maxDefenders) {
                    let energy = Game.spawns[i].room.energyAvailable > 800 ? 800 : Game.spawns[i].room.energyAvailable;
                    name = Game.spawns[i].createFighterCreep(energy, 'defender');
                }
                else if (numberHarvesters < Game.spawns[i].memory.maxHarvesters) {
                    let energy = Game.spawns[i].room.energyAvailable > 800 ? 800 : Game.spawns[i].room.energyAvailable;
                    name = Game.spawns[i].createBalancedCreep(energy, 'harvester');
                }
                else if (numberUpgraders < Game.spawns[i].memory.maxUpgraders){
                    let energy = Game.spawns[i].room.energyAvailable > 800 ? 800 : Game.spawns[i].room.energyAvailable;
                    name = Game.spawns[i].createBalancedCreep(energy, 'upgrader');
                }
                else if (numberBuilders < Game.spawns[i].memory.maxBuilders){
                    let energy = Game.spawns[i].room.energyAvailable > 800 ? 800 : Game.spawns[i].room.energyAvailable;
                    name = Game.spawns[i].createBalancedCreep(energy, 'builder');
                }
                else if (numberRepairers < Game.spawns[i].memory.maxRepairers){
                    let energy = Game.spawns[i].room.energyAvailable > 800 ? 800 : Game.spawns[i].room.energyAvailable;
                    name = Game.spawns[i].createBalancedCreep(energy, 'repairer');
                }
                else if (numberTransporters < Game.spawns[i].memory.maxTransporters) {
                    let energy = Game.spawns[i].room.energyAvailable > 800 ? 800 : Game.spawns[i].room.energyAvailable;
                    name = Game.spawns[i].createCarrierCreep(energy, 'transporter');
                }
                else if (numberDistributors < Game.spawns[i].memory.maxDistributors) {
                    let energy = Game.spawns[i].room.energyAvailable > 800 ? 800 : Game.spawns[i].room.energyAvailable;
                    name = Game.spawns[i].createCarrierCreep(energy, 'distributor');
                }
                else if (Game.spawns[i].memory.claim_room != undefined) {
                    if (!(createWorkerCreep(Game.spawns[i], [CLAIM, MOVE], 'claimer', false, Game.spawns[i].memory.claim_room) < 0)) {
                        delete Game.spawns[i].memory.claim_room;
                    }
                }
                else if (numberlongDistanceHarvesters < Game.spawns[i].memory.maxLongDistanceHarvesters) {
                    name = createWorkerCreep(Game.spawns[i], longDistanceHarvesterBody, 'longDistanceHarvester', false, 'E57S4');
                }
            }
            
            console.log(
                'Room: ' + Game.spawns[i].room.name + ' ' + i + ': ' +
                'Defender: ' + numberDefenders + '/' + Game.spawns[i].memory.maxDefenders + 
                ', Harvester: ' + numberHarvesters + '/' + Game.spawns[i].memory.maxHarvesters + 
                ', Miner: ' + numberMiners +
                ', Builder: ' + numberBuilders + '/' + Game.spawns[i].memory.maxBuilders + 
                ', Repairer: ' + numberRepairers + '/' + Game.spawns[i].memory.maxRepairers + 
                ', Upgrader: ' + numberUpgraders + '/' + Game.spawns[i].memory.maxUpgraders + 
                ', Transporter: ' + numberTransporters + '/' + Game.spawns[i].memory.maxTransporters +
                ', Distributor: ' + numberDistributors + '/' + Game.spawns[i].memory.maxDistributors +
                ', LongDistanceHarvester: ' + numberlongDistanceHarvesters + '/' + Game.spawns[i].memory.maxLongDistanceHarvesters
            );
            
            if (name) {
                console.log(name);
            }
        }
    }
};