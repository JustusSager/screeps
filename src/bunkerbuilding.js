var config = require('config');

var blueprint = [
    {"type": STRUCTURE_ROAD, "rcl": 0, "x":7,"y":6},
    {"type": STRUCTURE_ROAD, "rcl": 0, "x":8,"y":5},
    {"type": STRUCTURE_ROAD, "rcl": 0, "x":9,"y":4},
    {"type": STRUCTURE_ROAD, "rcl": 0, "x":10,"y":5},
    {"type": STRUCTURE_ROAD, "rcl": 0, "x":11,"y":6},
    {"type": STRUCTURE_ROAD, "rcl": 0, "x":12,"y":7},
    {"type": STRUCTURE_ROAD, "rcl": 0, "x":11,"y":8},
    {"type": STRUCTURE_ROAD, "rcl": 0, "x":10,"y":9},
    {"type": STRUCTURE_ROAD, "rcl": 0, "x":9,"y":10},
    {"type": STRUCTURE_ROAD, "rcl": 0, "x":8,"y":9},
    {"type": STRUCTURE_ROAD, "rcl": 0, "x":7,"y":8},
    {"type": STRUCTURE_ROAD, "rcl": 0, "x":6,"y":7},
    {"type": STRUCTURE_ROAD, "rcl": 0, "x":8,"y":3},
    {"type": STRUCTURE_ROAD, "rcl": 0, "x":7,"y":2},
    {"type": STRUCTURE_ROAD, "rcl": 0, "x":13,"y":6},
    {"type": STRUCTURE_ROAD, "rcl": 0, "x":14,"y":5},
    {"type": STRUCTURE_ROAD, "rcl": 0, "x":10,"y":11},
    {"type": STRUCTURE_ROAD, "rcl": 0, "x":11,"y":12},
    {"type": STRUCTURE_ROAD, "rcl": 0, "x":5,"y":8},
    {"type": STRUCTURE_ROAD, "rcl": 0, "x":4,"y":9},
    {"type": STRUCTURE_ROAD, "rcl": 0, "x":6,"y":3},
    {"type": STRUCTURE_ROAD, "rcl": 0, "x":5,"y":4},
    {"type": STRUCTURE_ROAD, "rcl": 0, "x":4,"y":5},
    {"type": STRUCTURE_ROAD, "rcl": 0, "x":3,"y":6},
    {"type": STRUCTURE_ROAD, "rcl": 0, "x":3,"y":7},
    {"type": STRUCTURE_ROAD, "rcl": 0, "x":3,"y":8},
    {"type": STRUCTURE_ROAD, "rcl": 0, "x":5,"y":10},
    {"type": STRUCTURE_ROAD, "rcl": 0, "x":6,"y":11},
    {"type": STRUCTURE_ROAD, "rcl": 0, "x":7,"y":12},
    {"type": STRUCTURE_ROAD, "rcl": 0, "x":8,"y":13},
    {"type": STRUCTURE_ROAD, "rcl": 0, "x":9,"y":13},
    {"type": STRUCTURE_ROAD, "rcl": 0, "x":10,"y":13},
    {"type": STRUCTURE_ROAD, "rcl": 0, "x":12,"y":11},
    {"type": STRUCTURE_ROAD, "rcl": 0, "x":13,"y":10},
    {"type": STRUCTURE_ROAD, "rcl": 0, "x":14,"y":9},
    {"type": STRUCTURE_ROAD, "rcl": 0, "x":15,"y":8},
    {"type": STRUCTURE_ROAD, "rcl": 0, "x":15,"y":7},
    {"type": STRUCTURE_ROAD, "rcl": 0, "x":15,"y":6},
    {"type": STRUCTURE_ROAD, "rcl": 0, "x":13,"y":4},
    {"type": STRUCTURE_ROAD, "rcl": 0, "x":9,"y":1},
    {"type": STRUCTURE_ROAD, "rcl": 0, "x":8,"y":1},
    {"type": STRUCTURE_ROAD, "rcl": 0, "x":10,"y":1},
    {"type": STRUCTURE_ROAD, "rcl": 0, "x":11,"y":2},
    {"type": STRUCTURE_ROAD, "rcl": 0, "x":12,"y":3},
    {"type": STRUCTURE_SPAWN, "rcl":1, "x":10,"y":6},
    {"type": STRUCTURE_EXTENSION, "rcl": 2, "x":7,"y":3},
    {"type": STRUCTURE_EXTENSION, "rcl": 2, "x":6,"y":4},
    {"type": STRUCTURE_EXTENSION, "rcl": 2, "x":5,"y":5},
    {"type": STRUCTURE_EXTENSION, "rcl": 2, "x":8,"y":4},
    {"type": STRUCTURE_EXTENSION, "rcl": 2, "x":7,"y":5},
    {"type": STRUCTURE_EXTENSION, "rcl": 3, "x":4,"y":6},
    {"type": STRUCTURE_EXTENSION, "rcl": 3, "x":4,"y":8},
    {"type": STRUCTURE_EXTENSION, "rcl": 3, "x":5,"y":7},
    {"type": STRUCTURE_EXTENSION, "rcl": 3, "x":6,"y":6},
    {"type": STRUCTURE_EXTENSION, "rcl": 3, "x":6,"y":8},
    {"type": STRUCTURE_EXTENSION, "rcl": 4, "x":4,"y":7},
    {"type": STRUCTURE_EXTENSION, "rcl": 4, "x":5,"y":9},
    {"type": STRUCTURE_EXTENSION, "rcl": 4, "x":6,"y":10},
    {"type": STRUCTURE_EXTENSION, "rcl": 4, "x":7,"y":9},
    {"type": STRUCTURE_EXTENSION, "rcl": 4, "x":7,"y":11},
    {"type": STRUCTURE_EXTENSION, "rcl": 4, "x":8,"y":10},
    {"type": STRUCTURE_EXTENSION, "rcl": 4, "x":8,"y":12},
    {"type": STRUCTURE_EXTENSION, "rcl": 4, "x":9,"y":11},
    {"type": STRUCTURE_EXTENSION, "rcl": 4, "x":9,"y":12},
    {"type": STRUCTURE_EXTENSION, "rcl": 4, "x":10,"y":10},
    {"type": STRUCTURE_EXTENSION, "rcl": 4, "x":10,"y":12},
    {"type": STRUCTURE_EXTENSION, "rcl": 5, "x":8,"y":2},
    {"type": STRUCTURE_EXTENSION, "rcl": 5, "x":9,"y":2},
    {"type": STRUCTURE_EXTENSION, "rcl": 5, "x":9,"y":3},
    {"type": STRUCTURE_EXTENSION, "rcl": 5, "x":10,"y":2},
    {"type": STRUCTURE_EXTENSION, "rcl": 5, "x":10,"y":4},
    {"type": STRUCTURE_EXTENSION, "rcl": 5, "x":11,"y":3},
    {"type": STRUCTURE_EXTENSION, "rcl": 5, "x":11,"y":5},
    {"type": STRUCTURE_EXTENSION, "rcl": 5, "x":11,"y":9},
    {"type": STRUCTURE_EXTENSION, "rcl": 5, "x":11,"y":11},
    {"type": STRUCTURE_EXTENSION, "rcl": 5, "x":12,"y":4},
    {"type": STRUCTURE_EXTENSION, "rcl": 5, "x":12,"y":6},
    {"type": STRUCTURE_EXTENSION, "rcl": 5, "x":12,"y":8},
    {"type": STRUCTURE_EXTENSION, "rcl": 5, "x":12,"y":10},
    {"type": STRUCTURE_EXTENSION, "rcl": 5, "x":13,"y":5},
    {"type": STRUCTURE_EXTENSION, "rcl": 5, "x":13,"y":7},
    {"type": STRUCTURE_EXTENSION, "rcl": 5, "x":13,"y":9},
    {"type": STRUCTURE_EXTENSION, "rcl": 5, "x":14,"y":6},
    {"type": STRUCTURE_EXTENSION, "rcl": 5, "x":14,"y":7},
    {"type": STRUCTURE_EXTENSION, "rcl": 5, "x":14,"y":8},
    {"type": STRUCTURE_TOWER, "rcl": 3, "x":9,"y":6},
    {"type": STRUCTURE_TOWER, "rcl": 5, "x":9,"y":8},
    {"type": STRUCTURE_TOWER, "rcl": 7, "x":7,"y":7},
    {"type": STRUCTURE_TOWER, "rcl": 8, "x":9,"y":5},
    {"type": STRUCTURE_TOWER, "rcl": 8, "x":9,"y":9},
    {"type": STRUCTURE_TOWER, "rcl": 8, "x":11,"y":7},
    {"type": STRUCTURE_STORAGE, "rcl": 4, "x":8,"y":7},
    {"type": STRUCTURE_LINK, "rcl": 5, "x":10,"y":8},
    {"type": STRUCTURE_TERMINAL, "rcl": 6, "x":10,"y":7},
    {"type": STRUCTURE_LAB, "rcl": 6, "x":12,"y":5},
    {"type": STRUCTURE_LAB, "rcl": 6, "x":11,"y":10},
    {"type": STRUCTURE_LAB, "rcl": 6, "x":12,"y":9},
    {"type": STRUCTURE_LAB, "rcl": 6, "x":13,"y":8},
    {"type": STRUCTURE_LAB, "rcl": 6, "x":6,"y":9},
    {"type": STRUCTURE_LAB, "rcl": 6, "x":7,"y":10},
    {"type": STRUCTURE_LAB, "rcl": 6, "x":8,"y":11},
    {"type": STRUCTURE_LAB, "rcl": 6, "x":5,"y":6},
    {"type": STRUCTURE_LAB, "rcl": 6, "x":6,"y":5},
    {"type": STRUCTURE_LAB, "rcl": 6, "x":7,"y":4},
    {"type": STRUCTURE_FACTORY, "rcl": 7, "x":10,"y":3},
    {"type": STRUCTURE_OBSERVER, "rcl": 8, "x":11,"y":4},
    {"type": STRUCTURE_POWER_SPAWN, "rcl": 8, "x":8,"y":8},
    {"type": STRUCTURE_NUKER, "rcl": 8, "x":8,"y":6}
]

