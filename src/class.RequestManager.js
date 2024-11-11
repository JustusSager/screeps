const config = require("config");
const BuildRequest = require("class.BuildRequest");
const HarvestRequest = require("class.HarvestRequest");
const PickupRequest = require("class.PickupRequest");
const RepairRequest = require("class.RepairRequest");
const TransferRequest = require("class.TransferRequest");
const UpgradeRequest = require("class.UpgradeRequest");
const WithdrawRequest = require("class.WithdrawRequest");

class RequestManager {
    constructor(room) {
        this.room = room;
        this.room_stage = this.room.memory.stage;
        this.requests = [];

        this.load_construction_site_requests();
        this.load_repair_site_requests();
        this.load_controller_requests();
        this.load_pickup_requests();
        this.load_withdraw_requests();
        this.load_harvest_requests();
        this.load_transfer_request();
        this.requests.sort((a, b) => b.priority - a.priority);
    }

    load_construction_site_requests() {
        for (let construction_site of this.room.find(FIND_CONSTRUCTION_SITES)) {
            let priority = 1;
            if (construction_site.structureType === STRUCTURE_TOWER || construction_site.structureType === STRUCTURE_SPAWN) {
                priority = 8;
            } else if (construction_site.structureType === STRUCTURE_EXTENSION || construction_site.structureType === STRUCTURE_STORAGE || construction_site.structureType === STRUCTURE_LINK || construction_site.structureType === STRUCTURE_CONTAINER) {
                priority = 6;
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
            } else if (repair_site.structureType === STRUCTURE_RAMPART && repair_site.structureType === STRUCTURE_WALL && repair_site.hits < config.stageOptions.wallRepairs[this.room_stage]) {
                priority = 3;
            } else if (repair_site.structureType === STRUCTURE_RAMPART && repair_site.structureType === STRUCTURE_WALL && repair_site.hits >= config.stageOptions.wallRepairs[this.room_stage]) {
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
            this.requests.push(new UpgradeRequest(controller.id, 10));
        } else {
            this.requests.push(new UpgradeRequest(controller.id, 1));
        }
    }

    load_pickup_requests() {
        for (let dropped_resource of this.room.find(FIND_DROPPED_RESOURCES, {filter: r => r.amount > 0})) {
            let priority = Math.max(5, Math.min(2, dropped_resource.amount / 100))
            this.requests.push(new PickupRequest(dropped_resource.id, priority));
        }
    }

    load_withdraw_requests() {
        for (let container of this.room.find(FIND_STRUCTURES, {
            filter: s => (s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_STORAGE) && s.store.getUsedCapacity() > 100
        })) {
            let priority = 1 + Math.round((container.store.getUsedCapacity() / container.store.getCapacity()) * 5)
            this.requests.push(new WithdrawRequest(container.id, RESOURCE_ENERGY, priority));
        }
    }

    load_harvest_requests() {
        for (let source of this.room.find(FIND_SOURCES_ACTIVE, {
            filter: s => !_.some(Game.creeps, c => c.memory.role === config.CREEP_MINER && c.memory.sourceID === s.id)
        })) {
            this.requests.push(new HarvestRequest(source.id, 1));
        }
    }

    load_transfer_request() {
        for (let structure of this.room.find(FIND_STRUCTURES, {
            filter: s => (s.structureType === STRUCTURE_SPAWN ||
                s.structureType === STRUCTURE_EXTENSION ||
                s.structureType === STRUCTURE_TOWER) &&
                s.store.getFreeCapacity(RESOURCE_ENERGY) > 10
        })) {
            let priority = this.room.energyAvailable < 200 ? 10 : Math.floor((1 - (this.room.energyAvailable / this.room.energyCapacityAvailable)) * 10)
            this.requests.push(new TransferRequest(structure.id, RESOURCE_ENERGY, priority))
        }
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
        } else if (request instanceof WithdrawRequest) {
            request.workLeft -= creep.store.getFreeCapacity();
        }
        if (request) creep.memory.request = request.toObj(); else creep.memory.request = undefined;
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
