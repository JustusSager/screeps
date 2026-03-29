const TASK_HARVEST = "harvest";
const TASK_UPGRADE = "upgrade";
const TASK_BUILD = "build";
const TASK_REPAIR = "repair";
const TASK_WITHDRAW = "withdraw";
const TASK_PICKUP = "pickup";
const TASK_TRANSFER = "transfer";

// TODO noch umbauen, sodass es mit minerals funktioniert
function gen_task_harvest(target_id) {
    let target = Game.getObjectById(target_id);
    return new Task(
        TASK_HARVEST,
        target_id,
        1,
        RESOURCE_ENERGY,
        (target.energyCapacity - target.energy)
    )
}

function gen_task_upgrade(target_id) {
    let target = Game.getObjectById(target_id);
    return new Task(
        TASK_UPGRADE,
        target_id,
        3,
        RESOURCE_ENERGY,
        (target.progressTotal - target.progress)
    )
}

function gen_task_build(target_id) {
    let target = Game.getObjectById(target_id);
    return new Task(
        TASK_BUILD,
        target_id,
        3,
        RESOURCE_ENERGY,
        (target.progressTotal - target.progress)
    )
}

function gen_task_repair(target_id) {
    let target = Game.getObjectById(target_id);
    return new Task(
        TASK_REPAIR,
        target_id,
        3,
        RESOURCE_ENERGY,
        (target.hitsMax - target.hits)
    )
}

function gen_task_withdraw(target_id, resource) {
    let target = Game.getObjectById(target_id);
    return new Task(
        TASK_WITHDRAW,
        target_id,
        1,
        resource,
        target.store[resource]
    )
}

function gen_task_pickup(target_id) {
    let target = Game.getObjectById(target_id);
    return new Task(
        TASK_PICKUP,
        target_id,
        1,
        target.resourceType,
        target.amount
    )
}

function gen_task_transfer(target_id, resource) {
    let target = Game.getObjectById(target_id);
    return new Task(
        TASK_TRANSFER,
        target_id,
        1,
        resource,
        target.store.getFreeCapacity()
    )
}

class Task {
    constructor(type, target_id, range, resource, work_left) {
        this.type = type;
        this.target_id = target_id;
        this.range = range;
        this.resource = resource;
        this.work_left = work_left;
    }

    is_valid() {
        if (this.work_left <= 0) return false;

        let target = Game.getObjectById(this.target_id);
        if(!target) return false;

        switch(this.type) {
            case TASK_HARVEST:
                return (
                    target.energy > 0
                )
            case TASK_BUILD:
                return (
                    (target.progressTotal - target.progress) > 0
                )
            case TASK_REPAIR:
                return (
                    (target.hitsMax - target.hits) > 0
                )
            case TASK_WITHDRAW:
                return (
                    target.store[this.resource] > 0
                )
            case TASK_PICKUP:
                return (
                    target.amount > 0 &&
                    target.resourceType == this.resource
                )
            case TASK_TRANSFER:
                return (
                    target.store.getFreeCapacity() > 0
                )
        }
    }

    is_valid_task(creep) {
        switch(this.type) {
            case TASK_HARVEST:
                return (
                    creep.getActiveBodyparts(WORK) > 0 &&
                    creep.store.getFreeCapacity() > 0
                )
            case TASK_UPGRADE:
            case TASK_BUILD:
            case TASK_REPAIR:
                return (
                    creep.getActiveBodyparts(WORK) > 0 &&
                    creep.store[RESOURCE_ENERGY] > 0
                )
            case TASK_WITHDRAW:
            case TASK_PICKUP:
                return (
                    creep.store.getFreeCapacity() > 0
                )
            case TASK_TRANSFER:
                return (
                    creep.store[this.resource] > 0
                )
        }
    }

    assign_to_creep(creep) {
        creep.memory.task = {
            "name": this.type,
            "target": this.target_id,
            "range": this.range,
            "resource": this.resource
        }
        switch(this.type) {
            case TASK_HARVEST:
            case TASK_WITHDRAW:
            case TASK_PICKUP:
                this.work_left -= creep.store.getFreeCapacity();
                break;
            case TASK_UPGRADE:
            case TASK_BUILD:
            case TASK_REPAIR:
            case TASK_TRANSFER:
                this.work_left -= creep.store[this.resource];
                break;
        }
    }

    to_dict() {
        return {
            "type": this.type,
            "target_id": this.target_id,
            "range": this.range,
            "resource_type": this.resource,
            "work_left": this.work_left
        }
    }

    from_dict(dict) {
        return Task(
            dict.type,
            dict.target_id,
            dict.range,
            dict.resource_type,
            dict.work_left
        )
    }
}

module.exports = {
    gen_task_harvest,
    gen_task_upgrade,
    gen_task_build,
    gen_task_repair,
    gen_task_withdraw,
    gen_task_pickup,
    gen_task_transfer,
    Task
};