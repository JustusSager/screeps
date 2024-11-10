const config = require('config')

module.exports = function () {
    StructureSpawn.prototype.initMemory = function () {
        if (!this.memory.nameIndex || this.memory.nameIndex > config.names.length) {
            this.memory.nameIndex = 0;
        }
    }

    StructureSpawn.prototype.createGenericCreep = function (energy, role) {
        const numOfParts = Math.floor(energy / 200);
        let body = [];
        let maxSize = 15;
        let creepName = config.names[this.memory.nameIndex];
        switch (role) {
            case config.CREEP_HARVESTER:
                creepName = creepName + ' ⛏️';
                maxSize = config.maxSizeHarvester;
                break;
            case config.CREEP_WORKER:
                creepName = creepName + ' 🛠️';
                maxSize = config.maxSizeWorker;
                break;
        }
        this.memory.nameIndex = this.memory.nameIndex + 1;
        for (let i = 0; i < numOfParts && i < maxSize; i++) {
            body.push(WORK);
        }
        for (let i = 0; i < numOfParts && i < maxSize; i++) {
            body.push(CARRY);
        }
        for (let i = 0; i < numOfParts && i < maxSize; i++) {
            body.push(MOVE);
        }

        return this.spawnCreep(body, creepName, {
            memory: {
                role: role, task: {name: 'idle'}
            },
            directions: [TOP, RIGHT]
        });

    }
    StructureSpawn.prototype.createMinerCreep = function (energy, sourceID, linkMiner) {
        if (linkMiner && energy < 300) return ERR_NOT_ENOUGH_ENERGY;
        if (!linkMiner && energy < 250) return ERR_NOT_ENOUGH_ENERGY;

        let new_energy = energy - 50;
        if (linkMiner) new_energy -= 50;
        let numOfParts = Math.floor(new_energy / 100);
        let body = [];
        for (let i = 0; i < numOfParts && i < 6; i++) {
            body.push(WORK);
        }
        if (linkMiner) body.push(CARRY)
        body.push(MOVE);
        let creepName = config.names[this.memory.nameIndex];
        this.memory.nameIndex = this.memory.nameIndex + 1;
        return this.spawnCreep(body, creepName + ' 🧨', {
            memory: {
                role: config.CREEP_MINER,
                sourceID: sourceID,
                task: {name: 'idle'}
            },
            directions: [TOP, RIGHT]
        });
    }
    StructureSpawn.prototype.createTransporterCreep = function (energy, role) {
        if (energy < 150) return ERR_NOT_ENOUGH_ENERGY;

        let numOfParts = Math.floor(energy / 150);
        let body = [];
        for (let i = 0; i < numOfParts && i < config.maxSizeTransporter; i++) {
            body.push(CARRY);
            body.push(CARRY)
        }
        for (let i = 0; i < numOfParts && i < config.maxSizeTransporter; i++) {
            body.push(MOVE);
        }
        let creepName = config.names[this.memory.nameIndex];
        if (role === config.CREEP_TRANSPORTER) creepName = creepName + ' 🚋';
        if (role === config.CREEP_SECRETARY) creepName = creepName + ' 🗒️';
        this.memory.nameIndex = this.memory.nameIndex + 1;
        return this.spawnCreep(body, creepName, {
            memory: {
                role: role,
                task: {name: 'idle'}
            },
            directions: [TOP, RIGHT]
        });
    }
    StructureSpawn.prototype.createManagerCreep = function (energy) {
        if (energy < 150) return ERR_NOT_ENOUGH_ENERGY;

        let numOfParts = Math.floor(energy / 50);
        let body = [];
        for (let i = 0; i < numOfParts && i < config.maxSizeManager; i++) {
            body.push(CARRY);
        }
        let creepName = config.names[this.memory.nameIndex];
        this.memory.nameIndex = this.memory.nameIndex + 1;
        return this.spawnCreep(body, creepName + ' 📓', {
            memory: {
                role: config.CREEP_MANAGER,
                task: {name: 'idle'}
            },
            directions: [BOTTOM_LEFT]
        });
    }
}
