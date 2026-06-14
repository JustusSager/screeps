// eslint-disable-next-line import/no-unresolved
import _ from "lodash";

interface Blueprint {
    blueprints: BlueprintRCL[]
    offset_x: number
    offset_y: number
}

interface BlueprintRCL {
    rcl: number,
    structures: BlueprintStructures
}

type BlueprintStructures = {
    [structures in BuildableStructureConstant]?: { x: number, y: number }[];
};

const spawnerBlueprints: Blueprint = {
    blueprints: [
        {"rcl":2,"structures":{"spawn":[{"x":1,"y":2}],"extension":[{"x":2,"y":1},{"x":1,"y":1},{"x":3,"y":2},{"x":2,"y":3},{"x":3,"y":3}],"road":[{"x":0,"y":1},{"x":1,"y":0},{"x":2,"y":0},{"x":3,"y":0},{"x":4,"y":0},{"x":5,"y":0},{"x":0,"y":2},{"x":0,"y":4},{"x":0,"y":3},{"x":0,"y":5},{"x":1,"y":6},{"x":2,"y":6},{"x":3,"y":6},{"x":4,"y":6},{"x":5,"y":6},{"x":6,"y":5},{"x":6,"y":3},{"x":6,"y":4},{"x":6,"y":2},{"x":6,"y":1}],"container":[{"x":1,"y":3}]}},
        {"rcl":3,"structures":{"spawn":[{"x":1,"y":2}],"extension":[{"x":2,"y":1},{"x":1,"y":1},{"x":3,"y":2},{"x":1,"y":4},{"x":1,"y":5},{"x":2,"y":5},{"x":3,"y":4},{"x":2,"y":3},{"x":3,"y":5},{"x":3,"y":3}],"road":[{"x":0,"y":1},{"x":1,"y":0},{"x":2,"y":0},{"x":3,"y":0},{"x":4,"y":0},{"x":5,"y":0},{"x":0,"y":2},{"x":0,"y":4},{"x":0,"y":3},{"x":0,"y":5},{"x":1,"y":6},{"x":2,"y":6},{"x":3,"y":6},{"x":4,"y":6},{"x":5,"y":6},{"x":6,"y":5},{"x":6,"y":3},{"x":6,"y":4},{"x":6,"y":2},{"x":6,"y":1}],"tower":[{"x":3,"y":1}],"container":[{"x":1,"y":3}]}},
        {"rcl":4,"structures":{"spawn":[{"x":1,"y":2}],"extension":[{"x":4,"y":1},{"x":2,"y":1},{"x":1,"y":1},{"x":3,"y":2},{"x":5,"y":1},{"x":1,"y":4},{"x":1,"y":5},{"x":2,"y":5},{"x":3,"y":4},{"x":2,"y":3},{"x":4,"y":3},{"x":5,"y":4},{"x":5,"y":5},{"x":4,"y":5},{"x":3,"y":5},{"x":5,"y":2},{"x":3,"y":3}],"road":[{"x":0,"y":1},{"x":1,"y":0},{"x":2,"y":0},{"x":3,"y":0},{"x":4,"y":0},{"x":5,"y":0},{"x":0,"y":2},{"x":0,"y":4},{"x":0,"y":3},{"x":0,"y":5},{"x":1,"y":6},{"x":2,"y":6},{"x":3,"y":6},{"x":4,"y":6},{"x":5,"y":6},{"x":6,"y":5},{"x":6,"y":3},{"x":6,"y":4},{"x":6,"y":2},{"x":6,"y":1}],"tower":[{"x":3,"y":1}],"container":[{"x":1,"y":3},{"x":5,"y":3}]}},
        {"rcl":5,"structures":{"spawn":[{"x":1,"y":2}],"extension":[{"x":4,"y":1},{"x":2,"y":1},{"x":1,"y":1},{"x":3,"y":2},{"x":5,"y":1},{"x":1,"y":4},{"x":1,"y":5},{"x":2,"y":5},{"x":3,"y":4},{"x":2,"y":3},{"x":4,"y":3},{"x":5,"y":4},{"x":5,"y":5},{"x":4,"y":5},{"x":3,"y":5},{"x":5,"y":2}],"link":[{"x":3,"y":3}],"road":[{"x":0,"y":1},{"x":1,"y":0},{"x":2,"y":0},{"x":3,"y":0},{"x":4,"y":0},{"x":5,"y":0},{"x":0,"y":2},{"x":0,"y":4},{"x":0,"y":3},{"x":0,"y":5},{"x":1,"y":6},{"x":2,"y":6},{"x":3,"y":6},{"x":4,"y":6},{"x":5,"y":6},{"x":6,"y":5},{"x":6,"y":3},{"x":6,"y":4},{"x":6,"y":2},{"x":6,"y":1}],"tower":[{"x":3,"y":1}],"container":[{"x":1,"y":3},{"x":5,"y":3}]}},
        {"rcl":6,"structures":{"spawn":[{"x":1,"y":2}],"extension":[{"x":4,"y":1},{"x":2,"y":1},{"x":1,"y":1},{"x":3,"y":2},{"x":5,"y":1},{"x":1,"y":4},{"x":1,"y":5},{"x":2,"y":5},{"x":3,"y":4},{"x":2,"y":3},{"x":4,"y":3},{"x":5,"y":4},{"x":5,"y":5},{"x":4,"y":5},{"x":3,"y":5},{"x":5,"y":2}],"link":[{"x":3,"y":3}],"road":[{"x":0,"y":1},{"x":1,"y":0},{"x":2,"y":0},{"x":3,"y":0},{"x":4,"y":0},{"x":5,"y":0},{"x":0,"y":2},{"x":0,"y":4},{"x":0,"y":3},{"x":0,"y":5},{"x":1,"y":6},{"x":2,"y":6},{"x":3,"y":6},{"x":4,"y":6},{"x":5,"y":6},{"x":6,"y":5},{"x":6,"y":3},{"x":6,"y":4},{"x":6,"y":2},{"x":6,"y":1}],"tower":[{"x":3,"y":1}],"container":[{"x":1,"y":3},{"x":5,"y":3}]}},
        {"rcl":7,"structures":{"spawn":[{"x":1,"y":2},{"x":5,"y":2}],"extension":[{"x":4,"y":1},{"x":2,"y":1},{"x":1,"y":1},{"x":3,"y":2},{"x":5,"y":1},{"x":1,"y":4},{"x":1,"y":5},{"x":2,"y":5},{"x":3,"y":4},{"x":2,"y":3},{"x":4,"y":3},{"x":5,"y":4},{"x":5,"y":5},{"x":4,"y":5},{"x":3,"y":5}],"link":[{"x":3,"y":3}],"road":[{"x":0,"y":1},{"x":1,"y":0},{"x":2,"y":0},{"x":3,"y":0},{"x":4,"y":0},{"x":5,"y":0},{"x":0,"y":2},{"x":0,"y":4},{"x":0,"y":3},{"x":0,"y":5},{"x":1,"y":6},{"x":2,"y":6},{"x":3,"y":6},{"x":4,"y":6},{"x":5,"y":6},{"x":6,"y":5},{"x":6,"y":3},{"x":6,"y":4},{"x":6,"y":2},{"x":6,"y":1}],"tower":[{"x":3,"y":1}],"container":[{"x":1,"y":3},{"x":5,"y":3}]}},
        {"rcl":8,"structures":{"spawn":[{"x":1,"y":2},{"x":5,"y":2},{"x":3,"y":5}],"extension":[{"x":4,"y":1},{"x":2,"y":1},{"x":1,"y":1},{"x":3,"y":2},{"x":5,"y":1},{"x":1,"y":4},{"x":1,"y":5},{"x":2,"y":5},{"x":3,"y":4},{"x":2,"y":3},{"x":4,"y":3},{"x":5,"y":4},{"x":5,"y":5},{"x":4,"y":5}],"link":[{"x":3,"y":3}],"road":[{"x":0,"y":1},{"x":1,"y":0},{"x":2,"y":0},{"x":3,"y":0},{"x":4,"y":0},{"x":5,"y":0},{"x":0,"y":2},{"x":0,"y":4},{"x":0,"y":3},{"x":0,"y":5},{"x":1,"y":6},{"x":2,"y":6},{"x":3,"y":6},{"x":4,"y":6},{"x":5,"y":6},{"x":6,"y":5},{"x":6,"y":3},{"x":6,"y":4},{"x":6,"y":2},{"x":6,"y":1}],"tower":[{"x":3,"y":1}],"container":[{"x":1,"y":3},{"x":5,"y":3}]}}
    ],
    // relative to first spawn
    offset_x: 1,
    offset_y: 2
}

