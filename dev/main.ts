import spawningManager from './manager.spawning'
import basebuildingManager from './manager.basebuilding'
import explorationManager from './manager.exploration'
import economyManager from './manager.economy';
import structureManager from './manager.structures';
import { TaskManager } from './manager.tasks'
import { SpawnRequest } from './manager.spawning';
import roleMiner from './role.miner';
import roleHauler from './role.hauler';
import roleManager from './role.manager';
import roleExplorer from './role.explorer';
import roleWorker from './role.worker';
import _ from 'lodash';

require('./prototype.RoomPosition')()
require('./prototype.RoomVisual')()
require('./prototype.creep')()

function clear_memory(): void {
    if (!Memory.worldmap) Memory.worldmap = {}

    for (const name in Memory.creeps) {
        if (!Game.creeps[name]) delete Memory.creeps[name];
    }
    for (const name in Memory.rooms) {
        if (!Game.rooms[name]) delete Memory.rooms[name];
    }
    for (const name in Memory.spawns) {
        if (!Game.spawns[name]) delete Memory.spawns[name];
    }
}

function init_memory(): void {
    if (!Memory.debug) Memory.debug = {
        creepSaysErrorCode: false,
        creepSaysTask: false
    }
}

module.exports.loop = function(): void {
    // clear memory
    clear_memory();
    init_memory()

    const taskmanager = new TaskManager();

    for (const roomname in Game.rooms) {
        taskmanager.find_open_tasks(Game.rooms[roomname])
        taskmanager.visulize()
    }

    const idle_creeps = _.filter(Game.creeps, c => c.memory.task == undefined)

    for (const creep of idle_creeps) {
        taskmanager.assign_task(creep)
    }
    
    
    for (const roomName in Game.rooms) {
        const room = Game.rooms[roomName]
        const roomvisual = room.visual

        if (!Memory.worldmap[roomName] || Game.time % 10 == 0) {
            explorationManager.add_room_to_worldmap(room);
        }
        

        if (Memory.worldmap[roomName].owned_by_me === true) {

            let spawn_queu: SpawnRequest[] = spawningManager.create_spawn_queu(room)

            const num_miners = _.filter(Game.creeps, (c) => c.memory.role === 'miner').length;
            const source_targets = economyManager.get_sources_to_mine(roomName, 1)
            spawn_queu.push(
                ...spawningManager.create_spawn_request_miner(room, source_targets, num_miners)
            )

            const exploration_targets = explorationManager.find_exploration_targets()
            spawn_queu.push(...spawningManager.create_spawn_requests_exploration(room, exploration_targets))

            spawn_queu = spawningManager.order_by_priority(spawn_queu);
            console.log(JSON.stringify(spawn_queu))

            const spawns = _.filter(Game.spawns, (spawn: StructureSpawn) => spawn.room.name === roomName)
            for (const spawn of spawns) {
                if (spawn_queu.length === 0) break;
                spawningManager.spawn_request(spawn_queu[0], spawn)
            }

            spawningManager.visualize(roomvisual, spawn_queu, 1, 1)

            if (Game.time % 10 == 0) { 
                const western_spawn = _.filter(Game.spawns, s => s.room === room && s.name.endsWith('w'))[0]
                if (western_spawn) {
                    room.memory.spawner_base_centroid_pos = {
                        x: western_spawn.pos.x + 2, y: western_spawn.pos.y + 1
                    }
                    roomvisual.circle(room.memory.spawner_base_centroid_pos.x, room.memory.spawner_base_centroid_pos.y)
                }
            }

            if (Game.time % 10 == 1 && room.controller && room.controller.level > 1) {
                basebuildingManager.build_spawner_blueprint(
                    _.filter(Game.spawns, s => s.room === room && s.name.endsWith('w'))[0],
                    room.controller.level
                )
                basebuildingManager.build_container_near_controller(room);

                if (room.controller.level > 2) {
                    basebuildingManager.build_road_network(room, true, true)
                }
            }
        }
    }

    const pickupTargets = economyManager.find_pickup_targets_near_source(Game.rooms)
    console.log(JSON.stringify(pickupTargets, null, 2))
    for (const name in Game.creeps) {
        const creep = Game.creeps[name]
        if (creep.memory.role === 'miner') {
            roleMiner.run(creep);
        }
        else if (creep.memory.role === 'hauler') {
            roleHauler.run(creep, pickupTargets);
        }
        else if (creep.memory.role === 'manager') {
            roleManager.run(creep);
        }
        else if (creep.memory.role === 'explorer') {
            roleExplorer.run(creep);
        }
        else if (creep.memory.role === 'upgrader') {
            creep.memory.role = 'worker'
            creep.memory.task = undefined
        }
        else if (creep.memory.role === 'builder') {
            creep.memory.role = 'worker'
            creep.memory.task = undefined
        }
        else if (creep.memory.role === 'worker') {
            roleWorker.run(creep);
        }
    }

    structureManager.run_towers()

    structureManager.spawn_renew_creeps_in_range()

    for (const roomname in Game.rooms) {
        const room = Game.rooms[roomname]
        room.visual.table(["Tasks"], [2.7, 2, 2], taskmanager.create_stats_assigned_tasks(), 35, 1)
        
    }
    taskmanager.visulize()
}