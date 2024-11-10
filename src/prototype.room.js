const BuildRequest = require('class.BuildRequest');
const RepairRequest = require('class.RepairRequest');

const config = require('config');
const {roomStage} = require("./config");

function deref(objectID) {
    return Game.getObjectById(objectID) || Game.flags[objectID] || Game.creeps[objectID] || Game.spawns[objectID] || null;
}

module.exports = function () {
    Room.prototype.updateMemory = function () {
        if (!this.memory.construction_sites || Game.time % 5 === 0) {
            this.updateMemoryConstructionSites();
        }

        if (!this.memory.stage || Game.time % 50 === 0) {
            this.updateMemoryStage();
        }

        if (!this.memory.source_metas || Game.time % 50 === 1) {
            this.updateMemorySources();
        }

        if (this.memory.stage >= 4 && !this.memory.storage_id || Game.time % 50 === 2) {
            this.updateMemoryStorage();
        }

        if (this.memory.stage >= 5 && (!this.memory.link_storage_id || !this.memory.link_source_ids || Game.time % 50 === 3)) {
            this.updateMemoryLinks();
        }

        this.memory.full_containers = this.find(FIND_STRUCTURES, {
            filter: (s) =>
                s.structureType === STRUCTURE_CONTAINER
                && s.store.getUsedCapacity() > s.store.getCapacity() * 0.8
        });

        this.updateMemoryRequests()
    }

    Room.prototype.updateMemoryStage = function () {
        let rcl = this.controller.level;
        let room_stage = config.roomStage[this.name];
        if (this.memory.stage) {
            // Von unten nach oben lesen

            // Bedingungen abschluss Stage 6
            if (rcl >= 7 && room_stage >= 7 &&
                this.find(FIND_STRUCTURES, {filter: s => s.structureType === STRUCTURE_EXTENSION}).length >= 40 &&
                this.find(FIND_STRUCTURES, {filter: s => s.structureType === STRUCTURE_CONTAINER}).length >= 2 &&
                this.find(FIND_STRUCTURES, {filter: s => s.structureType === STRUCTURE_TOWER}).length >= 2 &&
                this.find(FIND_STRUCTURES, {filter: s => s.structureType === STRUCTURE_STORAGE}).length >= 1 &&
                this.find(FIND_MY_STRUCTURES, {filter: s => s.structureType === STRUCTURE_LINK}).length >= 2 &&
                false // TODO: Extractor, Lab, Terminal
            ) {
                this.memory.stage = 7;
            }
            // Bedingungen abschluss Stage 5
            else if (rcl >= 6 && room_stage >= 6 &&
                this.find(FIND_STRUCTURES, {filter: s => s.structureType === STRUCTURE_EXTENSION}).length >= 30 &&
                this.find(FIND_STRUCTURES, {filter: s => s.structureType === STRUCTURE_CONTAINER}).length >= 2 &&
                this.find(FIND_STRUCTURES, {filter: s => s.structureType === STRUCTURE_TOWER}).length >= 2 &&
                this.find(FIND_STRUCTURES, {filter: s => s.structureType === STRUCTURE_STORAGE}).length >= 1 &&
                this.find(FIND_MY_STRUCTURES, {filter: s => s.structureType === STRUCTURE_LINK}).length >= 2
            ) {
                this.memory.stage = 6;
            }
            // Bedingungen abschluss Stage 4
            else if (rcl >= 5 && room_stage >= 5 &&
                this.find(FIND_STRUCTURES, {filter: s => s.structureType === STRUCTURE_EXTENSION}).length >= 20 &&
                this.find(FIND_STRUCTURES, {filter: s => s.structureType === STRUCTURE_CONTAINER}).length >= 2 &&
                this.find(FIND_STRUCTURES, {filter: s => s.structureType === STRUCTURE_TOWER}).length >= 1 &&
                this.find(FIND_STRUCTURES, {filter: s => s.structureType === STRUCTURE_STORAGE}).length >= 1
            ) {
                this.memory.stage = 5;
            }
            // Bedingungen abschluss Stage 3
            else if (rcl >= 4 && room_stage >= 4 &&
                this.find(FIND_STRUCTURES, {filter: s => s.structureType === STRUCTURE_EXTENSION}).length >= 10 &&
                this.find(FIND_STRUCTURES, {filter: s => s.structureType === STRUCTURE_CONTAINER}).length >= 2 &&
                this.find(FIND_STRUCTURES, {filter: s => s.structureType === STRUCTURE_TOWER}).length >= 1
            ) {
                // Stage 4 ist erreicht, wenn Tower vorhanden Extensions gebaut
                // Im besten Fall auch Warrior Creep und RemoteHarvester
                this.memory.stage = 4;
            }
            // Bedingungen abschluss Stage 2
            else if (rcl >= 3 && room_stage >= 3
                && this.find(FIND_STRUCTURES, {filter: s => s.structureType === STRUCTURE_EXTENSION}).length >= 5
                && this.find(FIND_STRUCTURES, {filter: s => s.structureType === STRUCTURE_CONTAINER}).length >= 2) {
                // Stage 3 ist erreicht, wenn die Extensions gebaut sind und die Container neben den Sources stehen,
                // und im besten Fall Miner und Transporter, das Energie sammeln übernehmen
                // und im besten Fall ein Straßennetzwerk steht
                this.memory.stage = 3;
            }
            // Bedingungen abschluss Stage 1
            else if (rcl >= 2 && room_stage >= 2) {
                // Stage 2 ist erreicht, wenn RCL 2 erreicht ist
                this.memory.stage = 2;
            }
            // Bedingungen abschluss Stage 0
            else if (rcl >= 1 && room_stage >= 1 &&
                this.find(FIND_MY_STRUCTURES, {filter: s => s.structureType === STRUCTURE_SPAWN})
            ) {
                this.memory.stage = 1;
            }
            // default Stage 0
            else {
                this.memory.stage = 0;
            }
        } else {
            this.memory.stage = 0;
        }
    }

    Room.prototype.updateMemorySources = function () {
        this.memory.source_metas = {}
        for (let source of this.find(FIND_SOURCES)) {
            this.memory.source_metas[source.id] = {
                num_containers: source.pos.findInRange(FIND_STRUCTURES, 1, {filter: s => s.structureType === STRUCTURE_CONTAINER}).length,
                num_links: source.pos.findInRange(FIND_STRUCTURES, 2, {filter: s => s.structureType === STRUCTURE_LINK}).length
            }
        }
    }

    Room.prototype.updateMemoryStorage = function () {
        try {
            this.memory.storage_id = this.find(FIND_MY_STRUCTURES, {
                filter: (l) =>
                    l.structureType === STRUCTURE_STORAGE
            })[0].id;
        } catch (e) {
            this.memory.storage_id = undefined;
        }
    }

    Room.prototype.updateMemoryLinks = function () {
        try {
            this.memory.link_storage_id = deref(this.memory.storage_id).pos.findInRange(FIND_MY_STRUCTURES, 2, {
                filter: (l) =>
                    l.structureType === STRUCTURE_LINK
            })[0].id;
        } catch (e) {
            this.memory.link_storage_id = undefined;
        }

        this.memory.link_source_ids = [];
        for (const [source_id, source_meta] of Object.entries(this.memory.source_metas)) {
            try {
                this.memory.link_source_ids.push(deref(source_id).pos.findInRange(FIND_MY_STRUCTURES, 2, {
                    filter: (l) =>
                        l.structureType === STRUCTURE_LINK
                })[0].id);
            } catch (e) {
            }
        }
        if (this.memory.link_source_ids.length === 0) {
            this.memory.link_source_ids.length = undefined;
        }
    }

    Room.prototype.updateMemoryConstructionSites = function () {
        this.memory.construction_sites = {
            'tower': this.find(FIND_CONSTRUCTION_SITES, {
                filter:
                    c => c.structureType === STRUCTURE_TOWER
            }),
            'energy_storage': this.find(FIND_CONSTRUCTION_SITES, {
                filter:
                    c => c.structureType === STRUCTURE_EXTENSION ||
                        c.structureType === STRUCTURE_CONTAINER ||
                        c.structureType === STRUCTURE_STORAGE ||
                        c.structureType === STRUCTURE_LINK
            }),
            'all': this.find(FIND_CONSTRUCTION_SITES)
        }
    }

    Room.prototype.updateMemoryRequests = function () {
        if (!this.memory.requests) {
            this.memory.requests = [];
        }
        let requests = [];
        let room_stage = this.memory.stage;

        for (let _request of this.memory.requests) {
            if (!deref(_request.target)) continue
            let request = null;
            switch (_request.type) {
                case config.BUILD_REQUEST:
                    request = new BuildRequest(_request.target, _request.priority);
                    break;
                case config.REPAIR_REQUEST:
                    request = new RepairRequest(_request.target, _request.priority);
                    break;
            }
            if (request != null && !request.invalid() && !_.some(requests, req => req.target.id === request.target.id)) {
                requests.push(request)
            }
        }

        // update requests for construction sites
        for (let construction_site of this.find(FIND_CONSTRUCTION_SITES)) {
            if (!_.some(requests, req => req.target.id === construction_site.id)) {
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
                    requests.push(new BuildRequest(construction_site.id, priority));
                }
            }
        }

        // update requests for repair sites
        for (let repair_site of this.find(FIND_STRUCTURES, {filter: s => s.hits < s.hitsMax * config.repairThreshold})) {
            if (!_.some(requests, req => req.target.id === repair_site.id)) {
                let priority = 1;
                if (repair_site.hits < config.quickRepairThreshold) {
                    priority = 10;
                } else if (repair_site.structureType !== STRUCTURE_RAMPART && repair_site.structureType !== STRUCTURE_WALL) {
                    priority = 4;
                } else if (
                    repair_site.structureType === STRUCTURE_RAMPART &&
                    repair_site.structureType === STRUCTURE_WALL &&
                    repair_site.hits < config.stageOptions.wallRepairs[room_stage]
                ) {
                    priority = 3;
                } else if (
                    repair_site.structureType === STRUCTURE_RAMPART &&
                    repair_site.structureType === STRUCTURE_WALL &&
                    repair_site.hits >= config.stageOptions.wallRepairs[room_stage]
                ) {
                    priority = -1;
                }

                if (priority >= 0) {
                    requests.push(new RepairRequest(repair_site.id, priority));
                }
            }
        }

        this.memory.requests = [];
        requests.sort((a, b) => b.priority - a.priority).forEach(request => {
            this.memory.requests.push(request.toObj());
        })
    }
}
