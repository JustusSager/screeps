const config = require('config');

function deref(objectID) {
    return Game.getObjectById(objectID) || Game.flags[objectID] || Game.creeps[objectID] || Game.spawns[objectID] || null;
}

function sum(...values) {
    let result = 0;
    for (let value of values) {
        result += value
    }
    return result
}

class HarvestRequest {
    constructor(targetID, priority = 1) {
        this.target = deref(targetID);
        this.priority = priority;
        this.pos = this.target.pos;
        this.workLeft = this.target.energy - sum(..._.filter(Game.creeps, c =>
            c.memory.task &&
            c.memory.task.name === 'harvest' &&
            c.memory.task.target === this.target.id
        ).map(c => c.store.getFreeCapacity()));
    }

    prerequisites_fulfilled(creep) {
        return this.prerequisites_fulfillable(creep) && creep.store.getFreeCapacity() > 0;
    }

    prerequisites_fulfillable(creep) {
        return creep.store.getCapacity() > 0 && creep.body.map(a => a.type).includes('work');
    }

    invalid() {
        return this.target === undefined || this.target.energy === 0;
    }

    switchTask(creep) {
        creep.say("⛏️");
        creep.memory.task = {
            name: 'harvest',
            targetID: this.target.id,
            targetRange: 1
        };
        return 0;
    }

    toObj() {
        return {
            type: config.REQUEST_HARVEST,
            target: this.target.id,
            priority: this.priority,
            pos: this.pos,
            workLeft: this.workLeft
        }
    }
}

module.exports = HarvestRequest;
