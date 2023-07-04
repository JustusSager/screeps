var blueprint = {
    "spawn": {
      "pos": [
        {"x":10,"y":6}
      ]
    },
    "tower": {
      "pos": [
        {"x":9,"y":5},
        {"x":9,"y":6},
        {"x":9,"y":8},
        {"x":9,"y":9},
        {"x":11,"y":7},
        {"x":7,"y":7}
      ]
    },
    "storage": {
      "pos": [
        {"x":8,"y":7}
      ]
    },
    "link": {
      "pos": [
        {"x":10,"y":8}
      ]
    },
    "terminal": {
      "pos": [
        {"x":10,"y":7}
      ]
    },
    "powerSpawn": {
      "pos": [
        {"x":8,"y":8}
      ]
    },
    "nuker": {
      "pos": [
        {"x":8,"y":6}
      ]
    },
    "road": {
      "pos": [
        {"x":7,"y":6},
        {"x":8,"y":5},
        {"x":9,"y":4},
        {"x":10,"y":5},
        {"x":11,"y":6},
        {"x":12,"y":7},
        {"x":11,"y":8},
        {"x":10,"y":9},
        {"x":9,"y":10},
        {"x":8,"y":9},
        {"x":7,"y":8},
        {"x":6,"y":7},
        {"x":8,"y":3},
        {"x":7,"y":2},
        {"x":13,"y":6},
        {"x":14,"y":5},
        {"x":10,"y":11},
        {"x":11,"y":12},
        {"x":5,"y":8},
        {"x":4,"y":9},
        {"x":6,"y":3},
        {"x":5,"y":4},
        {"x":4,"y":5},
        {"x":3,"y":6},
        {"x":3,"y":7},
        {"x":3,"y":8},
        {"x":5,"y":10},
        {"x":6,"y":11},
        {"x":7,"y":12},
        {"x":8,"y":13},
        {"x":9,"y":13},
        {"x":10,"y":13},
        {"x":12,"y":11},
        {"x":13,"y":10},
        {"x":14,"y":9},
        {"x":15,"y":8},
        {"x":15,"y":7},
        {"x":15,"y":6},
        {"x":13,"y":4},
        {"x":9,"y":1},
        {"x":8,"y":1},
        {"x":10,"y":1},
        {"x":11,"y":2},
        {"x":12,"y":3}
      ]
    },
    "extension": {
      "pos": [
        {"x":6,"y":4},
        {"x":7,"y":3},
        {"x":7,"y":5},
        {"x":5,"y":5},
        {"x":6,"y":6},
        {"x":4,"y":6},
        {"x":5,"y":7},
        {"x":4,"y":7},
        {"x":4,"y":8},
        {"x":6,"y":8},
        {"x":5,"y":9},
        {"x":7,"y":9},
        {"x":6,"y":10},
        {"x":8,"y":10},
        {"x":7,"y":11},
        {"x":9,"y":11},
        {"x":8,"y":12},
        {"x":9,"y":12},
        {"x":10,"y":12},
        {"x":10,"y":10},
        {"x":11,"y":11},
        {"x":11,"y":9},
        {"x":12,"y":10},
        {"x":12,"y":8},
        {"x":13,"y":9},
        {"x":13,"y":7},
        {"x":14,"y":8},
        {"x":14,"y":7},
        {"x":14,"y":6},
        {"x":10,"y":4},
        {"x":11,"y":3},
        {"x":9,"y":3},
        {"x":10,"y":2},
        {"x":9,"y":2},
        {"x":8,"y":2},
        {"x":8,"y":4},
        {"x":12,"y":4},
        {"x":11,"y":5},
        {"x":13,"y":5},
        {"x":12,"y":6}
      ]
    },
    "observer": {
      "pos": [
        {"x":11,"y":4}
      ]
    },
    "lab": {
      "pos": [
        {"x":12,"y":5},
        {"x":11,"y":10},
        {"x":12,"y":9},
        {"x":13,"y":8},
        {"x":6,"y":9},
        {"x":7,"y":10},
        {"x":8,"y":11},
        {"x":5,"y":6},
        {"x":6,"y":5},
        {"x":7,"y":4}
      ]
    },
    "factory": {
      "pos": [
        {"x":10,"y":3}
      ]
    }
  }
  
var building_types = {
    "spawn": STRUCTURE_SPAWN,
    "tower": STRUCTURE_TOWER,
    "storage": STRUCTURE_STORAGE,
    "link": STRUCTURE_LINK,
    "terminal": STRUCTURE_TERMINAL,
    "powerSpawn": STRUCTURE_POWER_SPAWN,
    "nuker": STRUCTURE_NUKER,
    "road": STRUCTURE_ROAD,
    "extension": STRUCTURE_EXTENSION,
    "observer": STRUCTURE_OBSERVER,
    "lab": STRUCTURE_LAB,
    "factory": STRUCTURE_FACTORY
}

var blueprint_index = [
  'spawn',
  'tower',
  'storage',
  'link',
  'terminal',
  'powerSpawn',
  'nuker',
  'road',
  'extension',
  'observer',
  'lab',
  'factory'
]

var counter_inner = 0;
var counter_outer = 0;

function calculate_offset(dict, flag) {
    return {
        'x': (dict.x - 9 + flag.pos.x), 
        'y': (dict.y - 7 + flag.pos.y)
    }
}

function place_construction_sites(flag) {
      if (blueprint[blueprint_index[counter_outer]].pos[counter_inner]) {
          //console.log(JSON.stringify(blueprint[i].pos[counter]));
          
          let building = calculate_offset(blueprint[blueprint_index[counter_outer]].pos[counter_inner], flag);
          
          let check_pos = flag.room.lookAt(building.x, building.y);
          let road_blocking = false;
          if (check_pos[0].type == 'structure') {
            if (check_pos[0].structure.structureType == 'road' && blueprint_index[counter_outer] != 'road') {
              console.log('Road is blocking non-road');
              road_blocking = true;
            }
          }

          console.log('Trying building: ' + JSON.stringify(building) + ' ' + blueprint_index[counter_outer])

          let name = flag.room.createConstructionSite(building.x, building.y, building_types[blueprint_index[counter_outer]]);

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
      }

    counter_inner++;
    if (!blueprint[blueprint_index[counter_outer]].pos[counter_inner]) {
      counter_inner = 0;
      counter_outer++;
    }
    if (!blueprint[blueprint_index[counter_outer]]) {
      counter_outer = 0;
    }
}

module.exports = {
    run: function() {
        if(!Game.flags.BunkerFlag) {
          return;
        }
        let flags = [Game.flags.BunkerFlag, Game.flags.BunkerFlag2]
        for (let i in flags) {
          if(flags[i].room.memory.num_construction_sites < 10 || true) {
            place_construction_sites(flags[i]);
            flags[i].room.memory.num_construction_sites = flags[i].room.find(FIND_CONSTRUCTION_SITES).length;
          }
        }
        
    }
};
