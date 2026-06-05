const config = require("config");

const { gen_task_from_dict } = require('./manager.tasks')

const { TASK_UPGRADE, TASK_BUILD, TASK_HARVEST, TASK_REPAIR, TASK_WITHDRAW, TASK_PICKUP, TASK_TRANSFER, TASK_GET_RENEWED } = require("./constants");

Creep.prototype.work = function() {
    let task;
    try {
        task = gen_task_from_dict(this.memory.task);
    } catch {
        console.log("Something went wrong with creeps " + this.name + " task " + JSON.stringify(this.memory.task))
        this.memory.task = undefined;
        return -100;
    }

    if (!task.is_valid()) {
        this.memory.task = undefined;
        return -101;
    }
    if (!task.is_valid_for_creep(this)) {
        this.memory.task = undefined;
        return -102;
    }

    if (task.target.room != this.room) {
        var exit_direction = this.room.findExitTo(task.target);
        return this.moveTo(this.pos.findClosestByPath(exit_direction));
    }
    // Clear the Edge of the Board
    if (this.pos.x == 0) return this.move(RIGHT);
    if (this.pos.x == 49) return this.move(LEFT);
    if (this.pos.y == 0) return this.move(BOTTOM);
    if (this.pos.y == 49) return this.move(TOP);
    
    if (this.pos.inRangeTo(task.target, task.range)) {
        switch (task.type) {
            case TASK_GET_RENEWED:
                this.say("🔧");
                if (task.target.store[RESOURCE_ENERGY] <= 100) {
                    this.transfer(task.target, RESOURCE_ENERGY);
                }
                return OK;
            case TASK_UPGRADE:
                this.say("🆙");
                return this.upgradeController(task.target);
            case TASK_BUILD:
                this.say("🔨");
                return this.build(task.target);
            case TASK_HARVEST:
                this.say("⛏️")
                return this.harvest(task.target);
            case TASK_REPAIR:
                this.say("🔧");
                return this.repair(task.target);
            case TASK_WITHDRAW:
                this.say("🧺");
                // amount = this.memory.task.amount ? this.memory.task.amount : this.store.getFreeCapacity;
                return this.withdraw(task.target, task.resource);
            case TASK_PICKUP:
                this.say("🧺");
                return this.pickup(task.target);
            case TASK_TRANSFER:
                this.say("🧺");
                // amount = this.memory.task.amount ? this.memory.task.amount : this.store[resource];
                return this.transfer(task.target, task.resource);
            default:
                return -101;
        }
    } else {
        return this.moveTo(task.target);
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
