// eslint-disable-next-line import/no-unresolved
import _ from "lodash";

export interface SpawnRequest {
    name: string;
    body: BodyPartConstant[];
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
        const num_builders = _.filter(Game.creeps, (c) => c.memory.role === 'builder').length;

        const manager_nw = _.some(Game.creeps, (c) => c.memory.role === 'manager' && c.memory.manager_position === 'nw');


        for (const sourceMeta of Memory.worldmap[room.name].sources.filter(s => !s.guarded)) {
            if (!_.some(Game.creeps, (c) => c.memory.role === 'miner' && c.memory.source_id === sourceMeta.id)) {
                spawn_queu.push({
                    name: 'miner' + Game.time,
                    body: [WORK, WORK, MOVE],
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
                body: [CARRY, CARRY, MOVE, MOVE, MOVE],
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
                body: [WORK, CARRY, MOVE, MOVE],
                memory: {
                    role: 'upgrader',
                    aquire_state: true
                },
                priority: num_upgrader === 0 ? 8 : 3
            })
        }

        if (num_builders < 2) {
            spawn_queu.push({
                name: 'builder' + Game.time,
                body: [WORK, CARRY, MOVE, MOVE],
                memory: {
                    role: 'builder',
                    aquire_state: true
                },
                priority: num_upgrader === 0 ? 8 : 3
            })
        }

        const num_extensions = room.find(FIND_MY_STRUCTURES, {filter: s => s.structureType === STRUCTURE_EXTENSION}).length
        if (!manager_nw && num_extensions >= 5) {
            spawn_queu.push({
                name: 'manager_nw',
                body: [CARRY, CARRY, CARRY, CARRY, MOVE],
                memory: {
                    role: 'manager',
                    aquire_state: true,
                    manager_position: 'nw'
                },
                priority: 11
            })
        }


        return spawn_queu;
    },

    order_by_priority(spawn_queu) {
        return spawn_queu.sort((a, b) => b.priority - a.priority)
    },

    spawn_request(request, spawn) {
        return spawn.spawnCreep(request.body, request.name, {memory: request.memory})
    },

    visualize(roomvisual, spawn_queu, left_x, top_y) {

        roomvisual.text("Spawn Queu", left_x, top_y, {color: '#ffffff'})
        for (let i = 0; i < spawn_queu.length; i++) {
            roomvisual.text(spawn_queu[i].memory.role, left_x, top_y+i+1);
        }
    }
}