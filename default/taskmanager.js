const config = require('./config')

const { TASK_BUILD, TASK_UPGRADE, TASK_HARVEST, TASK_REPAIR, TASK_WITHDRAW, TASK_PICKUP, TASK_TRANSFER } = require('./constants');


class TaskManager {
    constructor(room) {
        this.room = room
        this.tasks = []
    }

    find_open_tasks() {
        // Repair
        var result = this.room.find(FIND_STRUCTURES, {
            filter: (s) => s.hits < (s.hitsMax * config.taskGeneration.repair_hitsMax_multiplier) && s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART
        })
        for (const structure of result) {
            this.tasks.push(new TaskRepair(structure));
        }

        // Build
        result = this.room.find(FIND_CONSTRUCTION_SITES)
        for (const construction_site of result) {
            this.tasks.push(new TaskBuild(construction_site));
        }

        // filter for only valid
        this.tasks = this.tasks.filter(t => t.is_valid())
    }

    assign_task(creep) {
        let valid_tasks = this.tasks.filter(t => t.is_valid_for_creep(creep)).sort((a, b) => ((a.target.x - creep.target.x) + (a.target.y - creep.target.y)) - ((b.target.x - creep.target.x) + (b.target.y - creep.target.y)))
        if (valid_tasks.length > 0) {
            valid_tasks[0].assign_to_creep(creep);
        }
    }

    add_task_upgrade(controller) {
        this.tasks.push(new TaskUpgrade(controller))
    }

    add_task_harvest(source) {
        this.tasks.push(new TaskHarvest(source))
    }
}

class Task {
    constructor(type, target, range, resource, work_left) {
        this.type = type;
        this.target = target;
        this.range = range;
        this.resource = resource;
        this.work_left = work_left;
        this.priority = 0;
    }


    is_valid() {
        return this.work_left > 0;
    }

    is_valid_for_creep(creep) {
        console.log("Doing nothing, because im the parent Task")
        return false;
    }

    assign_to_creep(creep) {
        console.log("Doing nothing, because im the parent Task")
        return
    }

    to_dict() {
        return {
            "type": this.type,
            "target_id": this.target.id,
            "range": this.range,
            "resource": this.resource,
            "work_left": this.work_left
        }
    }
}

class TaskUpgrade extends Task {
    constructor(controller) {
        let work_assigned = 0;
        for (const creep of _.filter(Game.creeps, c => c.memory.task && c.memory.task.type == TASK_BUILD && c.memory.task.target_id == construction_site.id)) {
            work_assigned += creep.store[RESOURCE_ENERGY];
        }
        super(
            TASK_UPGRADE,  // this.type
            controller,  // this.target
            3,  // this.range
            RESOURCE_ENERGY,  // this.resource
            controller.progressTotal - controller.progress - work_assigned  // this.work_left
        )
    }

    is_valid() {
        return super.is_valid();
    }

    is_valid_for_creep(creep) {
        return (
            creep.getActiveBodyparts(WORK) > 0 &&
            creep.store[RESOURCE_ENERGY] > 0
        )
    }

    assign_to_creep(creep) {
        creep.memory.task = this.to_dict();
        this.work_left =- creep.store[RESOURCE_ENERGY];
    }
}

class TaskHarvest extends Task {
    constructor(source) {
        let work_assigned = 0;
        for (const creep of _.filter(Game.creeps, c => c.memory.task && c.memory.task.type == TASK_HARVEST && c.memory.task.target_id == source.id)) {
            work_assigned += creep.store.getFreeCapacity();
        }
        super(
            TASK_HARVEST,  // this.type
            source,  // this.target
            1,  // this.range
            RESOURCE_ENERGY,  // this.resource
            source.energy - work_assigned // this.work_left
        )
    }

    is_valid() {
        return super.is_valid() && this.target.energy > 0;
    }

    is_valid_for_creep(creep) {
        return (
            creep.getActiveBodyparts(WORK) > 0 &&
            creep.store.getFreeCapacity() > 0
        )
    }

    assign_to_creep(creep) {
        creep.memory.task = this.to_dict();
        this.work_left =- creep.store.getFreeCapacity();
    }
}

class TaskBuild extends Task {
    constructor(construction_site) {
        let work_assigned = 0;
        for (const creep of _.filter(Game.creeps, c => c.memory.task && c.memory.task.type == TASK_BUILD && c.memory.task.target_id == construction_site.id)) {
            work_assigned += creep.store[RESOURCE_ENERGY];
        }
        super(
            TASK_BUILD,  // this.type
            construction_site,  // this.target
            3,  // this.range
            RESOURCE_ENERGY,  // this.resource
            construction_site.progressTotal - construction_site.progress - work_assigned  // this.work_left
        )
    }

