require('prototype.room')();
require('prototype.spawn')();
require('prototype.flag')();
require('prototype.creep')();

var structTower = require('struct.tower');
var structLink = require('struct.link');

var trading = require('trading');
const { CREEP_ROLE_WORKER } = require('constants');

const { TaskManager } = require('taskmanager');
const { TASK_HARVEST, TASK_BUILD, TASK_REPAIR } = require('./constants');


module.exports.loop = function () {
    // Room memory
    for (let i in Game.rooms) {
        let room = Game.rooms[i];

        try {
            const tm = new TaskManager(room);
            tm.find_open_tasks();

        } catch (error) {
            console.log(error)
        }
        

        room.handle_memory();

        let spawn_queu = room.memory.spawn_queu;
        let creeps_of_room = _.filter(Game.creeps, c => c.memory.room_home == room.name);
        let energy_source_ids = room.memory.energy_source_ids

        spawn_queu = room.fill_spawn_queu(spawn_queu, creeps_of_room, energy_source_ids);


        room.update_tasks();
        let idle_creeps = _.filter(Game.creeps, (c) => (c.memory.room_home == room.name && c.memory.role == CREEP_ROLE_WORKER && !c.memory.task));
        room.assign_tasks(idle_creeps);
        Game.rooms[i].visualize();

        spawn_queu = room.spawn_from_queu(spawn_queu);

        // base building and planning
        room.base_planing();
        room.base_building();
    }
    
    trading.run();

    for (let i in Game.flags) {
        Game.flags[i].handle_memory();
    }

    // run spawners
    for (let i in Game.spawns) {
        try {
            Game.spawns[i].renew_creeps_in_range();
        } catch (error) {
            console.log(error);
        }
    }

    // run towers and links
    structTower.run();
    structLink.run();


    // run creeps
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        creep.run(speak = true);
    }

    // clear memory
    for(var i in Memory.creeps) {
        if(!Game.creeps[i]) {
            delete Memory.creeps[i];
        }
    }
    for(var i in Memory.spawns) {
        if(!Game.spawns[i]) {
            delete Memory.spawns[i];
        }
    }
    for(var i in Memory.rooms) {
        if(!Game.rooms[i]) {
            delete Memory.rooms[i];
        }
    }
}
