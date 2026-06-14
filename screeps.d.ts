declare global {
    interface CreepMemory {
        [name: string]: any;
        role: 'upgrader' | 'hauler' | 'miner' | 'manager' | 'builder' | 'explorer';
        aquire_state: boolean
        room_home: string
        
        hauler_task?: {
            type: 'pickup' | 'withdraw' | 'transfer'
            target_id: string
            pos_target: {x: number, y: number, roomName: string}
            resource: ResourceConstant,
        }

        // Für den Manager
        manager_position?: 'nw' | 'ne' | 'sw' | 'se' // die Zielposition des Managers

        // Für den explorer
        room_target?: string 

        // Für role miner
        source_id?: string
        link_id?: string
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
    }

    interface Task {
        type: 'harvest' | 'withdraw' | 'pickup' | 'upgrade' | 'transfer' | 'build' | 'repair';
        target: any;
        range: number;
        resource: ResourceConstant;
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
}

export {};