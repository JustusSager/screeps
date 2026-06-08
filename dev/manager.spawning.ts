// eslint-disable-next-line import/no-unresolved
import _ from "lodash";

export interface SpawnRequest {
    name: string;
    type: 'upgrader' | 'hauler' | 'miner';
    memory: CreepMemory;
    priority: number;
}

let managerSpawning: {
    /**
     * @param {Room} room
     */
    create_spawn_queu(room: Room): SpawnRequest[]

    order_by_priority(spawn_queu: SpawnRequest[]): SpawnRequest[]

    spawn_request(request: SpawnRequest, spawn: StructureSpawn): number

    visualize(roomvisual: RoomVisual, spawn_queu:SpawnRequest[], left_x: number, top_y: number): void
}

export default managerSpawning = {
    create_spawn_queu(room) {
        let spawn_queu: SpawnRequest[] = [];

        const num_miners = _.filter(Game.creeps, (c) => c.memory.role === 'miner').length;
        const num_haulers = _.filter(Game.creeps, (c) => c.memory.role === 'hauler').length;
        const num_upgrader = _.filter(Game.creeps, (c) => c.memory.role === 'upgrader').length;


        for (const sourceMeta of Memory.worldmap[room.name].sources.filter(s => !s.guarded)) {
            if (!_.some(Game.creeps, (c) => c.memory.role === 'miner' && c.memory.source_id === sourceMeta.id)) {
                spawn_queu.push({
                    name: 'miner' + Game.time,
                    type: 'miner',
                    memory: {
                        role: 'miner',
                        source_id: sourceMeta.id,
                        aquire_state: true
                    },
                    priority: num_miners === 0 ? 10 : 5
                })
                break;
            }
        }

        
        if (num_haulers < num_miners * 2) {
            spawn_queu.push({
                name: 'hauler' + Game.time,
                type: 'hauler',
                memory: {
                    role: 'hauler',
                    aquire_state: true
                },
                priority: num_haulers === 0 ? 9 : 4
            })
        }

        if (num_upgrader < 2) {
            spawn_queu.push({
                name: 'upgrader' + Game.time,
                type: 'upgrader',
                memory: {
                    role: 'upgrader',
                    aquire_state: true
                },
                priority: num_upgrader === 0 ? 8 : 3
            })
        }
        return spawn_queu;
    },

    order_by_priority(spawn_queu) {
        return spawn_queu.sort((a, b) => b.priority - a.priority)
    },

    spawn_request(request, spawn) {
        let name: string;
        let body: BodyPartConstant[] = [];
        switch(request.type) {
            case "upgrader":
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
    },

    visualize(roomvisual, spawn_queu, left_x, top_y) {

        roomvisual.text("Spawn Queu", left_x, top_y, {color: '#ffffff'})
        for (let i = 0; i < spawn_queu.length; i++) {
            roomvisual.text(spawn_queu[i].type, left_x, top_y+i+1);
        }
    }
}