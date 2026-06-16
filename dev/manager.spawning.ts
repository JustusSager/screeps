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
     * Erstellt die spawn queu für einen bestimmten Raum. Hier liegt die höhere Logik wann eine 
     * bestimmte Creep Rolle gespawnt werden soll.
     * @param room Der Raum zu dem der Spawn Manager gehört.
     * @returns Die spawn queu.
     */
    create_spawn_queu(room: Room): SpawnRequest[]

    /**
     * Erstellt eine Spawn Request für einen Upgrader. Hier liegt die Logik wie ein bestimmter Creep aufgebaut sein soll und 
     * wie wichtig dieser Creep ist.
     * @param room Der Raum zu dem der Spawn Manager gehört.
     * @param num_upgraders die aktuelle Anzahl an Upgradern.
     * @param max_upgraders Die maximale Anzahl der Upgrader.
     * @returns Ein Array mit der Spawn Request oder ein leeres Array.
     */
    create_spawn_request_upgrader(room: Room, num_upgraders: number, max_upgraders: number): SpawnRequest[]

    /**
     * Erstellt eine Spawn Request für einen Miner. Hier liegt die Logik wie ein bestimmter Creep aufgebaut sein soll und 
     * wie wichtig dieser Creep ist.
     * @param room Der Raum zu dem der Spawn Manager gehört.
     * @param num_haulers die aktuelle Anzahl an Haulern.
     * @param max_haulers Die maximale Anzahl an Haulern.
     * @returns Ein Array mit der Spawn Request oder ein leeres Array.
     */
    create_spawn_request_miner(room: Room, target_sources: SourceMeta[], current_num_miners: number): SpawnRequest[]

    /**
     * Erstellt eine Spawn Request für einen Hauler. Hier liegt die Logik wie ein bestimmter Creep aufgebaut sein soll und 
     * wie wichtig dieser Creep ist.
     * @param room Der Raum zu dem der Spawn Manager gehört.
     * @param num_haulers die aktuelle Anzahl an Haulern.
     * @param max_haulers Die maximale Anzahl an Haulern.
     * @returns Ein Array mit der Spawn Request oder ein leeres Array.
     */
    create_spawn_request_hauler(room: Room, num_haulers: number, max_haulers: number): SpawnRequest[]

    /**
     * Erstellt eine Spawn Request für einen Builder. Hier liegt die Logik wie ein bestimmter Creep aufgebaut sein soll und 
     * wie wichtig dieser Creep ist.
     * @param room Der Raum zu dem der Spawn Manager gehört.
     * @param num_builders die aktuelle Anzahl an Buildern.
     * @param max_builders Die maximale Anzahl an Buildern.
     * @returns Ein Array mit der Spawn Request oder ein leeres Array.
     */
    create_spawn_request_builder(room: Room, num_builders: number, max_builders: number): SpawnRequest[]

    /**
     * Erstellt eine Spawn Request für einen Explorer Creep für jeden Zielraum. Hier liegt die Logik wie ein bestimmter Creep 
     * aufgebaut sein soll und wie wichtig dieser Creep ist.
     * @param room Der Raum zu dem der Spawn Manager gehört.
     * @param num_upgraders die aktuelle Anzahl an Buildern.
     * @param max_upgraders Die maximale Anzahl an Buildern.
     * @returns Ein Array mit der Spawn Request oder ein leeres Array.
     */
    create_spawn_requests_exploration(room: Room, exploration_targets: string[]): SpawnRequest[]

    order_by_priority(spawn_queu: SpawnRequest[]): SpawnRequest[]

    spawn_request(request: SpawnRequest, spawn: StructureSpawn): number

    visualize(roomvisual: RoomVisual, spawn_queu:SpawnRequest[], left_x: number, top_y: number): void
}

function get_worker_body(availableEnergy: number): BodyPartConstant[] {
    let body: BodyPartConstant[] = []
    let lvl = Math.floor(availableEnergy / 200)
    for (let i = 0; i < lvl; i++) {
        body.push(WORK)
    }
    for (let i = 0; i < lvl; i++) {
        body.push(CARRY)
    }
    for (let i = 0; i < lvl; i++) {
        body.push(MOVE)
    }
    return body
}

function get_miner_body(availableEnergy: number, link_mining: boolean): BodyPartConstant[] {
    let body: BodyPartConstant[] = []
    let lvl = 0
    if (link_mining) {
        lvl = Math.floor((availableEnergy - 100) / 100)
    } else {
        lvl = Math.floor((availableEnergy - 50) / 100)
    }
    if (lvl > 5) lvl = 5
    for (let i = 0; i < lvl; i++) {
        body.push(WORK)
    }
    if (link_mining) body.push(CARRY)
    body.push(MOVE)
    return body
}

function get_hauler_body(availableEnergy: number): BodyPartConstant[] {
    let body: BodyPartConstant[] = []
    let lvl = Math.floor(availableEnergy / 100)
    for (let i = 0; i < lvl; i++) {
        body.push(CARRY)
    }
    for (let i = 0; i < lvl; i++) {
        body.push(MOVE)
    }
    return body
}


