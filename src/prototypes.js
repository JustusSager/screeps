
// Creeps -------------------------------------------------------------------------------------
Creep.prototype.findStoreEnergy = function () {
    return this.pos.findClosestByPath(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                return ((structure.structureType === STRUCTURE_CONTAINER ||
                        structure.structureType === STRUCTURE_STORAGE ||
                        structure.structureType === STRUCTURE_LINK) &&
                    structure.store.getFreeCapacity() > 0)
            }
        }
    )
}

Creep.prototype.findWithdrawResource = function (resource = RESOURCE_ENERGY) {
    return this.pos.findClosestByPath(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                return ((structure.structureType === STRUCTURE_CONTAINER ||
                        structure.structureType === STRUCTURE_STORAGE ||
                        structure.structureType === STRUCTURE_LINK) &&
                    structure.store[resource] > 0)
            }
        }
    )
}

Creep.prototype.findDroppedResource = function (resource = RESOURCE_ENERGY) {
    return this.pos.findClosestByPath(FIND_DROPPED_RESOURCES || FIND_TOMBSTONES, {
            filter: (s) => s.store[resource] > 0
        }
    )
}

Creep.prototype.findSpawn = function () {
    return this.pos.findClosestByPath(FIND_MY_SPAWNS);
}