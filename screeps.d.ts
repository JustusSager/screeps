declare global {
    interface CreepMemory {
        [name: string]: any;
        role: 'upgrader' | 'hauler' | 'miner' | 'manager' | 'builder';
        aquire_state: boolean

        manager_position?: 'nw' | 'ne' | 'sw' | 'se' // die Zielposition des Managers

        // Für role worker
        task?: Task;

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
    }
}

export {};