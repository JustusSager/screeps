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
        for (let i = 0; i < numOfParts; i++) {
            body.push(WORK);
        }
        for (let i = 0; i < numOfParts; i++) {
            body.push(CARRY);
        }
        for (let i = 0; i < numOfParts; i++) {
            body.push(MOVE);
        }
        let creepName = config.names[this.memory.nameIndex];
        switch(role) {
            case 'Harvester':
                creepName = creepName + ' ⛏️';
                break;
            case 'Upgrader':
                creepName = creepName + ' 🆙';
                break;
            case 'Builder':
                creepName = creepName + ' 🔨';
                break;
        }
        this.memory.nameIndex = this.memory.nameIndex + 1;
        return this.spawnCreep(body, creepName, {role: role, task: {name: 'idle'}});

    }

    StructureSpawn.prototype.createMinerCreep = function (energy, sourceID) {
        if (energy < 250) {
            return ERR_NOT_ENOUGH_ENERGY;
        }
        let new_energy = energy - 50;
        let numOfParts = Math.floor(new_energy / 100) > 5 ? 5 : Math.floor(new_energy / 100);
        let body = [];
        for (let i = 0; i < numOfParts; i++) {
            body.push(WORK);
        }
        body.push(MOVE);
        let creepName = config.names[this.memory.nameIndex];
        this.memory.nameIndex = this.memory.nameIndex + 1;
        return this.spawnCreep(body, creepName + ' 🧨', {
            role: 'Miner',
            sourceID: sourceID,
            task: {name: 'idle'}
        })
    }
}