module.exports = function () {
    // Creep Task initialise memory
    Creep.prototype.initTask = function () {
        if (this.memory.role && !this.memory.task) {
            this.memory.task = {name: 'idle'};
        }
    }

    // Creep Task update memory to new Task
    Creep.prototype.updateTask = function () {
        if (this.memory.role && this.memory.task.name === 'idle') {
            switch (this.memory.role) {
                case 'Harvester':
                    if (this.store[RESOURCE_ENERGY] > 0) {
                        this.say("🚋");
                        this.memory.task = {
                            name: 'transfer',
                            targetID: this.findStoreEnergy().id,
                            targetRange: 1,
                            options: {resource: RESOURCE_ENERGY}
                        };
                    } else {
                        this.say("⛏️");
                        this.memory.task = {
                            name: 'harvest',
                            targetID: this.pos.findClosestByPath(FIND_SOURCES_ACTIVE).id,
                            targetRange: 1
                        };
                    }
                    break;
                case 'Upgrader':
                    if (this.store[RESOURCE_ENERGY] > 0) {
                        this.say("🆙");
                        this.memory.task = {
                            name: 'upgrade',
                            targetID: this.room.controller.id,
                            targetRange: 2
                        };
                    } else {
                        this.say("⛏️");
                        this.memory.task = {
                            name: 'harvest',
                            targetID: this.pos.findClosestByPath(FIND_SOURCES_ACTIVE).id,
                            targetRange: 1
                        };
                    }
                    break;
                case 'Builder':
                    if (this.store[RESOURCE_ENERGY] > 0 && this.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES)) {
                        this.say("🔨");
                        this.memory.task = {
                            name: 'build',
                            targetID: this.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES).id,
                            targetRange: 2
                        };
                    } else if (this.store[RESOURCE_ENERGY] > 0 && this.findRepairSite()) {
                        this.say("🛠️");
                        this.memory.task = {
                            name: 'repair',
                            targetID: this.findRepairSite().id,
                            targetRange: 2
                        };
                    } else if (this.findDroppedResources()) {
                        this.say("🧺");
                        this.memory.task = {
                            name: 'pickup',
                            targetID: this.findDroppedResources().id,
                            targetRange: 1
                        };
                    } else if (this.findWithdrawEnergy()) {
                        this.say("🚋");
                        this.memory.task = {
                            name: 'withdraw',
                            targetID: this.findWithdrawEnergy().id,
                            targetRange: 1,
                            options: {resource: RESOURCE_ENERGY}
                        };
                    } else {
                        this.say("⛏️");
                        this.memory.task = {
                            name: 'harvest',
                            targetID: this.pos.findClosestByPath(FIND_SOURCES_ACTIVE).id,
                            targetRange: 1
                        };
                    }
                    break;
                default:
                    break;
            }
        }
    }

    // Creeps Basic functions -------------------------------------------------------------------------------------
    Creep.prototype.findStoreEnergy = function () {
        return this.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                filter: (s) => ((
                        s.structureType === STRUCTURE_SPAWN ||
                        s.structureType === STRUCTURE_EXTENSION)
                )
                // TODO: filtern nach freiem Platz
                // structure.store.getFreeCapacity() > 0 funktioniert nicht
            }
        )
    }

    Creep.prototype.findWithdrawEnergy = function () {
        return this.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.structureType === STRUCTURE_CONTAINER ||
                            structure.structureType === STRUCTURE_STORAGE ||
                            structure.structureType === STRUCTURE_LINK) &&
                        structure.store[RESOURCE_ENERGY] > 0)
                }
            }
        )
    }

    Creep.prototype.findDroppedResources = function () {
        return this.pos.findClosestByPath(FIND_DROPPED_RESOURCES || FIND_TOMBSTONES)
    }

    Creep.prototype.findSpawn = function () {
        return this.pos.findClosestByPath(FIND_MY_SPAWNS);
    }

    Creep.prototype.findRepairSite = function () {
        return this.pos.findClosestByPath(FIND_MY_STRUCTURES, {
            filter: (s) => s.structureType !== STRUCTURE_WALL && s.hits < s.hitsMax
        });

    }
}