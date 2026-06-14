let roleMiner: {
    /**
     * @param {Creep} creep
     */
    run(creep: Creep): ScreepsReturnCode
}

export default roleMiner = {
    run(creep) {

        if (!creep.memory.source_id || !creep.memory.room_target) return ERR_INVALID_ARGS

        if (creep.room.name !== creep.memory.room_target) {
            const route = Game.map.findRoute(creep.room, creep.memory.room_target);
            if(route !== -2 && route.length > 0) {
                creep.say(route[0].room);
                const exit = creep.pos.findClosestByRange(route[0].exit);
                if (exit === null) return -1
                return creep.moveTo(exit);
            }
            return 0
        }
        else {
            if (creep.pos.x == 0) return creep.move(RIGHT);
            else if (creep.pos.x == 49) return creep.move(LEFT);
            else if (creep.pos.y == 0) return creep.move(BOTTOM);
            else if (creep.pos.y == 49) return creep.move(TOP);
        }
        
        const source = Game.getObjectById(creep.memory.source_id) as Source;

        if(!creep.pos.inRangeTo(source, 1)) {
            return creep.moveTo(source)
        }
        else {
            return creep.harvest(source)
        }
    },
}