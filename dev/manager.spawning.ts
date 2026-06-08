// eslint-disable-next-line import/no-unresolved
import _ from "lodash";

let managerSpawning: {
    /**
     * @param {Room} room
     */
    create_spawn_queu(room: Room): SpawnRequest[]

    spawn_request(request: SpawnRequest, spawn: StructureSpawn): number
}

export interface SpawnRequest {
    name: string;
    type: 'worker' | 'hauler' | 'miner';
    memory: CreepMemory;
    priority: number;
}

export default managerSpawning = {
    create_spawn_queu(room) {
        let spawn_queu: SpawnRequest[] = [];

        const sources = room.find(FIND_SOURCES);

        for (const source of sources) {
            if (!_.some(Game.creeps, (c) => c.memory.role === 'miner' && c.memory.source_id === source.id)) {
                spawn_queu.push({
                    name: 'miner' + Game.time,
                    type: 'miner',
                    memory: {
                        role: 'miner',
                        source_id: source.id
                    },
                    priority: 8
                })
            }
        }
        return spawn_queu;
    },

    spawn_request(request, spawn) {
        let name: string;
        let body: BodyPartConstant[] = [];
        switch(request.type) {
            case "worker":
                name = 'worker' + Game.time;
                body = [WORK, CARRY, MOVE];
                break;
            case "hauler":
                name = 'hauler' + Game.time;
                body = [CARRY, CARRY, MOVE, MOVE];
                break;
            case "miner":
                name = 'miner' + Game.time;
                body = [WORK, WORK, MOVE];
                break;
            default:
                return -1
        }
        return spawn.spawnCreep(body, name, {memory: request.memory})
    }
}