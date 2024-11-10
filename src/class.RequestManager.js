const config = require("config");
const BuildRequest = require("class.BuildRequest");
const RepairRequest = require("class.RepairRequest");
const UpgradeRequest = require("class.UpgradeRequest");

class RequestManager {
    constructor(room) {
        this.room = room;
        this.room_stage = this.room.memory.stage;
        this.requests = [];
        this.max_priority = 0;
    }

    load_construction_site_requests() {
        for (let construction_site of this.room.find(FIND_CONSTRUCTION_SITES)) {
            let priority = 1;
            if (
                construction_site.structureType === STRUCTURE_TOWER ||
                construction_site.structureType === STRUCTURE_SPAWN
            ) {
                priority = 9;
            } else if (
                construction_site.structureType === STRUCTURE_EXTENSION ||
                construction_site.structureType === STRUCTURE_STORAGE ||
                construction_site.structureType === STRUCTURE_LINK ||
                construction_site.structureType === STRUCTURE_CONTAINER
            ) {
                priority = 5;
            } else if (construction_site.structureType !== STRUCTURE_ROAD) {
                priority = 2;
            }
            if (priority >= 0) {
                this.requests.push(new BuildRequest(construction_site.id, priority));
            }
        }
        this.update_max_priority();
    }

    load_repair_site_requests() {
        for (let repair_site of this.room.find(FIND_STRUCTURES, {filter: s => s.hits < s.hitsMax * config.repairThreshold})) {
            let priority = 1;
            if (repair_site.hits < config.quickRepairThreshold) {
                priority = 10;
            } else if (repair_site.structureType !== STRUCTURE_RAMPART && repair_site.structureType !== STRUCTURE_WALL) {
                priority = 4;
            } else if (
                repair_site.structureType === STRUCTURE_RAMPART &&
                repair_site.structureType === STRUCTURE_WALL &&
                repair_site.hits < config.stageOptions.wallRepairs[this.room_stage]
            ) {
                priority = 3;
            } else if (
                repair_site.structureType === STRUCTURE_RAMPART &&
                repair_site.structureType === STRUCTURE_WALL &&
                repair_site.hits >= config.stageOptions.wallRepairs[this.room_stage]
            ) {
                priority = -1;
            }

            if (priority >= 0) {
                this.requests.push(new RepairRequest(repair_site.id, priority));
            }
        }
        this.update_max_priority();
    }

    load_controller_requests() {
        let controller = this.room.controller;
        let num_current_upgrader = _.filter(Game.creeps, c => c.room === this.room && c.memory.task && c.memory.task.name === 'upgrade').length;
        if (num_current_upgrader === 0) {
            this.requests.push(new UpgradeRequest(controller.id, 10))
        } else {
            this.requests.push(new UpgradeRequest(controller.id, 1))
        }
        this.update_max_priority();
    }

    update_max_priority() {
        this.requests.sort((a, b) => b.priority - a.priority);
        this.max_priority = Math.max(...this.requests.map(req => req.priority));
    }

    getRequest(creep) {
        let request = creep.pos.findClosestByPath(this.requests.filter(req => req.priority >= this.max_priority));
        if (request instanceof UpgradeRequest) {
            request.priority = 1;
        }
        return request
    }

    toMemory() {
        let _requests = []
        for (let request of this.requests) {
            _requests.push(request.toObj());
        }
        this.room.memory.requests = _requests;
    }

}

module.exports = RequestManager;
