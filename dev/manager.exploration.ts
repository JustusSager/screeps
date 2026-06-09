// eslint-disable-next-line import/no-unresolved
import _ from "lodash";

interface ExplorationTargets {
    roomname: string
}


let managerExploration: {
    find_exploration_targets(): string[]


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
    }

    
}