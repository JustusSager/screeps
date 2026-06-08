declare global {
    interface CreepMemory {
        [name: string]: any;
        role: 'upgrader' | 'hauler' | 'miner';
        aquire_state: boolean

        // Für role worker
        task?: Task;

        // Für role miner
        source_id?: string
        link_id?: string
    }

    interface Memory {
        creeps: {[name: string]: CreepMemory};
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