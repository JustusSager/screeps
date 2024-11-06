const config = require('config');

function deref(objectID) {
    return Game.getObjectById(objectID) || Game.flags[objectID] || Game.creeps[objectID] || Game.spawns[objectID] || null;
}

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

    // Creep executes task
    Creep.prototype.run = function () {
        if (this.memory.task) {
            let roomStage = this.room.memory.stage;
            let taskName = this.memory.task.name;
            let target = deref(this.memory.task.targetID);
            if (!target) this.updateTask();
            let targetRange = this.memory.task.targetRange ? this.memory.task.targetRange : 1;
            let options = this.memory.task.options ? this.memory.task.options : {};
            let result = undefined, resource = undefined;

            if (target && !this.pos.inRangeTo(target.pos, targetRange)) {
                this.moveTo(target.pos);
            } else {
                switch (taskName) {
                    case 'harvest':
                        result = this.harvest(target);
                        // console.log(this.name, JSON.stringify(this.memory), result);
                        if (result < 0 || this.store.getFreeCapacity() === 0) {
                            this.updateTask(result);
                        }
                        break;
                    case 'mine':
                        if (!target) {
                            break;
                        }
                        if (!this.memory.task.containerID) {
                            this.memory.task.containerID = target.pos.findInRange(FIND_STRUCTURES, 1, {
                                filter: s => s.structureType === STRUCTURE_CONTAINER
                            })[0].id;
                        }
                        if (roomStage >= 5 && !this.memory.task.linkID) {
                            let links = target.pos.findInRange(FIND_STRUCTURES, 2, {
                                filter: s => s.structureType === STRUCTURE_LINK
                            });
                            if (links.length > 0) {
                                this.memory.task.linkID = links[0].id;
                            }
                        }
                        let container = deref(this.memory.task.containerID)
                        if (this.pos.isEqualTo(container)) {
                            let link = deref(this.memory.task.linkID);
                            if (
                                roomStage >= 5 &&
                                link &&
                                this.store.getCapacity() > 0 &&
                                this.store.getUsedCapacity(RESOURCE_ENERGY) === this.store.getCapacity() &&
                                link.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                            ) {
                                result = this.transfer(link, RESOURCE_ENERGY, this.store[RESOURCE_ENERGY]);
                                console.log(this.name, JSON.stringify(this.memory), result);
                            } else {
                                result = this.harvest(target);
                                // console.log(this.name, JSON.stringify(this.memory), result);
                            }
                        } else {
                            this.moveTo(container);
                        }
                        break;
                    case 'transfer':
                        resource = options.resource ? options.resource : RESOURCE_ENERGY;
                        result = this.transfer(target, resource);
                        // console.log(this.name, JSON.stringify(this.memory), result);
                        if (result < 0 || this.store.getUsedCapacity(resource) === 0 || !this.store.getUsedCapacity(resource)) {
                            this.updateTask();
                        }
                        break;
                    case 'withdraw':
                        resource = options.resource ? options.resource : RESOURCE_ENERGY;
                        result = this.withdraw(target, resource);
                        // console.log(this.name, JSON.stringify(this.memory), result);
                        if (result < 0 || this.store.getCapacity() === this.store.getUsedCapacity()) {
                            this.updateTask();
                        }
                        break;
                    case 'pickup':
                        result = this.pickup(target);
                        // console.log(this.name, JSON.stringify(this.memory), result);
                        if (result < 0 || this.store.getFreeCapacity() === 0) {
                            this.updateTask();
                        }
                        break;
                    case 'upgrade':
                        result = this.upgradeController(target);
                        // console.log(this.name, JSON.stringify(this.memory), result);
                        if (result < 0 || this.store[RESOURCE_ENERGY] === 0) {
                            this.updateTask();
                        }
                        break;
                    case 'build':
                        result = this.build(target);
                        // console.log(this.name, JSON.stringify(this.memory), result);
                        if (result < 0 || this.store[RESOURCE_ENERGY] === 0) {
                            this.updateTask();
                        }
                        break;
                    case 'repair':
                        if (target.hits === target.hitsMax) this.updateTask();
                        result = this.repair(target);
                        // console.log(this.name, JSON.stringify(this.memory), result);
                        if (result < 0 || this.store[RESOURCE_ENERGY] === 0) {
                            this.updateTask();
                        }
                        break;
                    case 'moveTo':
                        // console.log(this.name, JSON.stringify(this.memory), result);
                        this.updateTask();
                        if (this.pos.getRangeTo(target, targetRange)) {
                            this.updateTask();
                        }
                        break;
                    case 'idle':
                        // console.log(this.name, JSON.stringify(this.memory), result);
                        this.say("⚠️");
                        this.updateTask();
                        break;
                    default:
                        // console.log(this.name, JSON.stringify(this.memory), result);
                        this.updateTask();
                        break;
                }
            }
        }
    }

    // Creep Task update memory to new Task
    Creep.prototype.updateTask = function () {
        if (this.memory.role) {
            let target = undefined;
            let roomStage = this.room.memory.stage;
            switch (this.memory.role) {
                case 'Transporter':
                    if (this.store.getUsedCapacity() === 0) {
                        target = this.findGetDroppedResource(RESOURCE_ENERGY, this.store.getFreeCapacity());
                        if (target) {
                            return this.switchTaskPickup(target.id);
                        }
                        if (roomStage >= 2) {
                            // get energy from containers
                            target = this.findGetContainer(RESOURCE_ENERGY, this.store.getFreeCapacity());
                            if (target) {
                                return this.switchTaskWithdraw(target.id);
                            }
                        }
                    } else {
                        if (roomStage >= 4) {
                            // transfer energy into storage
                            target = this.findStoreStorage();
                            if (this.store[RESOURCE_ENERGY] > 0 && target) {
                                return this.switchTaskTransfer(target.id);
                            }
                        }
                        // Transfer energy to Spawn or Extensions
                        target = this.findStoreSpawnExtension();
                        if (this.store[RESOURCE_ENERGY] > 0 && target) {
                            return this.switchTaskTransfer(target.id);
                        }
                        if (roomStage >= 3) {
                            // transfer energy into tower
                            target = this.findStoreTower();
                            if (this.store[RESOURCE_ENERGY] > 0 && target) {
                                return this.switchTaskTransfer(target.id);
                            }
                        }
                    }
                    // move to gathering point, to stop Clustering in front of container
                    /*target = Game.flags['Gathering'];
                    if (target) {
                        return this.switchTaskMoveTo(target.id)
                    }*/
                    break;
                case 'Harvester':
                    // Transfer energy to Spawn or Extensions
                    target = this.findStoreSpawnExtension();
                    if (this.store[RESOURCE_ENERGY] > 0 && target) {
                        return this.switchTaskTransfer(target.id);
                    }
                    if (roomStage >= 3) {
                        // transfer energy into tower
                        target = this.findStoreTower();
                        if (this.store[RESOURCE_ENERGY] > 0 && target) {
                            return this.switchTaskTransfer(target.id);
                        }
                    }
                    if (roomStage >= 4) {
                        // transfer energy into storage
                        target = this.findStoreStorage();
                        if (this.store[RESOURCE_ENERGY] > 0 && target) {
                            return this.switchTaskTransfer(target.id);
                        }
                    }
                    // get dropped energy
                    target = this.findGetDroppedResource(RESOURCE_ENERGY, this.store.getFreeCapacity());
                    if (target) {
                        return this.switchTaskPickup(target.id);
                    }
                    // get energy from containers
                    if (roomStage >= 2) {
                        target = this.findGetContainer(RESOURCE_ENERGY, this.store.getFreeCapacity())
                        if (target) {
                            return this.switchTaskWithdraw(target.id, RESOURCE_ENERGY);
                        }
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
                    if (roomStage >= 2) {
                        // get energy from containers
                        target = this.findGetContainer(RESOURCE_ENERGY, this.store.getFreeCapacity());
                        if (target) {
                            return this.switchTaskWithdraw(target.id, RESOURCE_ENERGY);
                        }
                    }
                    if (roomStage >= 4) {
                        // get energy from storage
                        target = this.findGetStorage(RESOURCE_ENERGY, this.store.getFreeCapacity());
                        if (target) {
                            return this.switchTaskWithdraw(target.id, RESOURCE_ENERGY);
                        }
                    }
                    // get energy by harvesting
                    target = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
                    if (target) {
                        return this.switchTaskHarvest(target.id);
                    }
                    break;
                case 'Builder':
                    if (this.store[RESOURCE_ENERGY] > 0) {
                        // Work at construction site
                        target = this.findConstructionSite();
                        if (target) {
                            return this.switchTaskBuild(target.id)
                        }
                        // repair damaged structures
                        target = this.findRepairSite(0.9)
                        if (target) {
                            return this.switchTaskRepair(target.id);
                        }
                        // upgrade controller
                        return this.switchTaskUpgrade();
                    } else {
                        // get dropped energy
                        target = this.findGetDroppedResource(RESOURCE_ENERGY, this.store.getFreeCapacity());
                        if (target) {
                            return this.switchTaskPickup(target.id);
                        }
                        if (roomStage >= 2) {
                            // get energy from containers
                            target = this.findGetContainer(RESOURCE_ENERGY, this.store.getFreeCapacity());
                            if (target) {
                                return this.switchTaskWithdraw(target.id, RESOURCE_ENERGY);
                            }
                        }
                        if (roomStage >= 4) {
                            // get energy from storage
                            target = this.findGetStorage(RESOURCE_ENERGY, this.store.getFreeCapacity());
                            if (target) {
                                return this.switchTaskWithdraw(target.id, RESOURCE_ENERGY);
                            }
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
                        target = this.findRepairSite(0.95);
                        if (target) {
                            return this.switchTaskRepair(target.id);
                        }
                        if (roomStage >= 3) {
                            target = this.findWallRepairSite(config.stageOptions.wallRepairs[roomStage]);
                            if (target) {
                                return this.switchTaskRepair(target.id);
                            }
                        }
                        return this.switchTaskUpgrade();
                    } else {
                        // get dropped energy
                        target = this.findGetDroppedResource(RESOURCE_ENERGY, this.store.getFreeCapacity());
                        if (target) {
                            return this.switchTaskPickup(target.id);
                        }
                        if (roomStage >= 2) {
                            // get energy from containers
                            target = this.findGetContainer(RESOURCE_ENERGY, this.store.getFreeCapacity());
                            if (target) {
                                return this.switchTaskWithdraw(target.id, RESOURCE_ENERGY);
                            }
                        }
                        if (roomStage >= 4) {
                            // get energy from storage
                            target = this.findGetStorage(RESOURCE_ENERGY, this.store.getFreeCapacity());
                            if (target) {
                                return this.switchTaskWithdraw(target.id, RESOURCE_ENERGY);
                            }
                        }
                        // get energy by harvesting
                        target = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
                        if (target) {
                            return this.switchTaskHarvest(target.id);
                        }
                    }
                    break;
                case 'Manager':
                    if (this.store[RESOURCE_ENERGY] > 0) {
                        target = this.pos.findInRange(FIND_MY_STRUCTURES, 1, {
                            filter: (s) => s.structureType === STRUCTURE_TOWER && s.store.getCapacity(RESOURCE_ENERGY) - s.store[RESOURCE_ENERGY] > 0
                        });
                        if (target && target.length > 0) {
                            return this.switchTaskTransfer(target[0].id, RESOURCE_ENERGY);
                        }
                        target = this.pos.findInRange(FIND_MY_STRUCTURES, 1, {
                            filter: s => s.structureType === STRUCTURE_SPAWN && s.store.getCapacity(RESOURCE_ENERGY) - s.store[RESOURCE_ENERGY] > 0
                        })
                        if (target && target.length > 0) {
                            return this.switchTaskTransfer(target[0].id, RESOURCE_ENERGY);
                        }
                        target = this.pos.findInRange(FIND_MY_STRUCTURES, 1, {
                            filter: s => s.structureType === STRUCTURE_STORAGE && s.store.getCapacity(RESOURCE_ENERGY) - s.store[RESOURCE_ENERGY] > 0
                        })
                        if (target && target.length > 0) {
                            return this.switchTaskTransfer(target[0].id, RESOURCE_ENERGY);
                        }
                    } else {
                        target = this.pos.findInRange(FIND_DROPPED_RESOURCES, 1);
                        if (target && target.length > 0) {
                            return this.switchTaskPickup(target);
                        }
                        if (roomStage >= 5) {
                            target = this.pos.findInRange(FIND_MY_STRUCTURES, 1, {
                                filter: (s) => s.structureType === STRUCTURE_LINK && s.store.getCapacity(RESOURCE_ENERGY) - s.store[RESOURCE_ENERGY] > 0
                            });
                            if (target && target.length > 0) {
                                return this.switchTaskWithdraw(target[0].id, RESOURCE_ENERGY);
                            }
                        }
                        target = this.pos.findInRange(FIND_MY_STRUCTURES, 1, {
                            filter: s => s.structureType === STRUCTURE_STORAGE && s.store.getCapacity(RESOURCE_ENERGY) - s.store[RESOURCE_ENERGY] > 0
                        })
                        if (target && target.length > 0) {
                            return this.switchTaskWithdraw(target[0].id, RESOURCE_ENERGY);
                        }
                    }
                    break;
                case 'Secretary':
                    if (this.store[RESOURCE_ENERGY] > 0) {
                        // Transfer energy to Spawn or Extensions
                        target = this.findStoreSpawnExtension();
                        if (target) {
                            return this.switchTaskTransfer(target.id);
                        }
                        // transfer energy into tower
                        target = this.findStoreTower();
                        if (target) {
                            return this.switchTaskTransfer(target.id);
                        }
                    } else {
                        target = this.findGetStorage(RESOURCE_ENERGY, 0);
                        if (target) {
                            this.switchTaskWithdraw(target.id, RESOURCE_ENERGY);
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
    Creep.prototype.switchTaskMoveTo = function (targetID) {
        this.say("🥾");
        this.memory.task = {
            name: 'moveTo',
            targetID: targetID,
            targetRange: 4
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
    Creep.prototype.findStoreTower = function () {
        return this.pos.findClosestByPath(FIND_MY_STRUCTURES, {
            filter: (s) => s.structureType === STRUCTURE_TOWER && s.store.getCapacity(RESOURCE_ENERGY) - s.store[RESOURCE_ENERGY] > 0
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
                filter: (s) => s.store.getUsedCapacity(resource) > amount
            });
        } else {
            return this.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) =>
                    s.structureType === STRUCTURE_CONTAINER
                    && s.store.getUsedCapacity(resource) > amount
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
    Creep.prototype.findRepairSite = function (threshold = 1.0) {
        return this.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (s) => s.structureType !== STRUCTURE_WALL && s.structureType !== STRUCTURE_RAMPART
                && s.hits < s.hitsMax * threshold
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