function select_spawner_blueprint(rcl: number): BlueprintStructures {
    const blueprint = spawnerBlueprints.blueprints.filter(b => b.rcl === rcl)[0].structures
    
    /*for (const structureType in blueprint) {
        const positions = blueprint[structureType as BuildableStructureConstant];
        if (positions) {
            for (const pos of positions) {
                pos.x -= spawnerBlueprints.offset_x
                pos.y -= spawnerBlueprints.offset_x
            }
        }
    }*/
    return blueprint
}

function select_spawner_offset(): {x: number, y: number} {
    return {
        x: spawnerBlueprints.offset_x,
        y: spawnerBlueprints.offset_y
    }
}

let managerBasebuilding: {
    visualize_spawner_blueprint(spawn: StructureSpawn, roomvisual: RoomVisual, rcl: number): void

    build_spawner_blueprint(spawn:StructureSpawn, rcl:number): void

    build_container_near_controller(room: Room): ScreepsReturnCode

    build_road_network(room: Room, spawn_to_controller: boolean, spawn_to_exits: boolean): ScreepsReturnCode

    build_path(room: Room, from_pos: RoomPosition, to_pos: RoomPosition): ScreepsReturnCode
}

export default managerBasebuilding = {
    visualize_spawner_blueprint(spawn, roomvisual, rcl) {
        const blueprint = select_spawner_blueprint(rcl)
        const offset = select_spawner_offset()
        for (const structureType in blueprint) {
            const positions = blueprint[structureType as BuildableStructureConstant];
            let color = '#ffffff'
            if (structureType == STRUCTURE_ROAD) color = '#7f7f7f'
            if (positions) {
                for (const pos of positions) {
                    roomvisual.circle(pos.x + spawn.pos.x - offset.x, pos.y + spawn.pos.y - offset.y, {radius: 0.5, fill: color, opacity: 0.4})
                }
            }
        }
    },

    build_spawner_blueprint(spawn:StructureSpawn, rcl:number) {
        const blueprint = select_spawner_blueprint(rcl)
        const offset = select_spawner_offset()
        for (const structureType in blueprint) {
            const positions = blueprint[structureType as BuildableStructureConstant];
            let color = '#ffffff'
            if (structureType == STRUCTURE_ROAD) color = '#7f7f7f'
            if (positions) {
                for (const pos of positions) {
                    spawn.room.createConstructionSite(
                        pos.x + spawn.pos.x - offset.x, 
                        pos.y + spawn.pos.y - offset.y,
                        structureType as BuildableStructureConstant
                    )
                }
            }
        }
    },

    build_container_near_controller(room) {
        if (!room.controller) return ERR_NOT_FOUND
        const controller_pos = room.controller.pos
        if (controller_pos.findInRange(FIND_STRUCTURES, 4, {filter: s => s.structureType === STRUCTURE_CONTAINER}).length > 0) return ERR_INVALID_TARGET
        if (controller_pos.findInRange(FIND_CONSTRUCTION_SITES, 4, {filter: s => s.structureType === STRUCTURE_CONTAINER}).length > 0) return ERR_INVALID_TARGET
        if (!room.memory.spawner_base_centroid_pos) return ERR_INVALID_TARGET

        const radius = 2;

        let possiblePositions = []
        let goodPositions = []

        for (let dx = -radius; dx <= radius; dx++) {
            for (let dy = -radius; dy <= radius; dy++) {
                const x = controller_pos.x + dx;
                const y = controller_pos.y + dy;

                const lookAtResult = room.lookAt(x, y).filter(l => l.type === 'constructionSite' || l.type === 'structure' || l.type === 'terrain')
                if (lookAtResult && lookAtResult.length == 1 && lookAtResult[0].type === 'terrain' && lookAtResult[0].terrain !== 'wall') {
                    possiblePositions.push({x: x, y: y})
                }
            }
        }

        for (const possiblePosition of possiblePositions) {
            let isGood = true
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    const x = possiblePosition.x + dx;
                    const y = possiblePosition.y + dy;

                    const lookAtResult = room.lookAt(x, y).filter(l => l.type === 'constructionSite' || l.type === 'structure' || l.type === 'terrain')
                    if (!(lookAtResult && lookAtResult.length == 1 && lookAtResult[0].type === 'terrain' && lookAtResult[0].terrain !== 'wall')) {
                        isGood = false
                    }
                }
            }
            if (isGood) goodPositions.push({x: possiblePosition.x, y: possiblePosition.y})
        }

        const distTarget = room.memory.spawner_base_centroid_pos
        goodPositions.sort((a, b) => {
            const dist_a = Math.abs(a.x - distTarget.x) + Math.abs(a.y - distTarget.y)
            const dist_b = Math.abs(b.x - distTarget.x) + Math.abs(b.y - distTarget.y)
            return dist_a - dist_b
        })

        return room.createConstructionSite(goodPositions[0].x, goodPositions[0].y, STRUCTURE_CONTAINER)
    },

    build_road_network(room, spawn_to_controller, spawn_to_exits) {
        const spawns = room.find(FIND_MY_SPAWNS)
        const controller = room.controller
        const exits = Memory.worldmap[room.name].exits

        if (spawn_to_controller && (Memory.rooms[room.name].spawn_controller_path_exists === undefined || Memory.rooms[room.name].spawn_controller_path_exists === false)&& spawns.length > 0 && controller) {
            this.build_path(room, spawns[0].pos, controller.pos)
            Memory.rooms[room.name].spawn_controller_path_exists = true
        }

        if (spawn_to_exits && (Memory.rooms[room.name].spawn_exits_path_exists === undefined || Memory.rooms[room.name].spawn_exits_path_exists === false)&& spawns.length > 0 && controller) {
            for (const neighborDirection in exits) {
                const neighborRoomName = exits[neighborDirection]
                const route = Game.map.findRoute(room.name, neighborRoomName);
                if(route !== -2 && route.length > 0) {
                    const exitPosition = room.find(route[0].exit)[0]
                    this.build_path(room, spawns[0].pos, exitPosition)
                }
            }
            Memory.rooms[room.name].spawn_exits_path_exists = true
        }
        return OK
    },

    build_path(room, from_pos, to_pos) {
        const path = room.findPath(from_pos, to_pos)
        if (path.length === 0) return ERR_NO_PATH
        for (const step of path) {
            room.createConstructionSite(step.x, step.y, STRUCTURE_ROAD)
        }
        return OK
    }

}