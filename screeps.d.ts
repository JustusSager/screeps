declare global {
    interface CreepMemory {
        [name: string]: any;
        role: 'worker' | 'hauler' | 'miner';

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
        type:string;
        target_id: string;
        range: number;
        resource?: string;
        work_left?: number;
        work_assigned?: number;
        priority?: number;
    }

    interface RoomMeta {
        sources: {
            id: string
        }[];
        minerals: {
            id: string,
            type: string
        }[]
        exits: {
            [direction: string]: string
        }
    }
}

export {};