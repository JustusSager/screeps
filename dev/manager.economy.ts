// eslint-disable-next-line import/no-unresolved
import _ from "lodash";

export interface PickupTarget {
    id: string
    type: 'withdraw' | 'pickup'
    resourceType: ResourceConstant
    amount: number
    pos: {
        x: number
        y: number
        roomName: string
    }
}

export interface TransferTarget {
    id: string
    type: 'transfer'
    resourceType: ResourceConstant
    amount: number
    pos: {
        x: number
        y: number
        roomName: string
    }
}


let managerEconomy: {

    find_pickup_targets_near_source(rooms: {[roomname: string]: Room}): PickupTarget[]

    get_sources_to_mine(roomName: string, max_distance: number): SourceMeta[]

}

export default managerEconomy = {

    find_pickup_targets_near_source(rooms) {
        let result: PickupTarget[] = []
        for (const roomname in rooms) {
            const room = Game.rooms[roomname]

            const pickups = room.find(FIND_DROPPED_RESOURCES)
            for (const p of pickups) {
                result.push({
                    id: p.id,
                    type: 'pickup',
                    resourceType: p.resourceType,
                    amount: p.amount,
                    pos: p.pos
                })
            }

            const withdraws = room.find(FIND_STRUCTURES, {filter: 
                s => s.structureType === STRUCTURE_CONTAINER && s.pos.findInRange(FIND_SOURCES, 1).length > 0
            }) as StructureContainer[]
            for (const w of withdraws) {
                for (const type of Object.keys(w.store)) {
                    result.push({
                        id: w.id,
                        type: 'withdraw',
                        resourceType: type as ResourceConstant,
                        amount: w.store[type as ResourceConstant],
                        pos: w.pos
                    })
                }
            }
        }

        return result 
    },

    get_sources_to_mine(roomName, max_distance) {
        let result: SourceMeta[] = []

        const roomMeta = Memory.worldmap[roomName]
        if (roomMeta === undefined) return result

        result.push(
            ...roomMeta.sources
        )

        if (max_distance > 0 && Memory.worldmap[roomName] && Memory.worldmap[roomName].exits) {
            for (const neightbor_roomName of Object.values(Memory.worldmap[roomName].exits)) {
                result.push(
                    ...this.get_sources_to_mine(neightbor_roomName, max_distance - 1)
                )
            }
        }
        
        return result
    },
    
}