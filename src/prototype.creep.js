module.exports = function () {
// Creeps -------------------------------------------------------------------------------------
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