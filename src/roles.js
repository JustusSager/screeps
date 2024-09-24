function deref(objectID) {
    return Game.getObjectById(objectID) || Game.flags[objectID] || Game.creeps[objectID] || Game.spawns[objectID] || null;
}

function isEnergyStructure(structure) {
    return structure.energy !== undefined && structure.energyCapacity !== undefined;
}

function isStoreStructure(structure) {
    return structure.store !== undefined;
}

Creep.prototype.updateTask = function () {
    if (this.memory.role) {
        switch (this.memory.role) {
            case 'Harvester':
                if (!this.memory.task) {
                    this.memory.task = {
                        name: 'transfer',
                        targetID: this.findStoreEnergy() ? this.findStoreEnergy().id : null,
                        options: {resource: RESOURCE_ENERGY}
                    };
                }
                if (this.memory.task.name === 'harvest' && this.store.getFreeCapacity() === 0) {
                    this.memory.task = {
                        name: 'transfer',
                        targetID: this.findStoreEnergy() ? this.findStoreEnergy().id : null,
                        options: {resource: RESOURCE_ENERGY}
                    };
                } else if (this.memory.task.name === 'transfer' && this.store.getUsedCapacity() === 0) {
                    this.memory.task = {
                        name: 'harvest',
                        targetID: this.pos.findClosestByPath(FIND_SOURCES_ACTIVE).id
                    };
                }
                break;
            case 'Transporter':
                break;
            case 'Upgrader':
                if (!this.memory.task) {
                    this.memory.task = {
                        name: 'upgrade',
                        targetID: this.pos.findClosestByPath(this.room.controller.id),
                        options: {resource: RESOURCE_ENERGY}
                    };
                }
                if (this.memory.task.name === 'harvest' && this.store.getFreeCapacity() === 0) {
                    this.memory.task = {
                        name: 'upgrade',
                        targetID: this.pos.findClosestByPath(this.room.controller.id),
                        options: {resource: RESOURCE_ENERGY}
                    };
                } else if (this.memory.task.name === 'upgrade' && this.store.getUsedCapacity() === 0) {
                    this.memory.task = {
                        name: 'harvest',
                        targetID: this.pos.findClosestByPath(FIND_SOURCES_ACTIVE).id
                    };
                }
                break;
            default:
                break;
        }
    } else {
        this.resetRole()
        this.say("idle");
    }
}

Creep.prototype.findStoreEnergy = function (errorCode = 0) {
    return this.pos.findClosestByPath(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                return ((structure.structureType === STRUCTURE_SPAWN ||
                        structure.structureType === STRUCTURE_CONTAINER ||
                        structure.structureType === STRUCTURE_STORAGE ||
                        structure.structureType === STRUCTURE_LINK) &&
                    structure.store.getFreeCapacity() > 0)
            }
        }
    )
}


Creep.prototype.resetRole = function (errorCode = 0) {
    if (errorCode !== 0) {
        this.say(errorCode);
    }
    this.memory.role = undefined;
}