    is_valid() {
        return super.is_valid();
    }

    is_valid_for_creep(creep) {
        return (
            creep.getActiveBodyparts(WORK) > 0 &&
            creep.store[RESOURCE_ENERGY] > 0
        )
    }

    assign_to_creep(creep) {
        creep.memory.task = this.to_dict();
        this.work_left =- creep.store[RESOURCE_ENERGY];
    }
}

class TaskRepair extends Task {
    constructor(structure) {
        let work_assigned = 0;
        for (const creep of _.filter(Game.creeps, c => c.memory.task && c.memory.task.type == TASK_REPAIR && c.memory.task.target_id == structure.id)) {
            work_assigned += creep.store[RESOURCE_ENERGY];
        }
        super(
            TASK_REPAIR,  // this.type
            structure,  // this.target
            3,  // this.range
            RESOURCE_ENERGY,  // this.resource
            structure.hitsMax - structure.hits - work_assigned  // this.work_left
        )
    }

    is_valid() {
        return super.is_valid();
    }

    is_valid_for_creep(creep) {
        return (
            creep.getActiveBodyparts(WORK) > 0 &&
            creep.store[RESOURCE_ENERGY] > 0
        )
    }

    assign_to_creep(creep) {
        creep.memory.task = this.to_dict();
        this.work_left =- creep.store[RESOURCE_ENERGY];
        new RoomVisual(this.room.name).line(creep, this.target)
    }
}

class TaskWithdraw extends Task {
    constructor(structure, resource=RESOURCE_ENERGY) {
        let work_assigned = 0;
        for (const creep of _.filter(Game.creeps, c => c.memory.task && c.memory.task.type == TASK_WITHDRAW && c.memory.task.target_id == structure.id)) {
            work_assigned += creep.store.getFreeCapacity();
        }
        super(
            TASK_WITHDRAW,  // this.type
            structure,  // this.target
            1,  // this.range
            resource,  // this.resource
            structure.store[resource] - work_assigned  // this.work_left
        )
    }

    is_valid() {
        return super.is_valid() && this.target.store[this.resource] > 0;
    }

    is_valid_for_creep(creep) {
        return (
            creep.getActiveBodyparts(CARRY) > 0 &&
            creep.store.getFreeCapacity() > 0
        )
    }

    assign_to_creep(creep) {
        creep.memory.task = this.to_dict();
        this.work_left =- creep.store.getFreeCapacity();
        new RoomVisual(this.room.name).line(creep, this.target)
    }
}

class TaskPickup extends Task {
    constructor(target) {
        let work_assigned = 0;
        for (const creep of _.filter(Game.creeps, c => c.memory.task && c.memory.task.type == TASK_PICKUP && c.memory.task.target_id == target.id)) {
            work_assigned += creep.store.getFreeCapacity();
        }
        super(
            TASK_PICKUP,  // this.type
            target,  // this.target
            1,  // this.range
            target.resourceType,  // this.resource
            structure.store[target.resourceType] - work_assigned  // this.work_left
        )
    }

    is_valid() {
        return super.is_valid() && this.target.amount > 0;
    }

    is_valid_for_creep(creep) {
        return (
            creep.getActiveBodyparts(CARRY) > 0 &&
            creep.store.getFreeCapacity() > 0
        )
    }

    assign_to_creep(creep) {
        creep.memory.task = this.to_dict();
        this.work_left =- creep.store.getFreeCapacity();
        new RoomVisual(this.room.name).line(creep, this.target)
    }
}

class TaskTransfer extends Task {
    constructor(structure, resource=RESOURCE_ENERGY) {
        let work_assigned = 0;
        for (const creep of _.filter(Game.creeps, c => c.memory.task && c.memory.task.type == TASK_TRANSFER && c.memory.task.target_id == structure.id)) {
            work_assigned += creep.store[resource];
        }
        super(
            TASK_TRANSFER,  // this.type
            structure,  // this.target
            1,  // this.range
            resource,  // this.resource
            structure.store.getFreeCapacity() - work_assigned  // this.work_left
        )
    }

    is_valid() {
        return super.is_valid() && this.target.store.getFreeCapacity() > 0;
    }

    is_valid_for_creep(creep) {
        return (
            creep.getActiveBodyparts(CARRY) > 0 &&
            creep.store[this.resource] > 0
        )
    }

    assign_to_creep(creep) {
        creep.memory.task = this.to_dict();
        this.work_left =- creep.store.getFreeCapacity();
        new RoomVisual(this.room.name).line(creep, this.target)
    }
}

module.exports = {
    TaskManager
}