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

        const controller = creep.room.controller
        if (controller === undefined) {
            creep.say("Error!")
            return
        }

        if (creep.memory.aquire_state) {

            const container_near_controller = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: 
                (s) => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > creep.store.getFreeCapacity(RESOURCE_ENERGY) && s.pos.inRangeTo(controller.pos.x, controller.pos.y, 4)
            })
            if (container_near_controller) {
                if (creep.withdraw(container_near_controller, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(container_near_controller)
                }
                return
            }

            const dropped = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {filter: d => d.resourceType === RESOURCE_ENERGY && d.amount > creep.store.getFreeCapacity(RESOURCE_ENERGY)})
            if (dropped) {
                if (creep.pickup(dropped) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(dropped)
                }
                return
            }

            const container = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > creep.store.getFreeCapacity(RESOURCE_ENERGY)})
            if (container) {
                if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(container)
                }
                return
            }

            const storage = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_STORAGE && s.store[RESOURCE_ENERGY] > creep.store.getFreeCapacity(RESOURCE_ENERGY)})
            if (storage) {
                if (creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(storage)
                }
                return
            }
        }
        else {
            if (controller) {
                if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(controller)
                }
            }
        }
    },
}