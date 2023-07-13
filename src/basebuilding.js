var config = require('config');
var blueprint = require('blueprint');

var blueprint = blueprint.bunker

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
