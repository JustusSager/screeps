// eslint-disable-next-line import/no-unresolved
import _ from "lodash";

interface ExplorationTargets {
    roomname: string
}

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


let managerExploration: {

    find_exploration_targets(): string[]

    add_room_to_worldmap(room: Room): void

}

export default managerExploration = {

    find_exploration_targets() {
        let exploration_targets: string[] = []

        for (const roomname in Memory.worldmap) {
            const roomMeta = Memory.worldmap[roomname]

            if (roomMeta && roomMeta.exits && roomMeta.owned_by_me) {

                for (const exitDirection in roomMeta.exits) {
                    const target_room_name = roomMeta.exits[exitDirection]

                    if (!Memory.worldmap[target_room_name] && !exploration_targets.includes(target_room_name)) {
                        exploration_targets.push(roomMeta.exits[exitDirection])
                    }
                }
            }
        }
        return exploration_targets;
    },

    add_room_to_worldmap(room) {
        Memory.worldmap[room.name] = {
            sources: room.find(FIND_SOURCES).map((s) => {return { 
                id: s.id,
                pos: {
                    x: s.pos.x,
                    y: s.pos.y,
                    roomName: s.pos.roomName
                },
                guarded: (s.pos.findInRange(FIND_HOSTILE_STRUCTURES, 5).length > 0 || s.pos.findInRange(FIND_HOSTILE_CREEPS, 5).length > 0) 
            }}),
            minerals: room.find(FIND_MINERALS).map((m) => {return {
                id: m.id,
                pos: m.pos,
                type: m.mineralType,
                guarded: (m.pos.findInRange(FIND_HOSTILE_STRUCTURES, 5).length > 0 || m.pos.findInRange(FIND_HOSTILE_CREEPS, 5).length > 0) 
            }}),
            exits: Game.map.describeExits(room.name),
            owned_by_me: (room.controller !== undefined && room.controller.my)
        }
    }
    
}