let roleHauler: {
    /**
     * @param {Creep} creep
     */
    run(creep: Creep): void
}

function get_target_pos(creep: Creep) : RoomPosition | undefined {
    if (!creep.room.memory.spawner_base_centroid_pos) return;
    const spawner_base_centroid_pos = creep.room.memory.spawner_base_centroid_pos;

    switch (creep.memory.manager_position) {
        case 'nw':
            return RoomPosition(spawner_base_centroid_pos.x - 1, spawner_base_centroid_pos.y - 1, creep.room.name);
        case 'ne':
            return RoomPosition(spawner_base_centroid_pos.x + 1, spawner_base_centroid_pos.y - 1, creep.room.name)
        case 'sw':
            return RoomPosition(spawner_base_centroid_pos.x - 1, spawner_base_centroid_pos.y + 1, creep.room.name)
        case 'se':
            return RoomPosition(spawner_base_centroid_pos.x + 1, spawner_base_centroid_pos.y + 1, creep.room.name)
        default:
            return;
    }
}

export default roleHauler = {
    run(creep) {
        const target_pos = get_target_pos(creep);
        if (target_pos && creep.pos !== target_pos) {
            return creep.moveTo(target_pos);
        }

        if (creep.memory.aquire_state && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
            creep.memory.aquire_state = false;
        } 
        else if (!creep.memory.aquire_state && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.aquire_state = true;
        }

        if (creep.memory.aquire_state) {
            const sources = creep.pos.findInRange(FIND_STRUCTURES, 1, {filter: s => s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0});
            if (sources.length > 0) {
                creep.memory.aquire_state = false;
                return creep.withdraw(sources[0], RESOURCE_ENERGY)
            }
        }
        else {
            const targets_spawn_extension = creep.pos.findInRange(FIND_MY_STRUCTURES, 1, {
                filter: (s: AnyOwnedStructure) => ((s.structureType === STRUCTURE_SPAWN || s.structureType === STRUCTURE_EXTENSION) && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
            })
            if (targets_spawn_extension.length > 0) {
                return creep.transfer(targets_spawn_extension[0], RESOURCE_ENERGY);
            }
            const targets_tower = creep.pos.findInRange(FIND_MY_STRUCTURES, 1, {
                filter: (s: AnyOwnedStructure) => (s.structureType === STRUCTURE_TOWER && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
            })
            if (targets_tower.length > 0) {
                return creep.transfer(targets_tower[0], RESOURCE_ENERGY);
            }
        }
        return -1
    },
}