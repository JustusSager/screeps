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
    }

}