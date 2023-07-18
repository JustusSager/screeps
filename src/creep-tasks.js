Creep.prototype.work = function() {
    if (!this.isValidTask()) {
        this.memory.task = undefined;
        return -101;
    }
    if (!this.isValidTarget()) {
        this.memory.task = undefined;
        return -102;
    }

    var target = Game.getObjectById(this.memory.task.target)
    var range = this.memory.task.range ? this.memory.task.range : 1
    var resource;
    var amount;

    if (this.pos.inRangeTo(target, range)) {
        switch (this.memory.task.name) {
            case 'upgrade':
                return this.upgradeController(target);
            case 'build':
                return this.build(target);
            case 'harvest':
                return this.harvest(target);
            case 'withdraw':
                resource = this.memory.task.resource ? this.memory.task.resource : RESOURCE_ENERGY;
                // amount = this.memory.task.amount ? this.memory.task.amount : this.store.getFreeCapacity;
                return this.withdraw(target, resource);
            case 'pickup':
                return this.pickup(target);
            case 'transfer':
                resource = this.memory.task.resource ? this.memory.task.resource : RESOURCE_ENERGY;
                // amount = this.memory.task.amount ? this.memory.task.amount : this.store[resource];
                return this.transfer(target, resource);
            default:
                return -101;
        }
    } else {
        return this.walk();
    }
}

Creep.prototype.walk = function() {
    target = Game.getObjectById(this.memory.task.target);
    return this.moveTo(target);
}

Creep.prototype.isValidTask = function() {
    if (!this.memory.task || !this.memory.task.name) {
        return false;
    }

    switch (this.memory.task.name) {
        case 'upgrade':
            if (this.store[RESOURCE_ENERGY] > 0 && this.getActiveBodyparts(WORK) > 0) {
                return true;
            }
            return false;
        case 'build':
            if (this.store[RESOURCE_ENERGY] > 0 && this.getActiveBodyparts(WORK) > 0) {
                return true;
            }
            return false;
        case 'harvest':
            if (this.store.getFreeCapacity() > 0 && this.getActiveBodyparts(WORK) > 0) {
                return true;
            }
            return false;
        case 'withdraw':
            if (this.store.getFreeCapacity() > 0) {
                return true;
            }
            return false;
        case 'pickup':
            if (this.store.getFreeCapacity() > 0) {
                return true;
            }
            return false;
        case 'transfer':
            if (this.store.getUsedCapacity() > 0) {
                return true;
            }
            return false;
        default:
            return false;
    }
}

Creep.prototype.isValidTarget = function() {
    if (!this.memory.task || !this.memory.task.target) {
        return false;
    }
    if (Game.getObjectById(this.memory.task.target)) {
        return true;
    }
    return false;
}