export default managerSpawning = {
    create_spawn_queu(room) {
        let spawn_queu: SpawnRequest[] = [];

        const num_miners = _.filter(Game.creeps, (c) => c.memory.role === 'miner').length;
        const num_haulers = _.filter(Game.creeps, (c) => c.memory.role === 'hauler').length;
        const num_upgrader = _.filter(Game.creeps, (c) => c.memory.role === 'upgrader').length;
        const num_builders = _.filter(Game.creeps, (c) => c.memory.role === 'builder').length;

        const manager_nw = _.some(Game.creeps, (c) => c.memory.role === 'manager' && c.memory.manager_position === 'nw');
        const manager_sw = _.some(Game.creeps, (c) => c.memory.role === 'manager' && c.memory.manager_position === 'sw');
        const manager_ne = _.some(Game.creeps, (c) => c.memory.role === 'manager' && c.memory.manager_position === 'ne');
        const manager_se = _.some(Game.creeps, (c) => c.memory.role === 'manager' && c.memory.manager_position === 'se');

        
        spawn_queu.push(...this.create_spawn_request_hauler(room, num_haulers, num_miners * 2))

        // Upgrader
        if (room.controller && room.controller.level < 8) {
            spawn_queu.push(...this.create_spawn_request_upgrader(room, num_upgrader, 3))
        } else if(room.controller && room.controller.level == 8) {
            spawn_queu.push(...this.create_spawn_request_upgrader(room, num_upgrader, 1))
        }

        // Builder
        if (room.find(FIND_CONSTRUCTION_SITES).length > 0) {
            spawn_queu.push(...this.create_spawn_request_builder(room, num_builders, 2))
        }

        const num_extensions = room.find(FIND_MY_STRUCTURES, {filter: s => s.structureType === STRUCTURE_EXTENSION}).length
        if (!manager_nw && num_extensions >= 5) {
            spawn_queu.push({
                name: 'manager_nw',
                body: [CARRY, CARRY, CARRY, CARRY, MOVE],
                memory: {
                    role: 'manager',
                    aquire_state: true,
                    manager_position: 'nw',
                    room_home: room.name
                },
                priority: 11
            })
        }
        if (!manager_sw && num_extensions >= 10) {
            spawn_queu.push({
                name: 'manager_sw',
                body: [CARRY, CARRY, CARRY, CARRY, MOVE],
                memory: {
                    role: 'manager',
                    aquire_state: true,
                    manager_position: 'sw',
                    room_home: room.name
                },
                priority: 11
            })
        }
        if (!manager_ne && num_extensions >= 14) {
            spawn_queu.push({
                name: 'manager_ne',
                body: [CARRY, CARRY, CARRY, CARRY, MOVE],
                memory: {
                    role: 'manager',
                    aquire_state: true,
                    manager_position: 'ne',
                    room_home: room.name
                },
                priority: 11
            })
        }
        if (!manager_se && num_extensions >= 14) {
            spawn_queu.push({
                name: 'manager_se',
                body: [CARRY, CARRY, CARRY, CARRY, MOVE],
                memory: {
                    role: 'manager',
                    aquire_state: true,
                    manager_position: 'se',
                    room_home: room.name
                },
                priority: 11
            })
        }


        return spawn_queu;
    },

    create_spawn_request_upgrader(room, num_upgraders, max_upgraders) {
        let spawn_queu: SpawnRequest[] = []
        if (num_upgraders < max_upgraders) {
            spawn_queu.push({
                name: 'upgrader' + Game.time,
                body: get_worker_body(room.energyAvailable),
                memory: {
                    role: 'upgrader',
                    aquire_state: true,
                    room_home: room.name
                },
                priority: num_upgraders === 0 ? 8 : 3
            })
        }
        return spawn_queu
    },

    create_spawn_request_miner(room, target_sources, current_num_miners) {
        let spawn_queu: SpawnRequest[] = []

        for (const sourceMeta of target_sources) {
            if (!_.some(Game.creeps, (c) => c.memory.role === 'miner' && c.memory.source_id === sourceMeta.id)) {
                spawn_queu.push({
                    name: 'miner' + Game.time,
                    body: get_miner_body(room.energyAvailable > 600 ? 600 : room.energyAvailable, false),
                    memory: {
                        role: 'miner',
                        source_id: sourceMeta.id,
                        aquire_state: true,
                        room_home: room.name,
                        room_target: sourceMeta.pos.roomName
                    },
                    priority: current_num_miners === 0 ? 10 : 5
                })
                break;
            }
        }

        return spawn_queu
    },

    create_spawn_request_hauler(room, num_haulers, max_haulers) {
        let spawn_queu: SpawnRequest[] = []
        if (num_haulers < max_haulers) {
            spawn_queu.push({
                name: 'hauler' + Game.time,
                body: get_hauler_body(room.energyAvailable),
                memory: {
                    role: 'hauler',
                    aquire_state: true,
                    room_home: room.name
                },
                priority: num_haulers === 0 ? 9 : 4
            })
        }
        return spawn_queu
    },

    create_spawn_request_builder(room, num_builders, max_builders) {
        let spawn_queu: SpawnRequest[] = []
        if (num_builders < max_builders) {
            spawn_queu.push({
                name: 'builder' + Game.time,
                body: get_worker_body(room.energyAvailable),
                memory: {
                    role: 'builder',
                    aquire_state: true,
                    room_home: room.name
                },
                priority: num_builders === 0 ? 8 : 3
            })
        }
        return spawn_queu
    },

    create_spawn_requests_exploration(room, exploration_targets) {
        let spawn_queu: SpawnRequest[] = []
        for (const target_name of exploration_targets) {
            if (_.some(Game.creeps, c => c.memory.role === 'explorer' && c.memory.room_target === target_name)) continue;
            if (Game.map.getRoomStatus(target_name) !== undefined && Game.map.getRoomStatus(target_name).status === 'normal') {
                spawn_queu.push({
                    name: 'explorer'+target_name,
                    body: [MOVE],
                    memory: {
                        role: 'explorer',
                        aquire_state: true,
                        room_home: room.name,
                        room_target: target_name
                    },
                    priority: 2
                })
            }
        }
        return spawn_queu
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