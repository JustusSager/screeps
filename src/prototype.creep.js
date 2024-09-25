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
                        this.switchTaskTransfer(this.findStoreEnergy().id);
                    } else if (this.pos.findClosestByPath(FIND_SOURCES_ACTIVE)) {
                        this.switchTaskHarvest(this.pos.findClosestByPath(FIND_SOURCES_ACTIVE).id);
                    }
                    break;
                case 'Miner':
                    this.memory.task = {
                        name: 'mine',
                        targetID: this.memory.sourceID,
                        targetRange: 1
                    }
                    break;
                case 'Upgrader':
                    if (this.store[RESOURCE_ENERGY] > 0) {
                        this.switchTaskUpgrade();
                    } else if (this.findWithdrawEnergy(this.store.getFreeCapacity())) {
                        this.switchTaskWithdraw(this.findWithdrawEnergy(this.store.getFreeCapacity()).id);
                    } else if (this.pos.findClosestByPath(FIND_SOURCES_ACTIVE)) {
                        this.switchTaskHarvest(this.pos.findClosestByPath(FIND_SOURCES_ACTIVE).id);
                    }
                    break;
                case 'Builder':
                    if (this.store[RESOURCE_ENERGY] > 0) {
                        if (this.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES)) {
                            this.switchTaskBuild(this.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES).id)
                        } else if (this.findRepairSite()) {
                            this.switchTaskRepair(this.findRepairSite().id);
                        } else {
                            this.switchTaskUpgrade();
                        }
                    } else {
                        if (this.findDroppedResources()) {
                            this.switchTaskPickup(this.findDroppedResources().id);
                        } else if (this.findWithdrawEnergy(this.store.getFreeCapacity())) {
                            this.switchTaskWithdraw(this.findWithdrawEnergy(this.store.getFreeCapacity()).id);
                        } else if (this.pos.findClosestByPath(FIND_SOURCES_ACTIVE)) {
                            this.switchTaskHarvest(this.pos.findClosestByPath(FIND_SOURCES_ACTIVE).id);
                        }
                    }
                    break;
                default:
                    break;
            }
        }
    }

// Creep Task switching functions ----------------------------------------------------------------------------------
    Creep.prototype.switchTaskHarvest = function (targetID) {
        this.say("⛏️");
        this.memory.task = {
            name: 'harvest',
            targetID: targetID,
            targetRange: 1
        };
    }
    Creep.prototype.switchTaskUpgrade = function () {
        this.say("🆙");
        this.memory.task = {
            name: 'upgrade',
            targetID: this.room.controller.id,
            targetRange: 2
        };
    }
    Creep.prototype.switchTaskBuild = function (targetID) {
        this.say("🔨");
        this.memory.task = {
            name: 'build',
            targetID: targetID,
            targetRange: 2
        };
    }
    Creep.prototype.switchTaskRepair = function (targetID) {
        this.say("🛠️");
        this.memory.task = {
            name: 'repair',
            targetID: targetID,
            targetRange: 2
        };
    }
    Creep.prototype.switchTaskTransfer = function (targetID, resource = RESOURCE_ENERGY) {
        this.say("🚋");
        this.memory.task = {
            name: 'transfer',
            targetID: targetID,
            targetRange: 1,
            options: {
                resource: resource
            }
        };
    }
    Creep.prototype.switchTaskPickup = function (targetID) {
        this.say("🧺");
        this.memory.task = {
            name: 'pickup',
            targetID: targetID,
            targetRange: 1
        };
    }
    Creep.prototype.switchTaskWithdraw = function (targetID, resource = RESOURCE_ENERGY) {
        this.say("⛽");
        this.memory.task = {
            name: 'withdraw',
            targetID: targetID,
            targetRange: 1,
            options: {
                resource: resource
            }
        };
    }


// Creeps find functions -------------------------------------------------------------------------------------------
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

    Creep.prototype.findWithdrawEnergy = function (amount = 0) {
        return this.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.structureType === STRUCTURE_CONTAINER ||
                            structure.structureType === STRUCTURE_STORAGE ||
                            structure.structureType === STRUCTURE_LINK) &&
                        structure.store[RESOURCE_ENERGY] >= amount)
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
