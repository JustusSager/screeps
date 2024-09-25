require("prototypes");

function deref(objectID) {
    return Game.getObjectById(objectID) || Game.flags[objectID] || Game.creeps[objectID] || Game.spawns[objectID] || null;
}

function isEnergyStructure(structure) {
    return structure.energy !== undefined && structure.energyCapacity !== undefined;
}

function isStoreStructure(structure) {
    return structure.store !== undefined;
}

Creep.prototype.initTask = function () {
    if (this.memory.role && !this.memory.task) {
        this.memory.task.name = 'idle';
    }
}

Creep.prototype.updateTask = function () {
    if (this.memory.role && this.memory.task.name === 'idle') {
        switch (this.memory.role) {
            case 'Harvester':
                if (this.store[RESOURCE_ENERGY] > 0) {
                    this.memory.task = {
                        name: 'transfer',
                        targetID: this.findSpawn().id,
                        options: {resource: RESOURCE_ENERGY}
                    };
                } else {
                    this.memory.task = {
                        name: 'harvest',
                        targetID: this.pos.findClosestByPath(FIND_SOURCES_ACTIVE).id
                    };
                }
                break;
            case 'Upgrader':
                if (this.store[RESOURCE_ENERGY] > 0) {
                    this.memory.task = {
                        name: 'upgrade',
                        targetID: this.room.controller.id
                    };
                } else {
                    this.memory.task = {
                        name: 'harvest',
                        targetID: this.pos.findClosestByPath(FIND_SOURCES_ACTIVE).id
                    };
                }
                break;
            default:
                break;
        }
    }
}
