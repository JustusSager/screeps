const config = require('./config')

const { TASK_BUILD, TASK_UPGRADE, TASK_HARVEST, TASK_REPAIR, TASK_WITHDRAW, TASK_PICKUP, TASK_TRANSFER, TASK_GET_RENEWED } = require('./constants');

function gen_task_from_dict(dict) {
    switch (dict.type) {
        case TASK_BUILD:
            return new TaskBuild(Game.getObjectById(dict.target_id))
        case TASK_HARVEST:
            return new TaskHarvest(Game.getObjectById(dict.target_id))
        case TASK_PICKUP:
            return new TaskPickup(Game.getObjectById(dict.target_id))
        case TASK_REPAIR:
            return new TaskRepair(Game.getObjectById(dict.target_id))
        case TASK_TRANSFER:
            return new TaskTransfer(Game.getObjectById(dict.target_id))
        case TASK_UPGRADE:
            return new TaskUpgrade(Game.getObjectById(dict.target_id))
        case TASK_WITHDRAW:
            return new TaskWithdraw(Game.getObjectById(dict.target_id))
        default:
            return false;
    }
}


class TaskManager {
    constructor(room) {
        this.room = room
        this.tasks = []
    }

    find_open_tasks() {
        // Upgrade
        this.tasks.push(new TaskUpgrade(this.room.controller));

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

        // Pickup
        result = this.room.find(FIND_DROPPED_RESOURCES, {filter: (r) => r.resourceType == RESOURCE_ENERGY});
        for (const resource of result) {
            this.tasks.push(new TaskPickup(resource));
        }

        // Withdraw
        result = this.room.find(FIND_STRUCTURES, {filter: (s) => (s.structureType == STRUCTURE_CONTAINER) && s.store[RESOURCE_ENERGY] > 0})
        for (const structure of result) {
            this.tasks.push(new TaskWithdraw(structure, config.taskPrio.withdraw_container));
        }
        result = this.room.find(FIND_STRUCTURES, {filter: (s) => (s.structureType == STRUCTURE_STORAGE) && s.store[RESOURCE_ENERGY] > 0})
        for (const structure of result) {
            this.tasks.push(new TaskWithdraw(structure, config.taskPrio.withdraw_storage));
        }

        // Transfer
        result = this.room.find(FIND_MY_STRUCTURES, {filter: (s) => (s.structureType == STRUCTURE_TOWER) && s.store.getFreeCapacity([RESOURCE_ENERGY]) > 0});
        for (const structure of result) {
            this.tasks.push(new TaskTransfer(structure, config.taskPrio.transfer_tower));
        }
        result = this.room.find(FIND_MY_STRUCTURES, {filter: (s) => (s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION) && s.store.getFreeCapacity([RESOURCE_ENERGY]) > 0});
        for (const structure of result) {
            this.tasks.push(new TaskTransfer(structure, config.taskPrio.transfer_spawn_extensions));
        }
        result = this.room.find(FIND_MY_STRUCTURES, {filter: (s) => (s.structureType == STRUCTURE_STORAGE) && s.store.getFreeCapacity([RESOURCE_ENERGY]) > 0});
        for (const structure of result) {
            this.tasks.push(new TaskTransfer(structure, config.taskPrio.transfer_storage));
        }

        // filter for only valid
        this.tasks = this.tasks.filter(t => t.is_valid())

        // order by priority
        this.tasks.sort((a, b) => b.priority - a.priority)
    }

    create_stats_assigned_tasks() {
        return [
            [TASK_BUILD, _.sum(Game.creeps, c => c.memory.task && c.memory.task.type == TASK_BUILD && c.memory.room_home && this.room.name), _.sum(this.tasks, t => t.type == TASK_BUILD)],
            [TASK_HARVEST, _.sum(Game.creeps, c => c.memory.task && c.memory.task.type == TASK_HARVEST && c.memory.room_home && this.room.name), _.sum(this.tasks, t => t.type == TASK_HARVEST)],
            [TASK_PICKUP, _.sum(Game.creeps, c => c.memory.task && c.memory.task.type == TASK_PICKUP && c.memory.room_home && this.room.name), _.sum(this.tasks, t => t.type == TASK_PICKUP)],
            [TASK_REPAIR, _.sum(Game.creeps, c => c.memory.task && c.memory.task.type == TASK_REPAIR && c.memory.room_home && this.room.name), _.sum(this.tasks, t => t.type == TASK_REPAIR)],
            [TASK_TRANSFER, _.sum(Game.creeps, c => c.memory.task && c.memory.task.type == TASK_TRANSFER && c.memory.room_home && this.room.name), _.sum(this.tasks, t => t.type == TASK_TRANSFER)],
            [TASK_UPGRADE, _.sum(Game.creeps, c => c.memory.task && c.memory.task.type == TASK_UPGRADE && c.memory.room_home && this.room.name), _.sum(this.tasks, t => t.type == TASK_UPGRADE)],
            [TASK_WITHDRAW, _.sum(Game.creeps, c => c.memory.task && c.memory.task.type == TASK_WITHDRAW && c.memory.room_home && this.room.name), _.sum(this.tasks, t => t.type == TASK_WITHDRAW)],
            [TASK_GET_RENEWED, _.sum(Game.creeps, c => c.memory.task && c.memory.task.type == TASK_GET_RENEWED && c.memory.room_home && this.room.name), _.sum(this.tasks, t => t.type == TASK_GET_RENEWED)],
        ]
    }

