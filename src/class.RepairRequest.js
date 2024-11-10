const config = require('config');

function deref(objectID) {
    return Game.getObjectById(objectID) || Game.flags[objectID] || Game.creeps[objectID] || Game.spawns[objectID] || null;
}

class RepairRequest {
    constructor(targetID, priority = 1) {
        this.target = deref(targetID);
        this.priority = priority;
        this.structureType = this.target.structureType;
        this.pos = this.target.pos;
        this.workLeft = this.target.hitsMax - this.target.hits;
    }

    prerequisites_fulfilled(creep) {
        return this.prerequisites_fulfillable(creep) && creep.store[RESOURCE_ENERGY] > 0;
    }

    prerequisites_fulfillable(creep) {
        return creep.store.getCapacity() > 0 && creep.body.map(a => a.type).includes('work');
    }

    invalid() {
        return this.target.hits === this.target.hitsMax;
    }

    switchTask(creep) {
        creep.say("🛠️");
        creep.memory.task = {
            name: 'repair',
            targetID: this.target.id,
            targetRange: 2
        };
        return 0;
    }

    toObj() {
        return {
            type: config.REQUEST_REPAIR,
            target: this.target.id,
            priority: this.priority,
            structureType: this.structureType,
            pos: this.pos,
            workLeft: this.workLeft
        }
    }
}

module.exports = RepairRequest;
