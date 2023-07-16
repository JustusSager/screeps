'use strict';

function deref(ref) {
    return Game.getObjectById(ref) || Game.flags[ref] || Game.creeps[ref] || Game.spawns[ref] || null;
}
function derefRoomPosition(protoPos) {
    return new RoomPosition(protoPos.x, protoPos.y, protoPos.roomName);
}

class Task {
    constructor(taskName, targetId, options={}) {
        this.name = taskName;
        if(Game.getObjectById(targetId)) {
            this.targetId = targetId;
        } else {
            this.targetId = '';
        }
        this.options = options;
        this.settings = {
            targetRange: 1
        }
        this.data = {
            quiet: true
        }
    }

    get proto() {
        return {
            name: this.name,
            creepName: this.creepName,
            targetId: this.targetId,
            options: this.options,
            settings: this.settings,
            data: this.data
        }
    }
    set proto(protoTask) {
        this.creepName = protoTask.creepName;
        this.targetId = protoTask.targetId;
        this.options = protoTask.options;
        this.settings = protoTask.settings;
        this.data = protoTask.data;
    }

    get creep() {
        return Game.creeps[this.creepName];
    }
    set creep(creep) {
        this.creepName = creep.name;
    }

    get target() {
        return deref(this.targetId);
    }
    get targetPos() {
        return derefRoomPos(deref(this.targetId) != null? deref(this.targetId).pos : null);
    }

    move(range = this.settings.targetRange) {
        if (this.options.moveOptions && !this.options.moveOptions.range) {
            this.options.moveOptions.range = range;
        }
        return this.creep.moveTo(this.targetPos, this.options.moveOptions);
    }

    run() {
        if (this.creep.pos.inRangeTo(this.targetPos, this.settings.targetRange) && !this.creep.pos.isEdge) {
            return this.work();
        }
        else {
            this.move();
        }
    }
}

class TaskTransfer extends Task {
    constructor(targetId, resourceType = RESOURCE_ENERGY, amount = undefined, options = {}) {
        super(TaskTransfer.taskName, targetId, options);
        this.data.resourceType = resourceType;
        this.data.amount = amount;
    }

    isValidTask() {
        let amount = this.data.amount || 1;
        let resourcesInCarry = this.creep.store[this.data.resourceType] || 0;
        return resourcesInCarry >= amount;
    }

    isValidTarget() {
        return this.target.store.getFreeCapacity > amount
    }

    work() {
        return this.creep.transfer(this.target, this.data.resourceType, this.data.amount);
    }
}
TaskTransfer.taskName = 'transfer'

class TaskHarvest extends Task {
    constructor(targetId, options = {}) {
        super(TaskHarvest.taskName, targetId, options);
    }

    isValidTask() {
        return this.creep.getActiveBodyparts(WORK) > 0 && this.creep.store.getFreeCapacity > 0;
    }

    isValidTarget() {
        return this.target && this.target.energy > 0
    }

    work() {
        return this.creep.harvest(this.target);
    }
}
TaskHarvest.taskName = 'harvest';

class TaskBuild extends Task {
    constructor(targetId, options = {}) {
        super(TaskBuild.taskName, targetId, options);
        this.settings.targetRange = 3;
    }

    isValidTask() {
        return this.creep.getActiveBodyparts(WORK) > 0 && this.creep.store[RESOURCE_ENERGY] > 0;
    }

    isValidTarget() {
        return this.target && this.target.my && this.target.progress < this.target.progressTotal;
    }

    work() {
        return this.creep.build(this.target);
    }
}
TaskBuild.taskName = 'build';

class TaskUpgrade extends Task {
    constructor(targetId, options = {}) {
        super(TaskUpgrade.taskName, targetId, options);
        this.settings.targetRange = 3;
    }

    isValidTask() {
        return (this.creep.store[RESOURCE_ENERGY] > 0);
    }

    isValidTarget() {
        return this.target && this.target.my;
    }