    assign_task(creep, sort_by_distance=false) {
        let valid_tasks = this.tasks.filter(t => t.is_valid_for_creep(creep))
        if (sort_by_distance) {
            valid_tasks.sort(
                (a, b) => ((a.target.pos.x - creep.pos.x) + (a.target.pos.y - creep.pos.y)) - ((b.target.pos.x - creep.pos.x) + (b.target.pos.y - creep.pos.y))
            )
        }
        if (valid_tasks.length > 0) {
            valid_tasks[0].assign_to_creep(creep);
        }
        this.tasks = this.tasks.filter(t => t.is_valid())
    }

    visulize() {
        const rv = new RoomVisual(this.room.name)
        for (const t of this.tasks) {
            let color = ''
            switch (t.type) {
                case TASK_TRANSFER:
                    color = '#ff0f0f'
                    break;
                case TASK_WITHDRAW:
                    color = '#0fff0f'
                    break;
                case TASK_BUILD:
                case TASK_REPAIR:
                    color = '#0f0fff'
                    break;
                default:
                    color = '#ffffff'
                    break;
            }
            rv.circle_with_text(t.priority, t.target.pos.x, t.target.pos.y, 0.4, color, 0.6)
        }
    }
}

class Task {
    constructor(type, target, range, resource, work_left, priority) {
        this.type = type;
        this.target = target;
        this.range = range;
        this.resource = resource;
        this.work_left = work_left;
        this.priority = priority;
    }


    is_valid() {
        return this.work_left > 0;
    }

    is_valid_for_creep(creep) {
        console.log("Doing nothing, because im the parent Task")
        return false;
    }

    assign_to_creep(creep) {
        creep.memory.task = this.to_dict()
        new RoomVisual(creep.room.name).line(creep, this.target)
    }

    do(creep) {
        creep.say("Do what?")
        return;
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
            controller.progressTotal - controller.progress - work_assigned,  // this.work_left
            _.some(Game.creeps, c => c.memory.task && c.memory.task.type == TASK_UPGRADE) ? config.taskPrio.upgrade : config.taskPrio.upgrade_crit
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
        super.assign_to_creep(creep);
        this.work_left -= creep.store[RESOURCE_ENERGY];
        this.priority = 3;
    }

    do(creep) {
        creep.say("🆙");
        return creep.upgradeController(this.target);
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
            source.energy - work_assigned, // this.work_left
            config.taskPrio.harvest
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
        super.assign_to_creep(creep);
        this.work_left -= creep.store.getFreeCapacity();
    }

    do(creep) {
        creep.say("⛏️")
        return creep.harvest(this.target);
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
            construction_site.progressTotal - construction_site.progress - work_assigned,  // this.work_left
            config.taskPrio.build
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
        super.assign_to_creep(creep);
        this.work_left -= creep.store[RESOURCE_ENERGY];
    }

    do(creep) {
        creep.say("🔨");
        return creep.build(this.target);
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
            structure.hitsMax - structure.hits - work_assigned,  // this.work_left
            config.taskPrio.repair
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
        super.assign_to_creep(creep);
        this.work_left -= creep.store[RESOURCE_ENERGY];
    }

    do(creep) {
        creep.say("🔧");
        return creep.repair(this.target);
    }
}

class TaskWithdraw extends Task {
    constructor(structure, priority=config.taskPrio.withdraw_default, resource=RESOURCE_ENERGY) {
        let work_assigned = 0;
        for (const creep of _.filter(Game.creeps, c => c.memory.task && c.memory.task.type == TASK_WITHDRAW && c.memory.task.target_id == structure.id)) {
            work_assigned += creep.store.getFreeCapacity();
        }
        super(
            TASK_WITHDRAW,  // this.type
            structure,  // this.target
            1,  // this.range
            resource,  // this.resource
            structure.store[resource] - work_assigned,  // this.work_left
            priority // this.priority
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
        super.assign_to_creep(creep);
        this.work_left -= creep.store.getFreeCapacity();
    }

    do(creep) {
        creep.say("🧺");
        // amount = this.memory.task.amount ? this.memory.task.amount : this.store.getFreeCapacity;
        return creep.withdraw(this.target, this.resource);
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
            target.amount - work_assigned,  // this.work_left
            config.taskPrio.pickup
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
        super.assign_to_creep(creep);
        this.work_left -= creep.store.getFreeCapacity();
    }

    do(creep) {
        creep.say("🧺");
        return creep.pickup(this.target);
    }
}

class TaskTransfer extends Task {
    constructor(structure, priority=config.taskPrio.transfer_default, resource=RESOURCE_ENERGY) {
        let work_assigned = 0;
        for (const creep of _.filter(Game.creeps, c => c.memory.task && c.memory.task.type == TASK_TRANSFER && c.memory.task.target_id == structure.id)) {
            work_assigned += creep.store[resource];
        }
        super(
            TASK_TRANSFER,  // this.type
            structure,  // this.target
            1,  // this.range
            resource,  // this.resource
            structure.store.getFreeCapacity(resource) - work_assigned,  // this.work_left
            priority
        )
    }

    is_valid() {
        return super.is_valid() && this.target.store.getFreeCapacity(this.resource) > 0;
    }

    is_valid_for_creep(creep) {
        return (
            creep.getActiveBodyparts(CARRY) > 0 &&
            creep.store[this.resource] > 0
        )
    }

    assign_to_creep(creep) {
        super.assign_to_creep(creep);
        this.work_left -= creep.store[this.resource];
    }

    do(creep) {
        creep.say("🧺");
        // amount = this.memory.task.amount ? this.memory.task.amount : this.store[resource];
        return creep.transfer(this.target, this.resource);
    }
}

module.exports = {
    TaskManager,
    gen_task_from_dict
}