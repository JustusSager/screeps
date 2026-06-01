var config = require('config');
var blueprint = require('blueprint');
var baseplaningUtils = require('utils');

function print_result(flag, code, structure_type, structure_pos) {
    if (!config.basebuilding.printResult) return;

    console.log(flag.name + ' Trying building: ' + structure_type + ' at ' + JSON.stringify(structure_pos))
    if (code == OK) {
        console.log('SUCCESS');
    }
    else if (code == ERR_INVALID_TARGET) {
        console.log('ERR_INVALID_TARGET');
    }
    else if (code == ERR_INVALID_ARGS) {
        console.log('ERR_INVALID_ARGS');
    }
    else if (code == ERR_RCL_NOT_ENOUGH) {
        // Cant build that yet
        console.log('ERR_RCL_NOT_ENOUGH');
    }
}

function place_construction_sites(flag, blueprint_type, blueprint_pos) {
    console.log(blueprint_type)
    if (blueprint_type == STRUCTURE_RAMPART && flag.room.controller.level < config.basebuilding.rampartRCLLevel) {
        console.log("skipped")
        return;
    }

    // calculate position
    let pos = { "x": blueprint_pos.x + flag.pos.x, "y": blueprint_pos.y + flag.pos.y };

    // check, if a road is blocking a non-road 
    let check_pos = flag.room.lookAt(pos.x, pos.y);
    if (check_pos[0] && check_pos[0].type == 'structure') {
        if (check_pos[0].structure.structureType == 'road' && blueprint_type != STRUCTURE_ROAD) {
            console.log('Road is blocking non-road');
            Game.getObjectById(check_pos[0].structure.id).destroy();
            console.log('Destroy Road at: ' + JSON.stringify(check_pos[0].structure.pos))
        }
    }

    // place construction site
    let name = flag.room.createConstructionSite(pos.x, pos.y, blueprint_type);

    print_result(flag, name, blueprint_type, JSON.stringify(pos));
}

function getBlueprint(name) {
    if (!blueprint[name]) return [];

    const structures = blueprint[name].structures;
    const x_offset = blueprint[name].x_offset;
    const y_offset = blueprint[name].y_offset;

    let result = [];
    for (const [type, positions] of Object.entries(structures)) {
        for (const position of positions) {
            result.push({
                "type": type,
                "pos": {
                    "x": (position.x - x_offset),
                    "y": (position.y - y_offset)
                }
            });
        }
    }
    return result;
}

module.exports = {
    run: function (flag) {
        const buildplan = getBlueprint("bunker");

        // inital set of the blueprints index in memory
        if (!flag.memory.counter || flag.memory.counter >= buildplan.length) {
            flag.memory.counter = 0;
        }

        let counter = flag.memory.counter;
        console.log(counter + " " + buildplan.length);

        place_construction_sites(flag, buildplan[counter].type, buildplan[counter].pos);
        counter++;
        flag.memory.counter = counter;
    }
};
