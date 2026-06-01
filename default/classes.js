const TASK_HARVEST = "harvest";
const TASK_UPGRADE = "upgrade";
const TASK_BUILD = "build";
const TASK_REPAIR = "repair";
const TASK_WITHDRAW = "withdraw";
const TASK_PICKUP = "pickup";
const TASK_TRANSFER = "transfer";
const TASK_GET_RENEWED = "getRenewed";

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

function gen_task_from_dict(dict) {
    return new Task(
        dict.type,
        dict.target_id,
        dict.range,
        dict.resource,
        dict.work_left
    )
}

class Task {
    constructor(type, target_id, range, resource, work_left) {
        this.type = type;
        this.target = Game.getObjectById(target_id);
        this.range = range;
        this.resource = resource;
        this.work_left = work_left;
    }

    is_valid() {
        if (this.work_left <= 0) return false;

        if(!this.target) return false;

        switch(this.type) {
            case TASK_HARVEST:
                return (
                    this.target.energy > 0
                )
            case TASK_UPGRADE:
                return true;
            case TASK_BUILD:
                return (
                    (this.target.progressTotal - this.target.progress) > 0
                )
            case TASK_REPAIR:
                return (
                    (this.target.hitsMax - this.target.hits) > 0
                )
            case TASK_WITHDRAW:
                return (
                    this.target.store[this.resource] > 0
                )
            case TASK_PICKUP:
                return (
                    this.target.amount > 0 &&
                    this.target.resourceType == this.resource
                )
            case TASK_TRANSFER:
                return (
                    this.target.store.getFreeCapacity() > 0
                )
        }
    }

    is_valid_for_creep(creep) {
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
        creep.memory.task = this.to_dict();
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
            "target_id": this.target.id,
            "range": this.range,
            "resource": this.resource,
            "work_left": this.work_left
        }
    }
}

module.exports = {
    TASK_HARVEST,
    TASK_UPGRADE,
    TASK_BUILD,
    TASK_REPAIR,
    TASK_WITHDRAW,
    TASK_PICKUP,
    TASK_TRANSFER,
    TASK_GET_RENEWED,
    gen_task_harvest,
    gen_task_upgrade,
    gen_task_build,
    gen_task_repair,
    gen_task_withdraw,
    gen_task_pickup,
    gen_task_transfer,
    gen_task_from_dict,
    Task
};