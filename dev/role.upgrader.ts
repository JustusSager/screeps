let roleUpgrader: {
    /**
     * @param {Creep} creep
     */
    run(creep: Creep): void
}

export default roleUpgrader = {
    run(creep) {
        if (creep.memory.aquire_state && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
            creep.memory.aquire_state = false;
        } 
        else if (!creep.memory.aquire_state && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.aquire_state = true;
        }

        if (creep.memory.aquire_state) {
            const dropped = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES)
            if (dropped) {
                if (creep.pickup(dropped) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(dropped)
                }
                return
            }

            const container = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0})
            if (container) {
                if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(container)
                }
                return
            }

            const storage = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_STORAGE && s.store[RESOURCE_ENERGY] > 0})
            if (storage) {
                if (creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(storage)
                }
                return
            }
        }
        else {
            const controller = creep.room.controller
            if (controller) {
                if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(controller)
                }
            }
        }
    },
}