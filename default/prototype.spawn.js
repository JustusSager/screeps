var config = require('config');

const CREEP_TYPE_WORKER = "worker"
const CREEP_TYPE_CARRIER = "transporter"
const CREEP_TYPE_MINER = "miner"

module.exports = function() {

    // --------------------------------------------------------------------------------------------------------
    // SPAWNING
    // --------------------------------------------------------------------------------------------------------

    StructureSpawn.prototype.spawn_from_sketch = function(sketch, energy) {
        switch (sketch.role) {
            case CREEP_TYPE_WORKER:
                return this.spawn_worker(energy, this.name);
            case CREEP_TYPE_CARRIER:
                return this.spawn_carrier(energy);
            case CREEP_TYPE_MINER:
                return this.spawn_miner(energy, sketch.source_id, sketch.link_mining);
        }
    }

    StructureSpawn.prototype.spawn_worker = function(energy, room_target) {
        let number_of_parts = Math.floor(energy / 200);
        if (number_of_parts > 0) {
            var body = [];
            for (let i = 0; i < number_of_parts; i++) {
                body.push(WORK);
            }
            for (let i = 0; i < number_of_parts; i++) {
                body.push(CARRY);
            }
            for (let i = 0; i < number_of_parts; i++) {
                body.push(MOVE);
            }

            return this.spawnCreep(body, "PAWN" + Game.time, { memory: {
                role: CREEP_TYPE_WORKER,
                working: true,
                room_home: this.room.name,
                room_target: room_target
            },
            directions: [TOP, RIGHT]});
        }
    }
    
    StructureSpawn.prototype.spawn_fighter = function(energy, role, room_target) {
        var number_of_parts = Math.floor(energy / 190);
        if (number_of_parts > 0) {
            var body = [];
            for (let i = 0; i < number_of_parts; i++) {
                body.push(TOUGH);
            }
            for (let i = 0; i < number_of_parts; i++) {
                body.push(ATTACK);
            }
            for (let i = 0; i < number_of_parts; i++) {
                body.push(MOVE);
                body.push(MOVE);
            }
        }

        return this.spawnCreep(body, "KNIGHT" + Game.time, { memory: {
            role: role,
            working: true,
            room_home: this.room.name,
            room_target: room_target
        },
        directions: [TOP, RIGHT]});
    }

    StructureSpawn.prototype.spawn_carrier = function(energy) {
        var number_of_parts = Math.floor(energy / 100);
        if (number_of_parts > 0) {
            var body = [];
            for (let i = 0; i < number_of_parts; i++) {
                body.push(CARRY);
            }
            for (let i = 0; i < number_of_parts; i++) {
                body.push(MOVE);
            }

            return this.spawnCreep(body, "BISHOP" + Game.time, { memory: {
                role: CREEP_TYPE_CARRIER,
                working: true,
                room_home: this.room.name,
                room_target: this.room.name
            },
            directions: [TOP, RIGHT]});
        }
    }

    StructureSpawn.prototype.spawn_miner = function(energy, source_id, link_mining) {
        var number_of_parts = 0;
        if (link_mining) {
            var number_of_parts = Math.floor((energy - 100) / 100);
        } else {
            var number_of_parts = Math.floor((energy - 50) / 100);
        }
        if (number_of_parts > config.minerCreepMaxWorkParts) {
            number_of_parts = config.minerCreepMaxWorkParts;
        }
        if (number_of_parts > 0) {
            var body = [];
            for (let i = 0; i < number_of_parts; i++) {
                body.push(WORK);
            }
            if (link_mining) {
                body.push(CARRY)
            }
            body.push(MOVE);
            return this.spawnCreep(body, "ROOK" + Game.time, { memory: {
                role: CREEP_TYPE_MINER,
                room_home: this.room.name,
                source_id: source_id,
                link_mining: link_mining
            },
            directions: [TOP, RIGHT]});
        }
    }

    // --------------------------------------------------------------------------------------------------------
    // RENEW
    // --------------------------------------------------------------------------------------------------------

    StructureSpawn.prototype.renew_creeps_in_range = function() {
        let creeps_in_range = this.pos.findInRange(FIND_MY_CREEPS, 1, {
            filter: (c) => c.ticksToLive < 1400 &&
                c.hitsMax > 1000
        })
        if (creeps_in_range.length > 0 && spawn.energy > 100) {
            spawn.renewCreep(creeps_in_range[0])
        }
    }
};
