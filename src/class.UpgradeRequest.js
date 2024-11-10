const config = require('config');

function deref(objectID) {
    return Game.getObjectById(objectID) || Game.flags[objectID] || Game.creeps[objectID] || Game.spawns[objectID] || null;
}

class UpgradeRequest {
    constructor(targetID, priority = 1) {
        this.target = deref(targetID);
        this.priority = priority;
        this.pos = this.target.pos;
        this.workLeft = 10;
    }

    prerequisites_fulfilled(creep) {
        return this.prerequisites_fulfillable(creep) && creep.store[RESOURCE_ENERGY] > 0;
    }

    prerequisites_fulfillable(creep) {
        return creep.store.getCapacity() > 0 && creep.body.map(a => a.type).includes('work');
    }

    invalid() {
        return false
    }

    switchTask(creep) {
        creep.say("🆙");
        creep.memory.task = {
            name: 'upgrade',
            targetID: this.target.id,
            targetRange: 2
        };
        return 0;
    }

    toObj() {
        return {
            type: config.REQUEST_UPGRADE,
            target: this.target.id,
            priority: this.priority,
            pos: this.pos,
            workLeft: this.workLeft
        }
    }
}

module.exports = UpgradeRequest;
