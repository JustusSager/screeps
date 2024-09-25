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
        let nameIndex = this.memory.nameIndex;
        let creepName = config.names[nameIndex];
        while (Game.creeps[creepName]) {
            creepName = config.names[++nameIndex];
        }
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
        this.memory.nameIndex = nameIndex;
        return this.spawnCreep(body, creepName, {role: role, task: {name: 'idle'}});

    }
}