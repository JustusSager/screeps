declare global {
    interface CreepMemory {
        [name: string]: any;
        role: 'upgrader' | 'hauler' | 'miner' | 'manager' | 'builder' | 'explorer';
        aquire_state: boolean
        room_home: string

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
        sources: {
            id: string,
            guarded: boolean
        }[];
        minerals: {
            id: string,
            type: string,
            guarded: boolean
        }[]
        exits: {
            [exitkey: string]: string
        } | null
        owned_by_me: boolean
    }
}

export {};