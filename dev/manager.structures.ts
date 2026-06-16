// eslint-disable-next-line import/no-unresolved
import _ from "lodash";

let managerStructures: {

    run_towers(): void

    spawn_renew_creeps_in_range(): void
}

export default managerStructures = {

    run_towers() {
        const towers = _.filter(Game.structures, s => s.structureType === STRUCTURE_TOWER)

        for (const i in towers) {
            const tower = towers[i] as StructureTower
            const closestHostileCreep = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
            if (closestHostileCreep) tower.attack(closestHostileCreep)

            const closestHostilePowerCreep = tower.pos.findClosestByRange(FIND_HOSTILE_POWER_CREEPS)
            if (closestHostilePowerCreep) tower.attack(closestHostilePowerCreep)

            const closestDamagedCreep = tower.pos.findClosestByRange(FIND_MY_CREEPS, {filter: c => c.hits < c.hitsMax })
            if (closestDamagedCreep) tower.heal(closestDamagedCreep)

            if (tower.store[RESOURCE_ENERGY] > 700) {
                const closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {filter: s => s.hits < s.hitsMax})
                if (closestDamagedStructure) tower.repair(closestDamagedStructure)
            }
        }
    },

    spawn_renew_creeps_in_range() {
        for (const i in Game.spawns) {
            const spawn = Game.spawns[i]

            const creeps = spawn.pos.findInRange(FIND_MY_CREEPS, 1, {filter: c => c.ticksToLive && c.ticksToLive < 1400 && (c.body.length >= 9 || c.memory.role === 'manager')})

            if (creeps.length > 0) {
                spawn.renewCreep(creeps[0])
            }
        }
    }

}