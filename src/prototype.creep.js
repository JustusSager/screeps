const config = require('config');

module.exports = function () {

    // Creep Task initialise memory
    Creep.prototype.initTask = function () {
        if (!this.memory.role) {
            this.memory.role = 'idle';
        }
        if (!this.memory.task) {
            this.memory.task = {
                name: 'idle'
            };
        }
    }

    // Creep Task update memory to new Task
    Creep.prototype.updateTask = function () {
        if (this.memory.role && this.memory.task.name === 'idle') {
            let target = undefined;
            switch (this.memory.role) {
                case 'Transporter':
                    // Transfer energy to Spawn or Extensions
                    target = this.findStoreSpawnExtension();
                    if (this.store[RESOURCE_ENERGY] > 0 && target) {
                        return this.switchTaskTransfer(target.id);
                    }
                    // transfer energy into storage
                    target = this.findStoreStorage();
                    if (this.store[RESOURCE_ENERGY] > 0 && target) {
                        return this.switchTaskTransfer(target.id);
                    }
                    // get dropped energy
                    target = this.findGetDroppedResource(RESOURCE_ENERGY, this.store.getFreeCapacity());
                    if (target) {
                        return this.switchTaskPickup(target.id);
                    }
                    // get energy from containers
                    target = this.findGetContainer(RESOURCE_ENERGY, this.store.getFreeCapacity());
                    if (target) {
                        return this.switchTaskWithdraw(target.id);
                    }
                    break;
                case 'Harvester':
                    // Transfer energy to Spawn or Extensions
                    target = this.findStoreSpawnExtension();
                    if (this.store[RESOURCE_ENERGY] > 0 && target) {
                        return this.switchTaskTransfer(target.id);
                    }
                    // transfer energy into storage
                    target = this.findStoreStorage();
                    if (this.store[RESOURCE_ENERGY] > 0 && target) {
                        return this.switchTaskTransfer(target.id);
                    }
                    // get dropped energy
                    target = this.findGetDroppedResource(RESOURCE_ENERGY, this.store.getFreeCapacity());
                    if (target) {
                        return this.switchTaskPickup(target.id);
                    }
                    // get energy from containers
                    target = this.findGetContainer(RESOURCE_ENERGY, this.store.getFreeCapacity())
                    if (target) {
                        return this.switchTaskWithdraw(target.id, RESOURCE_ENERGY);
                    }
                    // get energy by harvesting
                    target = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
                    if (target) {
                        return this.switchTaskHarvest(target.id);
                    }
                    break;
                case 'Miner':
                    if (this.memory.sourceID) {
                        this.memory.task = {
                            name: 'mine',
                            targetID: this.memory.sourceID,
                            targetRange: 1
                        }
                    }
                    break;
                case 'Upgrader':
                    // upgrade controller
                    if (this.store[RESOURCE_ENERGY] > 0) {
                        return this.switchTaskUpgrade();
                    }
                    // get dropped energy
                    target = this.findGetDroppedResource(RESOURCE_ENERGY, this.store.getFreeCapacity());
                    if (target) {
                        return this.switchTaskPickup(target.id);
                    }
                    // get energy from containers
                    target = this.findGetContainer(RESOURCE_ENERGY, this.store.getFreeCapacity());
                    if (target) {
                        return this.switchTaskWithdraw(target.id, RESOURCE_ENERGY);
                    }
                    // get energy from storage
                    target = this.findGetStorage(RESOURCE_ENERGY, this.store.getFreeCapacity());
                    if (target) {
                        return this.switchTaskWithdraw(target.id, RESOURCE_ENERGY);
                    }
                    // get energy by harvesting
                    target = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
                    if (target) {
                        return this.switchTaskHarvest(target.id);
                    }
                    break;
                case 'Builder':
                    if (this.store[RESOURCE_ENERGY] > 0) {
                        if (this.findConstructionSite()) {
                            this.switchTaskBuild(this.findConstructionSite().id)
                        } else if (this.room.memory.stage < 4 && this.findRepairSite()) {
                            this.switchTaskRepair(this.findRepairSite().id);
                        } else {
                            this.switchTaskUpgrade();
                        }
                    } else {
                        // get dropped energy
                        target = this.findGetDroppedResource(RESOURCE_ENERGY, this.store.getFreeCapacity());
                        if (target) {
                            return this.switchTaskPickup(target.id);
                        }
                        // get energy from containers
                        target = this.findGetContainer(RESOURCE_ENERGY, this.store.getFreeCapacity());
                        if (target) {
                            return this.switchTaskWithdraw(target.id, RESOURCE_ENERGY);
                        }
                        // get energy from storage
                        target = this.findGetStorage(RESOURCE_ENERGY, this.store.getFreeCapacity());
                        if (target) {
                            return this.switchTaskWithdraw(target.id, RESOURCE_ENERGY);
                        }
                        // get energy by harvesting
                        target = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
                        if (target) {
                            return this.switchTaskHarvest(target.id);
                        }
                    }
                    break;
                case 'Repairer':
                    if (this.store[RESOURCE_ENERGY] > 0) {
                        target = this.findRepairSite();
                        if (target) {
                            return this.switchTaskRepair(target.id);
                        }
                        target = this.findWallRepairSite(config.stageOptions.wallRepairs[this.room.memory.stage]);
                        if (target){
                            this.switchTaskRepair(target.id);
                        }
                        return this.switchTaskUpgrade();
                    } else {
                        // get dropped energy
                        target = this.findGetDroppedResource(RESOURCE_ENERGY, this.store.getFreeCapacity());
                        if (target) {
                            return this.switchTaskPickup(target.id);
                        }
                        // get energy from containers
                        target = this.findGetContainer(RESOURCE_ENERGY, this.store.getFreeCapacity());
                        if (target) {
                            return this.switchTaskWithdraw(target.id, RESOURCE_ENERGY);
                        }
                        // get energy from storage
                        target = this.findGetStorage(RESOURCE_ENERGY, this.store.getFreeCapacity());
                        if (target) {
                            return this.switchTaskWithdraw(target.id, RESOURCE_ENERGY);
                        }
                        // get energy by harvesting
                        target = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
                        if (target) {
                            return this.switchTaskHarvest(target.id);
                        }
                    }
                    break;
                case 'idle':
                    this.say("⚠️");
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
        return 0;
    }
    Creep.prototype.switchTaskUpgrade = function () {
        this.say("🆙");
        this.memory.task = {
            name: 'upgrade',
            targetID: this.room.controller.id,
            targetRange: 2
        };
        return 0;
    }
    Creep.prototype.switchTaskBuild = function (targetID) {
        this.say("🔨");
        this.memory.task = {
            name: 'build',
            targetID: targetID,
            targetRange: 2
        };
        return 0;
    }
    Creep.prototype.switchTaskRepair = function (targetID) {
        this.say("🛠️");
        this.memory.task = {
            name: 'repair',
            targetID: targetID,
            targetRange: 2
        };
        return 0;
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
        return 0;
    }
    Creep.prototype.switchTaskPickup = function (targetID) {
        this.say("🧺");
        this.memory.task = {
            name: 'pickup',
            targetID: targetID,
            targetRange: 1
        };
        return 0;
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
        return 0;
    }


// Find places to transfer resources to --------------------------------------------------------------------------------
    Creep.prototype.findStoreSpawnExtension = function (resource = RESOURCE_ENERGY) {
        return this.pos.findClosestByPath(FIND_MY_STRUCTURES, {
            filter: (s) =>
                (s.structureType === STRUCTURE_SPAWN || s.structureType === STRUCTURE_EXTENSION)
                && s.store.getCapacity(resource) - s.store[resource] > 0
        });
    }
    Creep.prototype.findStoreStorage = function (resource = RESOURCE_ENERGY) {
        return this.pos.findClosestByPath(FIND_MY_STRUCTURES, {
            filter: (s) =>
                s.structureType === STRUCTURE_STORAGE
                && s.store.getCapacity(resource) - s.store[resource] > 0
        });
    }

// Find places to withdraw/pickup resource from ------------------------------------------------------------------------
    Creep.prototype.findGetDroppedResource = function (resource = RESOURCE_ENERGY, amount = 0) {
        return this.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
            filter:
                s => s.amount > amount && s.resourceType === resource
        })
    }
    Creep.prototype.findGetContainer = function (resource = RESOURCE_ENERGY, amount = 0) {
        let full_containers = this.room.memory.full_containers;
        if (full_containers && full_containers.length > 0) {
            return this.pos.findClosestByPath(full_containers, {
                filter: (s) => s.store[resource] > amount
            });
        } else {
            return this.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                filter: (s) =>
                    s.structureType === STRUCTURE_CONTAINER
                    && s.store[resource] > amount
            });
        }
    }
    Creep.prototype.findGetStorage = function (resource = RESOURCE_ENERGY, amount = 0) {
        return this.pos.findClosestByPath(FIND_MY_STRUCTURES, {
            filter: (s) =>
                s.structureType === STRUCTURE_STORAGE
                && s.store[resource] > amount
        });
    }

// Find construction/repair sites --------------------------------------------------------------------------------------
    Creep.prototype.findConstructionSite = function () {
        if (this.room.memory.construction_sites) {
            let mem = this.room.memory.construction_sites;
            if (mem.tower && mem.tower.length > 0) {
                return this.pos.findClosestByPath(mem.tower);
            } else if (mem.energy_storage && mem.energy_storage.length > 0) {
                return this.pos.findClosestByPath(mem.energy_storage);
            } else {
                return this.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES);
            }
        } else {
            return this.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES);
        }
    }
    Creep.prototype.findRepairSite = function () {
        return this.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (s) => s.structureType !== STRUCTURE_WALL && s.structureType !== STRUCTURE_RAMPART
                && s.hits < s.hitsMax
        });

    }
    Creep.prototype.findWallRepairSite = function (maxHits) {
        let rampart = this.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (s) => s.structureType === STRUCTURE_RAMPART && s.hits < s.hitsMax && s.hits < maxHits
        });
        if (rampart) return rampart;
        return this.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (s) => s.structureType === STRUCTURE_WALL && s.hits < s.hitsMax && s.hits < maxHits
        });

    }
}
