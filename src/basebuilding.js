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

function print_result(flag, code, rampart_code, building) {
  if (!config.basebuilding.printResult) return;

  console.log(flag.name + ' Trying building: ' + JSON.stringify(building))
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
  console.log(flag.name + 'Rampart building: ' + rampart_code);
  
}

function place_rampart(flag, rcl_level, counter) {
    if (!blueprint[counter] || rcl_level < config.basebuilding.rampartRCLLevel) {
      return false;
    }
    let ramparts_on_repair = _.filter(Game.structures, s => s.structureType == STRUCTURE_RAMPART && s.room == flag.room && s.hits < config.structureTower.repairMaxHits);
    if (ramparts_on_repair.length > 0) {
      return false;
    }
    
    let building_cords = calculate_offset(blueprint[counter], flag);
    let check_pos = flag.room.lookAt(building_cords.x, building_cords.y);
    if (check_pos[0].type == 'structure') {
      if (check_pos[0].structure.structureType == 'road' && rcl_level < config.basebuilding.rampartOnRoadsRCLLevel) {
        return false;
      }
      return flag.room.createConstructionSite(building_cords.x, building_cords.y, STRUCTURE_RAMPART);
    }
    return false;
}

function place_construction_sites(flag, rcl_level, counter) {
    if (!blueprint[counter] || blueprint[counter].rcl > rcl_level) {
      return;
    }

    // calculate position
    let building_cords = calculate_offset(blueprint[counter], flag);
    
    // check, if a road is blocking a non-road 
    let check_pos = flag.room.lookAt(building_cords.x, building_cords.y);
    if (check_pos[0].type == 'structure') {
      if (check_pos[0].structure.structureType == 'road' && blueprint[counter].type != STRUCTURE_ROAD) {
        console.log('Road is blocking non-road');
        Game.getObjectById(check_pos[0].structure.id).destroy();
        console.log('Destroy Road at: ' + JSON.stringify(check_pos[0].structure.pos))
      }
    }

    // place construction site
    let name = flag.room.createConstructionSite(building_cords.x, building_cords.y, blueprint[counter].type);

    let rampart_name = place_rampart(flag, rcl_level, counter);

    print_result(flag, name, rampart_name, blueprint[counter]);
}

module.exports = {
    run: function() {
        if(config.basebuilding.flagNames.length == 0) {
          return;
        }
        let flags = []
        for (let i in config.basebuilding.flagNames) {
          flags.push(Game.flags[config.basebuilding.flagNames[i]])
        }

        for (let i in flags) {
          if (!flags[i].memory.counter) {
            flags[i].memory.counter = 0;
          }
          let rcl_level = flags[i].room.controller.level
          if(flags[i].room.memory.construction_sites.length < config.basebuilding.maxConstructionSites) {
            place_construction_sites(flags[i], rcl_level, flags[i].memory.counter);
            flags[i].memory.counter = flags[i].memory.counter + 1;

            if (flags[i].memory.counter > blueprint.length) {
              flags[i].memory.counter = 0;
            }

            flags[i].room.memory_construction_sites();
          }
        }
        
    }
};
