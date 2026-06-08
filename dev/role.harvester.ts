let roleHarvester: {
    /**
     * @param {Creep} creep
     */
    run(creep: Creep): void
}

export default roleHarvester = {
    run(creep) {
        if (creep.store.getFreeCapacity() > 0) {
            const source = creep.pos.findClosestByRange(FIND_SOURCES);
            if(source && creep.harvest(source) === ERR_NOT_IN_RANGE) {
                creep.moveTo(source)
            }
        }
        else {
            if (creep.transfer(Game.spawns['Spawn1'], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.spawns['Spawn1']);
            }
        }
    },
}