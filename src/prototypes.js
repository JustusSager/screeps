
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

Creep.prototype.findSpawn = function () {
    return this.pos.findClosestByPath(FIND_MY_SPAWNS);
}