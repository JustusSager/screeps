import spawningManager from './manager.spawning'
import { SpawnRequest } from './manager.spawning';
import roleMiner from './role.miner';
import roleHauler from './role.hauler';
import _ from 'lodash';


function clear_memory(): void {
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
    console.log("Test")

    // clear memory
    //clear_memory();
    
    // count the number of roler
    const miners = _.filter(Game.creeps, (c: Creep) => c.memory.role === 'miner')
    const haulers = _.filter(Game.creeps, (c: Creep) => c.memory.role === 'hauler')

    console.log(`Time ${Game.time}`);

    
    for (const roomname in Game.rooms) {
        const room = Game.rooms[roomname];
        console.log(`Spawnlogik für raum ${roomname}`);

        let spawn_queu: SpawnRequest[] = spawningManager.create_spawn_queu(room)

        const spawns = _.filter(Game.spawns, (spawn: StructureSpawn) => spawn.room.name === roomname)
        for (const spawn of spawns) {
            spawningManager.spawn_request(spawn_queu[0], spawn)
        }
    }


    for (const name in Game.creeps) {
        const creep = Game.creeps[name]
        if (creep.memory.role === 'miner') {
            roleMiner.run(creep);
        }
        else if (creep.memory.role === 'hauler') {
            roleHauler.run(creep);
        }
    }
}