const config = require("config");
const BuildRequest = require("class.BuildRequest");
const RepairRequest = require("class.RepairRequest");
const UpgradeRequest = require("class.UpgradeRequest");
const PickupRequest = require("class.PickupRequest");

class RequestManager {
    constructor(room) {
        this.room = room;
        this.room_stage = this.room.memory.stage;
        this.requests = [];
        this.max_priority = 0;

        this.load_construction_site_requests();
        this.load_repair_site_requests();
        this.load_controller_requests();
        this.load_pickup_requests();
        this.update_max_priority();
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
    }

    load_controller_requests() {
        let controller = this.room.controller;
        let num_current_upgrader = _.filter(Game.creeps, c => c.room === this.room && c.memory.task && c.memory.task.name === 'upgrade').length;
        if (num_current_upgrader === 0) {
            this.requests.push(new UpgradeRequest(controller.id, 10))
        } else {
            this.requests.push(new UpgradeRequest(controller.id, 1))
        }
    }

    load_pickup_requests() {
        for (let dropped_resource of this.room.find(FIND_DROPPED_RESOURCES)) {
            this.requests.push(new PickupRequest(dropped_resource.id, 1));
        }
    }

    update_max_priority() {
        this.requests.sort((a, b) => b.priority - a.priority);
        this.max_priority = Math.max(...this.requests.map(req => req.priority));
    }

    getRequest(creep) {
        let possible_requests = this.requests.filter(req => req.prerequisites_fulfilled(creep) && req.workLeft > 0);
        let max = Math.max(...possible_requests.map(req => req.priority));
        possible_requests = possible_requests.filter(req => req.priority === max);
        let request = creep.pos.findClosestByPath(possible_requests);
        if (request instanceof UpgradeRequest) {
            request.priority = 1;
        } else if (request instanceof PickupRequest) {
            request.workLeft -= creep.store.getFreeCapacity();
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
