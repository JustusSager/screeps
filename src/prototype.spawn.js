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
            case 'Harvester':
                creepName = creepName + ' ⛏️';
                maxSize = config.maxSizeHarvester;
                break;
            case 'Upgrader':
                creepName = creepName + ' 🆙';
                maxSize = config.maxSizeUpgrader;
                break;
            case 'Builder':
                creepName = creepName + ' 🔨';
                maxSize = config.maxSizeBuilder;
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

        return this.spawnCreep(body, creepName, {memory: {
            role: role, task: {name: 'idle'}
        }});

    }
    StructureSpawn.prototype.createMinerCreep = function (energy, sourceID) {
        if (energy < 250) return ERR_NOT_ENOUGH_ENERGY;

        let new_energy = energy - 50;
        let numOfParts = Math.floor(new_energy / 100);
        let body = [];
        for (let i = 0; i < numOfParts && i < 5; i++) {
            body.push(WORK);
        }
        body.push(MOVE);
        let creepName = config.names[this.memory.nameIndex];
        this.memory.nameIndex = this.memory.nameIndex + 1;
        return this.spawnCreep(body, creepName + ' 🧨', {memory: {
            role: 'Miner',
            sourceID: sourceID,
            task: {name: 'idle'}
        }});
    }
    StructureSpawn.prototype.createTransporterCreep = function (energy) {
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
        this.memory.nameIndex = this.memory.nameIndex + 1;
        return this.spawnCreep(body, creepName + ' 🚋', {memory: {
            role: 'Transporter',
            task: {name: 'idle'}
        }});
    }
}
