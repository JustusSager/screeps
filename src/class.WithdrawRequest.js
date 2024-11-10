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

class WithdrawRequest {
    constructor(targetID, resource, priority = 1) {
        this.target = deref(targetID);
        this.priority = priority;
        this.resource = resource;
        this.pos = this.target.pos;
        this.workLeft = this.target.store.getUsedCapacity(resource) - sum(..._.filter(Game.creeps, c =>
            c.memory.task.name === 'withdraw' &&
            c.memory.task.target === this.target.id
        ).map(c => c.store.getFreeCapacity()));
    }

    prerequisites_fulfilled(creep) {
        return this.prerequisites_fulfillable(creep) && creep.store.getFreeCapacity() > 0;
    }

    prerequisites_fulfillable(creep) {
        return creep.store.getCapacity() > 0;
    }

    invalid() {
        return this.target === undefined || this.workLeft <= 0;
    }

    switchTask(creep) {
        creep.say("⛽");
        creep.memory.task = {
            name: 'withdraw',
            targetID: this.target.id,
            targetRange: 1,
            options: {
                resource: this.resource
            }
        };
        return 0;
    }

    toObj() {
        return {
            type: config.REQUEST_WITHDRAW,
            target: this.target.id,
            priority: this.priority,
            resource: this.resource,
            pos: this.pos,
            workLeft: this.workLeft
        }
    }
}

module.exports = WithdrawRequest;
