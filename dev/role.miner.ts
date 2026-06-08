let roleMiner: {
    /**
     * @param {Creep} creep
     */
    run(creep: Creep): void
}

export default roleMiner = {
    run(creep) {
        if (!creep.memory.source_id) return;
        const source = Game.getObjectById(creep.memory.source_id) as Source;
        if(source && creep.harvest(source) === ERR_NOT_IN_RANGE) {
            creep.moveTo(source)
        }
    },
}