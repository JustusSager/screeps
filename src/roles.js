require("prototype.creep");

Creep.prototype.initTask = function () {
    if (this.memory.role && !this.memory.task) {
        this.memory.task = {name: 'idle'};
    }
}

Creep.prototype.updateTask = function () {
    if (this.memory.role && this.memory.task.name === 'idle') {
        switch (this.memory.role) {
            case 'Harvester':
                if (this.store[RESOURCE_ENERGY] > 0) {
                    this.memory.task = {
                        name: 'transfer',
                        targetID: this.findStoreEnergy().id,
                        options: {resource: RESOURCE_ENERGY}
                    };
                } else {
                    this.memory.task = {
                        name: 'harvest',
                        targetID: this.pos.findClosestByPath(FIND_SOURCES_ACTIVE).id
                    };
                }
                break;
            case 'Upgrader':
                if (this.store[RESOURCE_ENERGY] > 0) {
                    this.memory.task = {
                        name: 'upgrade',
                        targetID: this.room.controller.id
                    };
                } else {
                    this.memory.task = {
                        name: 'harvest',
                        targetID: this.pos.findClosestByPath(FIND_SOURCES_ACTIVE).id
                    };
                }
                break;
            case 'Builder':
                if (this.store[RESOURCE_ENERGY] > 0 && this.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES)) {
                    this.memory.task = {
                        name: 'build',
                        targetID: this.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES).id
                    };
                } else if (this.store[RESOURCE_ENERGY] > 0 && this.findRepairSite()) {
                    this.memory.task = {
                        name: 'repair',
                        targetID: this.findRepairSite().id
                    };
                }
                else if (this.findDroppedResources()) {
                    this.memory.task = {
                        name: 'pickup',
                        targetID: this.findDroppedResources().id
                    };
                } else if (this.findWithdrawEnergy()) {
                    this.memory.task = {
                        name: 'withdraw',
                        targetID: this.findWithdrawEnergy().id,
                        options: {resource: RESOURCE_ENERGY}
                    };
                } else {
                    this.memory.task = {
                        name: 'harvest',
                        targetID: this.pos.findClosestByPath(FIND_SOURCES_ACTIVE).id,
                        options: {resource: RESOURCE_ENERGY}
                    };
                }
                break;
            default:
                break;
        }
    }
}
