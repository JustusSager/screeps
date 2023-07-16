'use strict';

function deref(ref) {
    return Game.getObjectById(ref) || Game.flags[ref] || Game.creeps[ref] || Game.spawns[ref] || null;
}
function derefRoomPos(protoPos) {
    return new RoomPosition(protoPos.x, protoPos.y, protoPos.roomName);
}

class Task {
    constructor(taskName, creep, target, options={}) {
        this.name = taskName;
        this.creepName = creep.name;
        if(target) {
            this.targetId = target.id;
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
        return derefRoomPos(this.target != null? this.target.pos : null);
    }

    isValid() {
        let validTask = false;
        if (this.creep) {
            validTask = this.isValidTask();
        }

        let validTarget = false;
        if (this.target) {
            validTarget = this.isValidTarget();
        }

        return validTask && validTarget;
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
    constructor(creep, target, resourceType = RESOURCE_ENERGY, amount = undefined, options = {}) {
        super(TaskTransfer.taskName, creep, target, options);
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
    constructor(creep, target, options = {}) {
        super(TaskHarvest.taskName, creep, target, options);
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
    constructor(creep, target, options = {}) {
        super(TaskBuild.taskName, creep, target, options);
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
    constructor(creep, target, options = {}) {
        super(TaskUpgrade.taskName, creep, target, options);
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

class TaskInvalid extends Task {
    constructor(creep, target, options = {}) {
        super(TaskInvalid.taskName, creep, target, options);
    }

    isValidTask() {
        return false;
    }

    isValidTarget() {
        return false;
    }

    work() {
        this.creep.say('ERROR');
        return false;
    }

}
TaskInvalid.taskName = 'INVALID'

function initializeTask(protoTask) {
    let taskName = protoTask.name;
    let creep = deref(protoTask.creepName);
    let target = deref(protoTask.targetId);
    let task;
    switch (taskName) {
        case TaskHarvest.taskName:
            task = new TaskHarvest(creep, target);
            break;
        case TaskUpgrade.taskName:
            task = new TaskUpgrade(creep, target);
            break;
        case TaskTransfer.taskName:
            task = new TaskTransfer(creep, target)
        default:
            console.log(`Invalid task name: ${taskName}!`);
            task = new TaskInvalid(null);
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
        this.memory.task = task ? task.proto : null;
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
    static harvest(target, options = {}) {
        return new TaskHarvest(target, options);
    }

    static transfer(target, resourceType = RESOURCE_ENERGY, amount = undefined, options = {}) {
        return new TaskTransfer(target, resourceType, amount, options);
    }

    static upgrade(target, options = {}) {
        return new TaskUpgrade(target, options);
    }
}

// creep-tasks index; ensures proper compilation order

module.exports = Tasks$1;
