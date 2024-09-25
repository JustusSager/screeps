require("prototype.creep")();

function deref(objectID) {
    return Game.getObjectById(objectID) || Game.flags[objectID] || Game.creeps[objectID] || Game.spawns[objectID] || null;
}

module.exports = function () {
    Creep.prototype.run = function () {
        if (this.memory.task) {
            let taskName = this.memory.task.name;
            let target = deref(this.memory.task.targetID);
            let targetRange = this.memory.task.targetRange ? this.memory.task.targetRange : 1;
            let options = this.memory.task.options ? this.memory.task.options : {};
            let result = undefined, resource = undefined;

            if (target && !this.pos.inRangeTo(target.pos, targetRange)) {
                this.moveTo(target.pos);
            } else {
                switch (taskName) {
                    case 'harvest':
                        result = this.harvest(target);
                        if (result !== OK || this.store.getFreeCapacity() === 0) {
                            this.resetTask(result);
                        }
                        break;
                    case 'mine':
                        if (!this.memory.task.containerID) {
                            this.memory.task.containerID = target.pos.findInRange(FIND_STRUCTURES, 1, {
                                filter: s => s.structureType === STRUCTURE_CONTAINER
                            })[0].id;
                        }
                        let container = deref(this.memory.task.containerID)
                        if (this.pos.isEqualTo(container)) {
                            result = this.harvest(target);
                            if (result !== OK) {
                                this.resetTask(result);
                            }
                        } else {
                            this.moveTo(container);
                        }
                        break;
                    case 'transfer':
                        resource = options.resource ? options.resource : RESOURCE_ENERGY;
                        result = this.transfer(target, resource);
                        if (result !== OK || this.store[resource] === 0) {
                            this.resetTask(result);
                        }
                        break;
                    case 'withdraw':
                        resource = options.resource ? options.resource : RESOURCE_ENERGY;
                        result = this.withdraw(target, resource);
                        if (result !== OK || this.store.getFreeCapacity() === 0) {
                            this.resetTask(result);
                        }
                        break;
                    case 'pickup':
                        result = this.pickup(target);
                        if (result !== OK || this.store.getFreeCapacity() === 0) {
                            this.resetTask(result);
                        }
                        break;
                    case 'upgrade':
                        result = this.upgradeController(target);
                        if (result !== OK || this.store[RESOURCE_ENERGY] === 0) {
                            this.resetTask(result);
                        }
                        break;
                    case 'build':
                        result = this.build(target);
                        if (result !== OK || this.store[RESOURCE_ENERGY] === 0) {
                            this.resetTask(result);
                        }
                        break;
                    case 'repair':
                        result = this.repair(target);
                        if (result !== OK || this.store[RESOURCE_ENERGY] === 0) {
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
}