module.exports = function() {

    StructureSpawn.prototype.init_memory = 
    function() {
        if (!this.memory.max_spawn_energy) {
            this.memory.max_spawn_energy = 300;
        }
        if (!this.memory.target_remote_harvesting) {
            this.memory.target_remote_harvesting = [];
        }
        if (!this.memory.maxHarvesters) {
            this.memory.maxHarvesters = 2;
        }
        if (!this.memory.maxRepairers) {
            this.memory.maxRepairers = 1;
        }
        if (!this.memory.maxUpgraders) {
            this.memory.maxUpgraders = 1;
        }
        if (!this.memory.maxLongDistanceHarvesters) {
            this.memory.maxLongDistanceHarvesters = 0;
        }
        if (!this.memory.maxDefenders) {
            this.memory.maxDefenders = 0;
        }
        if (!this.memory.maxGenerics) {
            this.memory.maxGenerics = 1;
        }
    }

    StructureSpawn.prototype.createBalancedCreep = 
    function(role, room_target) {
        let energy = this.room.energyAvailable > this.memory.max_spawn_energy ? this.memory.max_spawn_energy : this.room.energyAvailable;
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

            return this.spawnCreep(body, "ROOK" + Game.time, { memory: {
                role: role,
                working: true,
                room_home: this.room.name,
                room_target: room_target
            }});
        }
    }
    
    StructureSpawn.prototype.createFighterCreep =
    function(role, room_target) {
        let energy = this.room.energyAvailable > this.memory.max_spawn_energy ? this.memory.max_spawn_energy : this.room.energyAvailable;
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
        }});
    }

    StructureSpawn.prototype.createCarrierCreep =
    function(role) {
        let energy = this.room.energyAvailable > this.memory.max_spawn_energy ? this.memory.max_spawn_energy : this.room.energyAvailable;
        var number_of_parts = Math.floor(energy / 100);
        if (number_of_parts > 0) {
            var body = [];
            for (let i = 0; i < number_of_parts; i++) {
                body.push(CARRY);
            }
            for (let i = 0; i < number_of_parts; i++) {
                body.push(MOVE);
            }

            return this.spawnCreep(body, (role != 'queen' ? "BISHOP": "QUEEN") + Game.time, { memory: {
                role: role,
                working: true,
                room_home: this.room.name,
                room_target: this.room.name
            }});
        }
    }

    StructureSpawn.prototype.createMinerCreep =
    function(role, source_id, link_mining) {
        let energy = this.room.energyAvailable > this.memory.max_spawn_energy ? this.memory.max_spawn_energy : this.room.energyAvailable;
        var number_of_parts = 0;
        if (link_mining) {
            var number_of_parts = Math.floor((energy - 100) / 100);
        } else {
            var number_of_parts = Math.floor((energy - 50) / 100);
        }
        if (number_of_parts > 0) {
            var body = [];
            for (let i = 0; i < number_of_parts && i < 6; i++) {
                body.push(WORK);
            }
            if (link_mining) {
                body.push(CARRY)
            }
            body.push(MOVE);
            return this.spawnCreep(body, "PAWN" + Game.time, { memory: {
                role: role,
                room_home: this.room.name,
                source_id: source_id,
                link_mining: link_mining
            }});
        }
    }

    StructureSpawn.prototype.createKingCreep =
    function(target) {
        let energy = this.room.energyAvailable > this.memory.max_spawn_energy ? this.memory.max_spawn_energy : this.room.energyAvailable;
        var number_of_parts = Math.floor((energy - 50) / 50) > 4 ? 4 : Math.floor((energy - 50) / 50);
        if (number_of_parts > 0) {
            var body = [];
            for (let i = 0; i < number_of_parts; i++) {
                body.push(CARRY);
            }
            body.push(MOVE);
        }
        return this.spawnCreep(body, "KING", { memory: {
            role: "king",
            room_home: this.room.name,
            target: target
        }});
    }
};
