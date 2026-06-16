import { PickupTarget, TransferTarget } from './manager.economy'

let roleHauler: {
    /**
     * @param {Creep} creep
     */
    run(creep: Creep, pickupTargets: PickupTarget[]): ScreepsReturnCode
}

function find_closest_pickup_target(creep: Creep, minAmountThreshold: number, pickupTargets: PickupTarget[]): PickupTarget | null {
    let possibleTargets = pickupTargets.filter(p => p.amount > minAmountThreshold)
    if (possibleTargets.length === 0) {
        return null
    }

    return possibleTargets.sort((a, b) => {
        const roompath_a = Game.map.findRoute(creep.pos.roomName, a.pos.roomName)
        if (roompath_a === ERR_NO_PATH) return 9999999999
        const roompath_b = Game.map.findRoute(creep.pos.roomName, b.pos.roomName)
        if (roompath_b === ERR_NO_PATH) return -9999999999

        const internal_dist_a = Math.abs(creep.pos.x - a.pos.x) + Math.abs(creep.pos.y - a.pos.y)
        const internal_dist_b = Math.abs(creep.pos.x - b.pos.x) + Math.abs(creep.pos.y - b.pos.y)

        return (roompath_a.length - roompath_b.length) * 100 + (internal_dist_a - internal_dist_b)
    })[0]

}

function find_closest_transfer_target(minAmountThreshold: number, targetRoom: Room): TransferTarget | null {
    const spawner_base_pos = targetRoom.memory.spawner_base_centroid_pos
    if (spawner_base_pos) {
        const containers_near_spawn = targetRoom.find(FIND_STRUCTURES, {
            filter: (s) => ((s.structureType === STRUCTURE_CONTAINER) && s.pos.inRangeTo(spawner_base_pos.x, spawner_base_pos.y, 2) && s.store.getFreeCapacity(RESOURCE_ENERGY) > minAmountThreshold)
        }) as StructureContainer[]
        if (containers_near_spawn.length > 0) {
            return {
                id: containers_near_spawn[0].id,
                type: 'transfer',
                resourceType: RESOURCE_ENERGY,
                amount: containers_near_spawn[0].store.getFreeCapacity(RESOURCE_ENERGY),
                pos: containers_near_spawn[0].pos
            }
        }
    }

    const containers_near_controller = targetRoom.find(FIND_STRUCTURES, {
        filter: (s) => ((s.structureType === STRUCTURE_CONTAINER) && s.pos.findInRange(FIND_MY_STRUCTURES, 4, {filter: c => c.structureType === STRUCTURE_CONTROLLER}).length > 0 && s.store.getFreeCapacity(RESOURCE_ENERGY) > minAmountThreshold)
    }) as StructureContainer[]
    if (containers_near_controller.length > 0) {
        return {
            id: containers_near_controller[0].id,
            type: 'transfer',
            resourceType: RESOURCE_ENERGY,
            amount: containers_near_controller[0].store.getFreeCapacity(RESOURCE_ENERGY),
            pos: containers_near_controller[0].pos
        }
    }

    const spawn_extensions = targetRoom.find(FIND_STRUCTURES, {
        filter: (s) => ((s.structureType === STRUCTURE_SPAWN || s.structureType === STRUCTURE_EXTENSION) && s.store.getFreeCapacity(RESOURCE_ENERGY) > minAmountThreshold)
    }) as (StructureSpawn | StructureExtension)[]
    if (spawn_extensions.length > 0) {
        return {
            id: spawn_extensions[0].id,
            type: 'transfer',
            resourceType: RESOURCE_ENERGY,
            amount: spawn_extensions[0].store.getFreeCapacity(RESOURCE_ENERGY),
            pos: spawn_extensions[0].pos
        }
    }

    const storage = targetRoom.find(FIND_STRUCTURES, {
        filter: (s) => ((s.structureType === STRUCTURE_STORAGE) && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
    }) as StructureStorage[]
    if (storage.length > 0) {
        return {
            id: storage[0].id,
            type: 'transfer',
            resourceType: RESOURCE_ENERGY,
            amount: storage[0].store.getFreeCapacity(RESOURCE_ENERGY),
            pos: storage[0].pos
        }
    }
    return null
}

function get_new_task(creep: Creep, pickupTargets: PickupTarget[]): ScreepsReturnCode {
    if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
        const roomHome = Game.rooms[creep.memory.room_home]
        const target = find_closest_transfer_target(50, roomHome)
        if (target == null) {
            return ERR_INVALID_ARGS
        }

        creep.memory.hauler_task = {
            type: target.type,
            target_id: target.id,
            pos_target: target.pos,
            resource: target.resourceType
        }
        return OK
    } 
    else {
        const target = find_closest_pickup_target(creep, 50, pickupTargets)
        if (target == null) {
            return ERR_INVALID_ARGS
        }

        creep.memory.hauler_task = {
            type: target.type,
            target_id: target.id,
            pos_target: target.pos,
            resource: target.resourceType
        }
        return OK
    }
}

