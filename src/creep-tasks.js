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
            case 'getRenewed':
                if (target.store[RESOURCE_ENERGY] <= 100) {
                    this.transfer(target, resource);
                }
                return OK;
            case 'upgrade':
                return this.upgradeController(target);
            case 'build':
                return this.build(target);
            case 'harvest':
                return this.harvest(target);
            case 'repair':
                return this.repair(target);
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
            case 'moveToRoom':
                var exit_direction = creep.room.findExitTo(creep.memory.task.target);
                return creep.moveTo(creep.pos.findClosestByPath(exit_direction));
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
    if (!this.memory.task || !this.memory.task.target) {
        return false;
    }
    let target;
    switch (this.memory.task.name) {
        case 'moveToRoom':
            return this.room.name != this.memory.task.target;
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
        if (!creep.memory.task || creep.memory.task == {}) {
            creep.memory.task = {};
            let target;
            if (creep.store[RESOURCE_ENERGY] > 0) {
                if (creep.memory.room_home && creep.memory.room_home != creep.room.name) {
                    creep.memory.task['name'] = "moveToRoom";
                    creep.memory.task['target'] = creep.memory.room_home;
                    return;
                }
                /*if (creep.ticksToLive < 500 && creep.hitsMax > 1000) {
                    creep.memory.task['name'] = "getRenewed";
                    creep.memory.task['target'] = creep.pos.findClosestByPath(FIND_MY_SPAWNS).id;
                    return;
                }*/
                target = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: (s) => s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL});
                if (creep.memory.role == 'repairer' && target) {
                    creep.memory.task['name'] = "repair";
                    creep.memory.task['target'] = target.id;
                    creep.memory.task['range'] = 3;
                    return;
                }
                if (creep.memory.role == 'upgrader') {
                    creep.memory.task['name'] = "upgrade";
                    creep.memory.task['target'] = creep.room.controller.id;
                    creep.memory.task['range'] = 3;
                    return;
                }
                if (creep.room.memory.construction_sites && creep.room.memory.construction_sites.length > 0) {
                    creep.memory.task['name'] = "build";
                    creep.memory.task['target'] = creep.room.memory.construction_sites[0].id;
                    creep.memory.task['range'] = 3;
                    return;
                }
                else {
                    creep.memory.task['name'] = "upgrade";
                    creep.memory.task['target'] = creep.room.controller.id;
                    creep.memory.task['range'] = 3;
                    return;
                }
            } 
            else {
                if (creep.memory.room_target && creep.memory.room_target != creep.room.name) {
                    creep.memory.task['name'] = "moveToRoom";
                    creep.memory.task['target'] = creep.memory.room_target;
                    return;
                }
                if (creep.find_dropped_rescources()) {
                    creep.memory.task['name'] = "pickup";
                    creep.memory.task['target'] = creep.find_dropped_rescources().id;
                    return;
                }
                if (creep.find_energy(false)) {
                    creep.memory.task['name'] = "withdraw";
                    creep.memory.task['target'] = creep.find_energy(false).id;
                    creep.memory.task['resource'] = RESOURCE_ENERGY;
                    return;
                }
                target = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
                if (target) {
                    creep.memory.task['name'] = "harvest";
                    creep.memory.task['target'] = target.id;
                    return;
                }
            }
            
        }
        code = creep.work();
        if (code != OK) {
            creep.say(code);
            if (code == ERR_NOT_ENOUGH_ENERGY) {
                creep.memory.task = undefined;
            }
        }
    }
}
