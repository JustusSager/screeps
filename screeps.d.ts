declare global {
    type CreepRole = 'upgrader' | 'hauler' | 'miner' | 'manager' | 'builder' | 'explorer' | 'worker'
    type TaskType = 'upgrade' | 'harvest' | 'build' | 'repair' | 'withdraw' | 'pickup' | 'transfer'
    type TaskTargetType = Structure | Resource | ConstructionSite | Source

    interface IRoomPosition {x: number, y:number, roomName: string}

    interface CreepMemory {
        [name: string]: any;
        role: CreepRole;
        aquire_state: boolean
        room_home: string
        
        hauler_task?: {
            type: 'pickup' | 'withdraw' | 'transfer'
            target_id: string
            pos_target: IRoomPosition
            resource: ResourceConstant,
        }

        task?: CreepTask

        // Für den Manager
        manager_position?: 'nw' | 'ne' | 'sw' | 'se' // die Zielposition des Managers

        // Für den explorer
        room_target?: string 

        // Für role miner
        source_id?: string
        link_id?: string
    }

    interface CreepTask {
        type: TaskType
        target_id: string
        target_pos: IRoomPosition
        range: number
        resource: ResourceConstant
    }

    interface RoomMemory {
        spawner_base_centroid_pos?: {
            x:number, y: number
        }
        spawn_controller_path_exists?: boolean
        spawn_exits_path_exists?: boolean
    }

    interface Memory {
        creeps: {[name: string]: CreepMemory};
        rooms: {[name: string]: RoomMemory};
        worldmap: {[name: string]: RoomMeta}
        debug: {
            creepSaysTask: boolean
            creepSaysErrorCode: boolean
        }
    }

    interface RoomMeta {
        sources: SourceMeta[]
        minerals: MineralMeta[]
        exits: {
            [exitkey: string]: string
        } | null
        owned_by_me: boolean
    }

    interface SourceMeta {
        id: string
        pos: {x: number, y: number, roomName: string}
        guarded: boolean
    }

    interface MineralMeta {
        id: string
        pos: {x: number, y: number, roomName: string}
        type: MineralConstant
        guarded: boolean
    }

    interface RoomVisual {
        list(title: string, items: [], top_left_x: number, top_left_y: number): void

        table(headers: string[], column_widths: number[], items: (string | number)[][], top_left_x: number, top_left_y: number): void

        circle_with_text(text: string, x: number, y: number, radius: number, fill:string, opacity: number): void
    }

    interface Creep {
        moveToRoom(roomName: string): ScreepsReturnCode | undefined
    }
}

export {};