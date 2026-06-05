class TaskManager {
    constructor(room) {
        this.room = room
        this.tasks = []
    }

    add_task_upgrade() {
        this.tasks.push(Task(
            
        ))
    }
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