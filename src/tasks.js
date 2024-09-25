require("prototypes");

function deref(objectID) {
    return Game.getObjectById(objectID) || Game.flags[objectID] || Game.creeps[objectID] || Game.spawns[objectID] || null;
}

function isEnergyStructure(structure) {
    return structure.energy !== undefined && structure.energyCapacity !== undefined;
}

function isStoreStructure(structure) {
    return structure.store !== undefined;
}

Creep.prototype.run = function () {
    if (this.memory.task) {
        let taskName = this.memory.task.name;
        let target = deref(this.memory.task.targetID);
        let targetRange = this.memory.task.targetRange ? this.memory.task.targetRange : 1;
        let options = this.memory.task.options ? this.memory.task.options : {};
        let result = undefined;

        if (target && !this.pos.inRangeTo(target.pos, targetRange)) {
            this.moveTo(target.pos);
        } else {
            switch (this.memory.task.name) {
                case 'harvest':
                    result = this.harvest(target);
                    if (result !== OK) {
                        this.resetTask(result);
                    }
                    break;
                case 'transfer':
                    let resource = options.resource ? options.resource : RESOURCE_ENERGY;
                    result = this.transfer(target, resource);
                    if (result !== OK) {
                        this.resetTask(result);
                    }
                    break;
                case 'upgrade':
                    result = this.upgradeController(target);
                    if (result !== OK) {
                        this.resetTask(result);
                    }
                    break;
                default:
                    break;
            }
        }
    }
}

Creep.prototype.resetTask = function (errorCode = 0) {
    if (errorCode !== 0) {
        this.say(errorCode);
    }
    this.memory.task = {name: 'idle'};
}
