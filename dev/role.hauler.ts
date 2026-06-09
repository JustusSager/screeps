let roleHauler: {
    /**
     * @param {Creep} creep
     */
    run(creep: Creep): void
}

export default roleHauler = {
    run(creep) {
        if (creep.store.getFreeCapacity() > 0) {
            const dropped = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {filter: d => d.resourceType === RESOURCE_ENERGY && d.amount > creep.store.getFreeCapacity(RESOURCE_ENERGY)});
            if(dropped && creep.pickup(dropped) === ERR_NOT_IN_RANGE) {
                creep.moveTo(dropped)
                return;
            }

            const container_near_souce = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: s => s.structureType === STRUCTURE_CONTAINER && s.pos.findInRange(FIND_SOURCES, 1).length > 0 && s.store[RESOURCE_ENERGY] > creep.store.getFreeCapacity(RESOURCE_ENERGY)
            });
            if(container_near_souce && creep.withdraw(container_near_souce, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(container_near_souce)
                return;
            }
        }
        else {
            const container_near_spawn = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (s) => ((s.structureType === STRUCTURE_CONTAINER) && s.pos.findInRange(FIND_MY_SPAWNS, 1).length > 0 && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
            })
            if (container_near_spawn && creep.transfer(container_near_spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(container_near_spawn);
                return
            }

            const container_near_controller = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (s) => ((s.structureType === STRUCTURE_CONTAINER) && s.pos.findInRange(FIND_MY_STRUCTURES, 1, {filter: c => c.structureType === STRUCTURE_CONTROLLER}).length > 0 && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
            })
            if (container_near_controller && creep.transfer(container_near_controller, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(container_near_controller);
                return
            }

            const spawn_extensions = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (s) => ((s.structureType === STRUCTURE_SPAWN || s.structureType === STRUCTURE_EXTENSION) && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
            })
            if (spawn_extensions && creep.transfer(spawn_extensions, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(spawn_extensions);
                return
            }

            const storage = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (s) => ((s.structureType === STRUCTURE_STORAGE) && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
            })
            if (storage && creep.transfer(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(storage);
                return
            }
        }
    },
}