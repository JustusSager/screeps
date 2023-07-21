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
    if (Game.getObjectById(this.memory.task.target)) {
        return true;
    }
    return false;
}

module.exports = {
    run: function (creep) {
        if (!creep.memory.task || creep.memory.task == {}) {
            creep.memory.task = {};
            if (creep.store[RESOURCE_ENERGY] > 0) {
                let repair_site = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: (s) => s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL});
                if (creep.memory.role == 'repairer' && repair_site) {
                    creep.memory.task['name'] = "repair";
                    creep.memory.task['target'] = repair_site.id;
                    creep.memory.task['range'] = 3;
                }
                else if (creep.memory.role == 'upgrader') {
                    creep.memory.task['name'] = "upgrade";
                    creep.memory.task['target'] = creep.room.controller.id;
                    creep.memory.task['range'] = 3;
                }
                else if (creep.room.memory.construction_sites && creep.room.memory.construction_sites.length > 0) {
                    creep.memory.task['name'] = "build";
                    creep.memory.task['target'] = creep.room.memory.construction_sites[0].id;
                    creep.memory.task['range'] = 3;
                }
                else {
                    creep.memory.task['name'] = "upgrade";
                    creep.memory.task['target'] = creep.room.controller.id;
                    creep.memory.task['range'] = 3;
                }
            } 
            else {
                if (creep.find_dropped_rescources()) {
                    creep.memory.task['name'] = "pickup";
                    creep.memory.task['target'] = creep.find_dropped_rescources().id;
                }
                else if (creep.find_energy(false)) {
                    creep.memory.task['name'] = "withdraw";
                    creep.memory.task['target'] = creep.find_energy(false).id;
                    creep.memory.task['resource'] = RESOURCE_ENERGY;
                }
                else {
                    creep.memory.task['name'] = "harvest";
                    creep.memory.task['target'] = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE).id;
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