    work() {
        return this.creep.upgradeController(this.target);
    }
}
TaskUpgrade.taskName = 'upgrade';

function initializeTask(protoTask) {
    let taskName = protoTask.name;
    let targetId = protoTask.targetId;
    console.log(TaskTransfer.taskName)
    let task;
    switch (taskName) {
        case TaskHarvest.taskName:
            task = new TaskHarvest(targetId);
            break;
        case TaskBuild.taskName:
            task = new TaskBuild(targetId);
            break;
        case TaskUpgrade.taskName:
            task = new TaskUpgrade(targetId);
            break;
        case TaskTransfer.taskName:
            task = new TaskTransfer(targetId)
        default:
            console.log(`Invalid task name: ${taskName}!`);
            task = null;
    }
    task.proto = protoTask;
    return task;
}

// Creep prototypes =============================================================================================
Object.defineProperty(Creep.prototype, 'task', {
    get() {
        let protoTask = this.memory.task;
        return protoTask ? initializeTask(protoTask) : null;
    },
    set(task) {
        // Set the new task
        this.memory.task = task ? task.proto : "Test";
        if (task) {
            // Register references to creep
            task.creep = this;
        }
    },
});
Creep.prototype.run = function () {
    if (this.memory.task) {
        this.task.run();
    }
};
Object.defineProperties(Creep.prototype, {
    'hasValidTask': {
        get() {
            return this.task && this.task.isValid();
        }
    },
    'isIdle': {
        get() {
            return !this.hasValidTask;
        }
    }
});

// RoomPosition prototypes =============================================================================================
Object.defineProperty(RoomPosition.prototype, 'isEdge', {
    get: function () {
        return this.x == 0 || this.x == 49 || this.y == 0 || this.y == 49;
    },
});

// Export stuff =============================================================================================
class Tasks$1 {
    static attack(target, options = {}) {
        return new TaskAttack(target, options);
    }

    static build(target, options = {}) {
        return new TaskBuild(target, options);
    }

    static claim(target, options = {}) {
        return new TaskClaim(target, options);
    }

    static dismantle(target, options = {}) {
        return new TaskDismantle(target, options);
    }

    static drop(target, resourceType = RESOURCE_ENERGY, amount = undefined, options = {}) {
        return new TaskDrop(target, resourceType, amount, options);
    }

    static fortify(target, options = {}) {
        return new TaskFortify(target, options);
    }

    static getBoosted(target, amount = undefined, options = {}) {
        return new TaskGetBoosted(target, amount, options);
    }

    static getRenewed(target, options = {}) {
        return new TaskGetRenewed(target, options);
    }

    static goTo(target, options = {}) {
        return new TaskGoTo(target, options);
    }

    static goToRoom(target, options = {}) {
        return new TaskGoToRoom(target, options);
    }

    static harvest(target, options = {}) {
        return new TaskHarvest(target, options);
    }

    static heal(target, options = {}) {
        return new TaskHeal(target, options);
    }

    static meleeAttack(target, options = {}) {
        return new TaskMeleeAttack(target, options);
    }

    static pickup(target, options = {}) {
        return new TaskPickup(target, options);
    }

    static rangedAttack(target, options = {}) {
        return new TaskRangedAttack(target, options);
    }

    static repair(target, options = {}) {
        return new TaskRepair(target, options);
    }

    static reserve(target, options = {}) {
        return new TaskReserve(target, options);
    }

    static signController(target, signature, options = {}) {
        return new TaskSignController(target, signature, options);
    }

    static transfer(target, resourceType = RESOURCE_ENERGY, amount = undefined, options = {}) {
        return new TaskTransfer(target, resourceType, amount, options);
    }

    static upgrade(target, options = {}) {
        return new TaskUpgrade(target, options);
    }

    static withdraw(target, resourceType = RESOURCE_ENERGY, amount = undefined, options = {}) {
        return new TaskWithdraw(target, resourceType, amount, options);
    }
}

// creep-tasks index; ensures proper compilation order

module.exports = Tasks$1;