export default roleHauler = {
    run(creep, pickupTargets) {
        if (creep.memory.hauler_task === undefined) {
            const result = get_new_task(creep, pickupTargets)
            if (result !== OK) {
                if (Memory.debug.creepSaysErrorCode) creep.say(result.toString())
                return ERR_INVALID_ARGS
            }
        }
        if (creep.memory.hauler_task === undefined) {
            if (Memory.debug.creepSaysErrorCode) creep.say("-3")
            return ERR_INVALID_TARGET
        }

        if (Memory.debug.creepSaysTask) creep.say(creep.memory.hauler_task.type)

        // Zu dem target room gehen
        if (creep.room.name !== creep.memory.hauler_task.pos_target.roomName) {
            const route = Game.map.findRoute(creep.room.name, creep.memory.hauler_task.pos_target.roomName);
            if(route !== -2 && route.length > 0) {
                if (Memory.debug.creepSaysTask) creep.say(route[0].room);
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


        if(!creep.pos.inRangeTo(creep.memory.hauler_task.pos_target.x, creep.memory.hauler_task.pos_target.y, 1)) {
            return creep.moveTo(creep.memory.hauler_task.pos_target.x, creep.memory.hauler_task.pos_target.y)
        }

        if (creep.memory.hauler_task.type === 'pickup') {
            if (creep.store.getFreeCapacity(creep.memory.hauler_task.resource) == 0) {
                creep.memory.hauler_task = undefined
                return ERR_FULL
            }

            const dropped = Game.getObjectById(creep.memory.hauler_task.target_id) as Resource | null
            if (dropped === null) {
                if (Memory.debug.creepSaysErrorCode) creep.say("TargetNotFound")
                creep.memory.hauler_task = undefined
                return ERR_INVALID_TARGET
            }
            const result = creep.pickup(dropped)
            if (result !== OK) {
                if (Memory.debug.creepSaysErrorCode) creep.say("ERROR")
                creep.memory.hauler_task = undefined
                return result
            }
        }
        else if (creep.memory.hauler_task.type === 'withdraw') {
            if (creep.store.getFreeCapacity(creep.memory.hauler_task.resource) == 0) {
                creep.memory.hauler_task = undefined
                return ERR_FULL
            }

            const structure = Game.getObjectById(creep.memory.hauler_task.target_id) as Structure | null
            if (structure === null) {
                if (Memory.debug.creepSaysErrorCode) creep.say("TargetNotFound")
                creep.memory.hauler_task = undefined
                return ERR_NOT_FOUND
            }
            const result = creep.withdraw(structure, creep.memory.hauler_task.resource)
            if (result !== OK) {
                if (Memory.debug.creepSaysErrorCode) creep.say("ERROR")
                creep.memory.hauler_task = undefined
                return result
            }
        }
        else if (creep.memory.hauler_task.type === 'transfer') {
            if (creep.store.getUsedCapacity(creep.memory.hauler_task.resource) == 0) {
                creep.memory.hauler_task = undefined
                return ERR_NOT_ENOUGH_RESOURCES
            }

            const structure = Game.getObjectById(creep.memory.hauler_task.target_id) as Structure | null
            if (structure === null) {
                if (Memory.debug.creepSaysErrorCode) creep.say("TargetNotFound")
                creep.memory.hauler_task = undefined
                return ERR_NOT_FOUND
            }
            const result = creep.transfer(structure, creep.memory.hauler_task.resource)
            if (result !== OK) {
                if (Memory.debug.creepSaysErrorCode) creep.say("ERROR")
                creep.memory.hauler_task = undefined
                return result
            }
        }
        creep.memory.hauler_task = undefined
        return ERR_INVALID_ARGS
    },
}