let roleHauler: {
    /**
     * @param {Creep} creep
     */
    run(creep: Creep): void
}

export default roleHauler = {
    run(creep) {
        if (creep.store.getFreeCapacity() > 0) {
            const source = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {filter: d => d.resourceType === RESOURCE_ENERGY});
            if(source && creep.pickup(source) === ERR_NOT_IN_RANGE) {
                creep.moveTo(source)
            }
        }
        else {
            const target = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                filter: (s) => ((s.structureType === STRUCTURE_SPAWN || s.structureType === STRUCTURE_EXTENSION) && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
            })
            if (target && creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        }
    },
}