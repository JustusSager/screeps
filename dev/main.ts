import spawningManager from './manager.spawning'
import basebuildingManager from './manager.basebuilding'
import { SpawnRequest } from './manager.spawning';
import roleMiner from './role.miner';
import roleHauler from './role.hauler';
import roleUpgrader from './role.upgrader';
import roleManager from './role.manager';
import _ from 'lodash';
import roleBuilder from './role.builder';


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

module.exports.loop = function(): void {
    // clear memory
    clear_memory();
    
    for (const roomname in Game.rooms) {
        const room = Game.rooms[roomname];
        const roomvisual = new RoomVisual(roomname);

        Memory.worldmap[roomname] = {
            sources: room.find(FIND_SOURCES).map((s) => {return { 
                id: s.id,
                guarded: (s.pos.findInRange(FIND_HOSTILE_STRUCTURES, 5).length > 0 || s.pos.findInRange(FIND_HOSTILE_CREEPS, 5).length > 0) 
            }}),
            minerals: room.find(FIND_MINERALS).map((m) => {return {
                id: m.id,
                type: m.mineralType,
                guarded: (m.pos.findInRange(FIND_HOSTILE_STRUCTURES, 5).length > 0 || m.pos.findInRange(FIND_HOSTILE_CREEPS, 5).length > 0) 
            }}),
            exits: Game.map.describeExits(roomname)
        }

        let spawn_queu: SpawnRequest[] = spawningManager.create_spawn_queu(room)
        spawn_queu = spawningManager.order_by_priority(spawn_queu);
        console.log(JSON.stringify(spawn_queu))

        const spawns = _.filter(Game.spawns, (spawn: StructureSpawn) => spawn.room.name === roomname)
        for (const spawn of spawns) {
            if (spawn_queu.length === 0) break;
            spawningManager.spawn_request(spawn_queu[0], spawn)
        }

        spawningManager.visualize(roomvisual, spawn_queu, 1, 1)

        if (room.controller && room.controller.level > 1) {
            basebuildingManager.build_spawner_blueprint(
                _.filter(Game.spawns, s => s.room === room && s.name.endsWith('w'))[0],
                room.controller.level
            )
        }

        const western_spawn = _.filter(Game.spawns, s => s.room === room && s.name.endsWith('w'))[0]
        room.memory.spawner_base_centroid_pos = {
            x: western_spawn.pos.x + 2, y: western_spawn.pos.y + 1
        }
        roomvisual.circle(room.memory.spawner_base_centroid_pos.x, room.memory.spawner_base_centroid_pos.y)
    }


    for (const name in Game.creeps) {
        const creep = Game.creeps[name]
        if (creep.memory.role === 'miner') {
            roleMiner.run(creep);
        }
        else if (creep.memory.role === 'hauler') {
            roleHauler.run(creep);
        }
        else if (creep.memory.role === 'upgrader') {
            roleUpgrader.run(creep);
        }
        else if (creep.memory.role === 'manager') {
            roleManager.run(creep);
        }
        else if (creep.memory.role === 'builder') {
            roleBuilder.run(creep);
        }
    }
}