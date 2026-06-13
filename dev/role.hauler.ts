import { PickupTarget } from './manager.exploration'

let roleHauler: {
    /**
     * @param {Creep} creep
     */
    run(creep: Creep, pickupTargets: PickupTarget[]): ScreepsReturnCode
}

export default roleHauler = {
    run(creep, pickupTargets) {
        if (creep.memory.hauler_task === undefined) {
            if (creep.store.getFreeCapacity() > 0) {
                let possibleTargets = pickupTargets.filter(p => p.amount > creep.store.getFreeCapacity())
                if (possibleTargets.length === 0) {
                    creep.say('NoTargets')
                    return ERR_NOT_FOUND
                }
                const target = possibleTargets.sort((a, b) => {
                    const roompath_a = Game.map.findRoute(creep.pos.roomName, a.pos.roomName)
                    if (roompath_a === ERR_NO_PATH) return 9999999999
                    const roompath_b = Game.map.findRoute(creep.pos.roomName, b.pos.roomName)
                    if (roompath_b === ERR_NO_PATH) return -9999999999

                    const internal_dist_a = Math.abs(creep.pos.x - a.pos.x) + Math.abs(creep.pos.y - a.pos.y)
                    const internal_dist_b = Math.abs(creep.pos.x - b.pos.x) + Math.abs(creep.pos.y - b.pos.y)

                    return (roompath_a.length - roompath_b.length) * 100 + (internal_dist_a - internal_dist_b)
                })[0]
                creep.memory.hauler_task = {
                    type: target.type,
                    target_id: target.id,
                    room_target: target.pos.roomName,
                    resource: target.resourceType
                }
            }
            else {
                creep.memory.hauler_task = {
                    type: 'transfer',
                    target_id: '',
                    room_target: creep.memory.room_home,
                    resource: Object.keys(creep.store)[0] as ResourceConstant
                }
            }
        }

        // Zu dem target room gehen
        if (creep.room.name !== creep.memory.hauler_task.room_target) {
            const route = Game.map.findRoute(creep.room.name, creep.memory.hauler_task.room_target);
            if(route !== -2 && route.length > 0) {
                creep.say(route[0].room);
                const exit = creep.pos.findClosestByRange(route[0].exit);
                if (exit === null) return -1
                return creep.moveTo(exit);
            }
        }

        // Ränder des Raums frei halten
        if (creep.pos.x == 0) return creep.move(RIGHT);
        else if (creep.pos.x == 49) return creep.move(LEFT);
        else if (creep.pos.y == 0) return creep.move(BOTTOM);
        else if (creep.pos.y == 49) return creep.move(TOP);


        if (creep.memory.hauler_task && creep.memory.hauler_task.type === 'pickup') {
            const dropped = Game.getObjectById(creep.memory.hauler_task.target_id) as Resource | null
            if (dropped === null) {
                creep.say("TargetNotFound")
                return ERR_NOT_FOUND
            }
            if(creep.pickup(dropped) === ERR_NOT_IN_RANGE) {
                creep.moveTo(dropped)
                return OK;
            }
        }
        else if (creep.memory.hauler_task && creep.memory.hauler_task.type === 'withdraw') {
            const structure = Game.getObjectById(creep.memory.hauler_task.target_id) as Structure | null
            if (structure === null) {
                creep.say("TargetNotFound")
                return ERR_NOT_FOUND
            }
            if(creep.withdraw(structure, creep.memory.hauler_task.resource) === ERR_NOT_IN_RANGE) {
                creep.moveTo(structure)
                return OK;
            }
        }
        else if (creep.memory.hauler_task && creep.memory.hauler_task.type === 'transfer') {
            const container_near_spawn = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (s) => ((s.structureType === STRUCTURE_CONTAINER) && s.pos.findInRange(FIND_MY_SPAWNS, 1).length > 0 && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
            })
            if (container_near_spawn && creep.transfer(container_near_spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(container_near_spawn);
                return OK
            }

            const container_near_controller = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (s) => ((s.structureType === STRUCTURE_CONTAINER) && s.pos.findInRange(FIND_MY_STRUCTURES, 1, {filter: c => c.structureType === STRUCTURE_CONTROLLER}).length > 0 && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
            })
            if (container_near_controller && creep.transfer(container_near_controller, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(container_near_controller);
                return OK
            }

            const spawn_extensions = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (s) => ((s.structureType === STRUCTURE_SPAWN || s.structureType === STRUCTURE_EXTENSION) && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
            })
            if (spawn_extensions && creep.transfer(spawn_extensions, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(spawn_extensions);
                return OK
            }

            const storage = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (s) => ((s.structureType === STRUCTURE_STORAGE) && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
            })
            if (storage && creep.transfer(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(storage);
                return OK
            }
        }
        return ERR_INVALID_ARGS
    },
}