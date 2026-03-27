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
  if (blueprint_type == STRUCTURE_RAMPART && flag.room.rcl_level < config.basebuilding.rampartRCLLevel) {
    return;
  }

  // calculate position
  let pos = {"x": blueprint_pos.x + flag.pos.x, "y": blueprint_pos.y + flag.pos.y};
  
  // check, if a road is blocking a non-road 
  let check_pos = flag.room.lookAt(pos.x, pos.y);
  if (check_pos[0].type == 'structure') {
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
    run: function() {
        // Get the Basebuilding flags
        if(config.basebuilding.flagNames.length == 0) return;
        let flags = []
        for (const i in config.basebuilding.flagNames) {
          flags.push(Game.flags[config.basebuilding.flagNames[i]])
        }
        if (flags.length == 0) return;

        const buildplan = getBlueprint("bunker");

        for (let i in flags) {
          // inital set of the blueprints index in memory
          if (!flags[i].memory.counter) {
            flags[i].memory.counter = 0;
          }

          let counter = flags[i].memory.counter;

          let rcl_level = flags[i].room.controller.level
          if(flags[i].room.memory.construction_sites.length < config.basebuilding.maxConstructionSites) {
            place_construction_sites(flags[i], buildplan[counter].type, buildplan[counter].pos);
            counter++;

            if (counter > buildplan.length) {
              counter = 0;
            }

            flags[i].room.memory_construction_sites();
          }
          flags[i].memory.counter = counter;
        }
        
    },

    baseplaning: function() {
      const flag = Game.flags['floodfill']
      if (flag) {
        baseplaningUtils.getDistanceTransform(flag.room.name, {visual: true});
      }
    }
};