var counter = 0;

function calculate_offset(dict, flag) {
    return {
        'x': (dict.x - 9 + flag.pos.x), 
        'y': (dict.y - 7 + flag.pos.y)
    }
}

function place_construction_sites(flag, rcl_level) {
    if (counter >= blueprint.length) {
      counter = 0;
    }
    
    if (blueprint[counter].rcl > rcl_level) {
      counter++
      return;
    }

    // calculate position
    let building_cords = calculate_offset(blueprint[counter], flag);
    
    // check, if a road is blocking a non-road 
    let check_pos = flag.room.lookAt(building_cords.x, building_cords.y);
    let road_blocking = false;
    if (check_pos[0].type == 'structure') {
      if (check_pos[0].structure.structureType == 'road' && blueprint[counter].type != STRUCTURE_ROAD) {
        console.log('Road is blocking non-road');
        road_blocking = true;
      }
    }

    console.log('Trying building: ' + JSON.stringify(blueprint[counter]))

    // place construction site
    let name = flag.room.createConstructionSite(building_cords.x, building_cords.y, blueprint[counter].type);

    // check for errors
    if (name == ERR_INVALID_TARGET) {
        console.log('ERR_INVALID_TARGET');
        if (road_blocking) {
          // Destroy road if it is blocking a buildable non-road
          Game.getObjectById(check_pos[0].structure.id).destroy();
          console.log('Destroy Road at: ' + JSON.stringify(check_pos[0].structure.pos))
        }
    } 
    else if (name == ERR_INVALID_ARGS) {
      console.log('ERR_INVALID_ARGS');
    } 
    else if (name == ERR_RCL_NOT_ENOUGH) {
      // Cant build that yet
      console.log('ERR_RCL_NOT_ENOUGH');
    }
    counter++;
}

module.exports = {
    run: function() {
        if(!Game.flags.BunkerFlag) {
          return;
        }
        let flags = [Game.flags.BunkerFlag, Game.flags.BunkerFlag1]
        for (let i in flags) {
          let rcl_level = flags[i].room.controller.level
          if(flags[i].room.memory.construction_sites.length < config.basebuilding.maxConstructionSites) {
            place_construction_sites(flags[i], rcl_level);
            flags[i].room.memory_construction_sites();
          }
        }
        
    }
};
