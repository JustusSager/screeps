const config = require("config");

Creep.prototype.work = function() {
    if (!this.isValidTask()) {
        this.memory.task = undefined;
        return -101;
    }
    if (!this.isValidTarget()) {
        this.memory.task = undefined;
        return -102;
    }

    var target = Game.getObjectById(this.memory.task.target);
    var range = this.memory.task.range ? this.memory.task.range : 1;
    var resource;
    var amount;

    if (this.memory.task.name == 'moveToRoom') {
        var exit_direction = this.room.findExitTo(this.memory.task.target);
        return this.moveTo(this.pos.findClosestByPath(exit_direction));
    }
    // Clear the Edge of the Board
    if (this.pos.x == 0) return this.move(RIGHT);
    if (this.pos.x == 49) return this.move(LEFT);
    if (this.pos.y == 0) return this.move(BOTTOM);
    if (this.pos.y == 49) return this.move(TOP);
    
    if (this.pos.inRangeTo(target, range)) {
        switch (this.memory.task.name) {
            case 'getRenewed':
                this.say("🔧");
                if (target.store[RESOURCE_ENERGY] <= 100) {
                    this.transfer(target, resource);
                }
                return OK;
            case 'upgrade':
                this.say("🆙");
                return this.upgradeController(target);
            case 'build':
                this.say("🔨");
                return this.build(target);
            case 'harvest':
                this.say("⛏️")
                return this.harvest(target);
            case 'repair':
                this.say("🔧");
                return this.repair(target);
            case 'withdraw':
                this.say("🧺");
                resource = this.memory.task.resource ? this.memory.task.resource : RESOURCE_ENERGY;
                // amount = this.memory.task.amount ? this.memory.task.amount : this.store.getFreeCapacity;
                return this.withdraw(target, resource);
            case 'pickup':
                this.say("🧺");
                return this.pickup(target);
            case 'transfer':
                this.say("🧺");
                resource = this.memory.task.resource ? this.memory.task.resource : Object.keys(creep.store)[0];
                // amount = this.memory.task.amount ? this.memory.task.amount : this.store[resource];
                return this.transfer(target, resource);
            default:
                return -101;
        }
    } else {
        target = Game.getObjectById(this.memory.task.target);
        return this.moveTo(target);
    }
}

Creep.prototype.isValidTask = function() {
    if (!this.memory.task || !this.memory.task.name) {
        return false;
    }

    switch (this.memory.task.name) {
        case 'moveToRoom':
            return true;
        case 'getRenewed':
            return this.ticksToLive < 1400 && this.hitsMax > 1000;
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
        case 'repair':
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
    if (!this.memory.task || !this.memory.task.name || !this.memory.task.target) {
        return false;
    }
    let target;
    switch (this.memory.task.name) {
        case 'moveToRoom':
            return /*Game.rooms[this.memory.task.target] && */this.room.name != this.memory.task.target;
        case 'repair':
            target = Game.getObjectById(this.memory.task.target);
            return target && target.hits < target.hitsMax && target.structureType != STRUCTURE_WALL;
        case 'withdraw':
            target = Game.getObjectById(this.memory.task.target);
            return target && target.store && target.store[this.memory.task.resource] > 0;
        default:
            if (Game.getObjectById(this.memory.task.target)) {
                return true;
            }
            return false;
    }
}

module.exports = {
    run: function (creep) {
        code = creep.work();
        if (code != OK) {
            switch(code) {
                case ERR_TIRED:
                    creep.say('💤');
                    break;
                case ERR_NOT_ENOUGH_ENERGY:
                    creep.say('🪫');
                    creep.memory.task = undefined
                    break;
                case ERR_NO_PATH:
                    creep.say('⏹️');
                    creep.memory.task = undefined
                    break;
                case -101:
                    creep.say('InvTask');
                    break;
                case -102:
                    creep.say('InvTarget');
                    break;
                default:
                    creep.say(code);
                    break;
            }
        }
    }
}
