var config = require('config');

require('prototype.roomvisual')();

const {
    CREEP_ROLE_MINER, 
    CREEP_ROLE_WORKER, 
    CREEP_ROLE_CARRIER, 
    CREEP_ROLE_REMOTE_HARVESTER, 
    CREEP_ROLE_DEFENDER,
    TASK_HARVEST,
    TASK_UPGRADE,
    TASK_BUILD,
    TASK_REPAIR,
    TASK_WITHDRAW,
    TASK_PICKUP,
    TASK_TRANSFER,
    TASK_GET_RENEWED,
} = require('constants');


var basebuilding = require('basebuilding');
const { ROOM_STATUS_MY_ROOM, ROOM_STATUS_UNAVAILABLE, ROOM_STATUS_TAKEN, ROOM_STATUS_RESERVED, ROOM_STATUS_AVAILABLE } = require('./constants');


module.exports = function () {

    // ----------------------------------------------------------------------------------------------------------------
    // SPAWNING
    // ----------------------------------------------------------------------------------------------------------------

    Room.prototype.spawn_from_queu = function(spawn_queu) {
        let spawn_queu_local = spawn_queu
        spawns = _.filter(Game.spawns, s => s.room.name == this.name);
        for (let i in spawns) {
            if (spawn_queu_local.length == 0) return spawn_queu_local;
            let energy = this.energyAvailable > this.memory.max_spawn_energy ? this.memory.max_spawn_energy : this.energyAvailable;
            let energyMax = this.energyCapacityAvailable < this.memory.max_spawn_energy ? this.energyCapacityAvailable : this.memory.max_spawn_energy

            if (
                energy < energyMax &&
                this.memory.amount_dropped_energy > (energyMax - energy) && 
                this.memory.creepRoles_current.miners > 0 &&
                this.memory.creepRoles_current.transporters > 0
            ) {
                console.log("skipping spawning for better times")
                return;
            }
            
            let sketch = spawn_queu_local.pop();
            let result = spawns[i].spawn_from_sketch(sketch, energy)
        }
        return spawn_queu_local;
    }

    Room.prototype.fill_spawn_queu = function(spawn_queu, creeps_of_room, energy_source_ids) {
        let spawn_queu_local = spawn_queu
        const current = this.memory.creepRoles_current
        const queud = {
            "defenders": _.sum(spawn_queu_local, (c) => (c.role == CREEP_ROLE_DEFENDER)),
            "miners": _.sum(spawn_queu_local, (c) => (c.role == CREEP_ROLE_MINER)),
            "workers": _.sum(spawn_queu_local, (c) => (c.role == CREEP_ROLE_WORKER)),
            "transporters": _.sum(spawn_queu_local, (c) => (c.role == CREEP_ROLE_CARRIER)),
            "remoteHarvesters": _.sum(spawn_queu_local, (c) => (c.role == CREEP_ROLE_REMOTE_HARVESTER))
        }
        const max = this.memory.creepRoles_max;

        if (this.memory.miners_near_death.length > 0) {
            spawn_queu_local = [];
        }
    
        
        // check for free mining positions 
        for (let source_id of energy_source_ids) {
            if (_.some(spawn_queu_local, s => s.role == CREEP_ROLE_MINER && s.source_id == source_id)) continue;
            if (_.some(creeps_of_room, c => c.memory.role == CREEP_ROLE_MINER && c.memory.source_id == source_id)) continue;
            if (_.some(Game.spawns, s => s.spawning)) break; //TODO ein sehr grober fix, damit nicht mehrere miner für eine source gespawnt werden, wenn bereits einer spawnt
            
            let links = Game.getObjectById(source_id).pos.findInRange(FIND_STRUCTURES, 2, {
                filter: s => s.structureType == STRUCTURE_LINK
            });
            let source_keepers = Game.getObjectById(source_id).pos.findInRange(FIND_STRUCTURES, 10, {
                filter: s => s.structureType == STRUCTURE_KEEPER_LAIR
            });
            if (source_keepers == 0) {
                spawn_queu_local.push({
                    role: CREEP_ROLE_MINER,
                    source_id: source_id,
                    link_mining: links.length > 0,
                    priority: (current.miners == 0 ? 10 : 5)
                })
            }
        }

        if (this.memory.miners_near_death.length == 0) {

            // check for free transporter positions
            for (let i = 0; i < (max.transporters - current.transporters - queud.transporters); i++) {
                spawn_queu_local.push({
                    role: CREEP_ROLE_CARRIER,
                    priority: (current.transporters == 0 ? 9 : 4)
                })
            }
            // check for free worker positions
            for (let i = 0; i < (max.workers - current.workers - queud.workers); i++) {
                spawn_queu_local.push({
                    role: CREEP_ROLE_WORKER,
                    room_target: this.name,
                    priority: (current.workers == 0 ? 8 : 3)
                })
            }
        }

        return spawn_queu_local.sort((a, b) => a.priority - b.priority);
    }

    Room.prototype.memory_roles = function () {
        // update memory of current roles
        let current = {
            "defenders": _.sum(Game.creeps, (c) => (c.memory.role == CREEP_ROLE_DEFENDER && c.memory.room_home == this.name)),
            "miners": _.sum(Game.creeps, (c) => (c.memory.role == CREEP_ROLE_MINER && c.memory.room_home == this.name)),
            "workers": _.sum(Game.creeps, (c) => (c.memory.role == CREEP_ROLE_WORKER && c.memory.room_home == this.name)),
            "transporters": _.sum(Game.creeps, (c) => (c.memory.role == CREEP_ROLE_CARRIER && c.memory.room_home == this.name)),
            "remoteHarvesters": _.sum(Game.creeps, (c) => (c.memory.role == CREEP_ROLE_REMOTE_HARVESTER && c.memory.room_home == this.name))
        }
        this.memory.creepRoles_current = current;

        // update memory of target number of roles
        this.memory.creepRoles_max = {
            "defenders": ((this.find(FIND_HOSTILE_CREEPS).length > 0) && current.defenders < config.spawning.max_defenders),
            "miners": this.memory.energy_source_ids.length,
            "workers": ((current.miners + Math.floor(this.memory.amount_dropped_energy / config.spawning.max_workers_energy_divider))),
            "transporters": current.miners,
            "remoteHarvesters": 0
        }
    }

    Room.prototype.find_accessible_neighbors = function() {
        return Game.map.describeExits(this.name)
    }
    

    Room.prototype.base_planing = function() {
        if (config.basebuilding.floodfill) {
            baseplaningUtils.getDistanceTransform(this.name, {visual: true})
        }
    }

    Room.prototype.base_building = function() {
        bunker_flag = this.find(FIND_FLAGS, {filter: f => f.name == "BunkerFlag"})
        if (bunker_flag.length == 0) return

        if (Object.keys(this.find(FIND_CONSTRUCTION_SITES)).length < config.basebuilding.maxConstructionSites) {
            basebuilding.run(bunker_flag[0]);
        }
    }

    Room.prototype.memory_into_worldmap = function() {
        if (!Memory.worldmap) Memory.worldmap = {};
        if (!Memory.worldmap[this.name]) Memory.worldmap[this.name] = {};

        // memory sources and minerals
        Memory.worldmap[this.name]['sources'] = this.find(FIND_SOURCES).map(s => { return {id: s.id }});
        Memory.worldmap[this.name]['minerals'] = this.find(FIND_MINERALS).map(m => { return {id: m.id, type: m.mineralType }});
        Memory.worldmap[this.name]['exits'] = this.find_accessible_neighbors();


        if (this.controller) {
            if (this.controller.reservation) {
                Memory.worldmap[this.name]['ownership'] = { type: ROOM_STATUS_RESERVED, by: this.controller.reservation.username };
            } 
            else if (this.controller.owner) {
                Memory.worldmap[this.name]['ownership'] = { type: ROOM_STATUS_TAKEN, by: this.controller.owner.username };
            } 
            else {
                Memory.worldmap[this.name]['ownership'] = { type: ROOM_STATUS_AVAILABLE };
            }
        } 
        else {
            Memory.worldmap[this.name]['ownership'] = { type: ROOM_STATUS_UNAVAILABLE };
        }
    }

    Room.prototype.handle_memory = function () {
        // inital room configuration values -----------------------------------------------------------------

        if (!this.memory.max_spawn_energy) {
            this.memory.max_spawn_energy = config.initalMaxSpawnEnergy;
        }
        if (!this.memory.spawn_queu) this.memory.spawn_queu = [];


        // RCL statistics -----------------------------------------------------------------------------------

        if (!this.memory.control_level_stats) {
            this.memory.control_level_stats = {};
        }
        if (!(this.controller.level in this.memory.control_level_stats)) {
            if (this.controller.level == 1) {
                this.memory.control_level_stats[this.controller.level] = Game.time;
            } else {
                this.memory.control_level_stats[this.controller.level] = Game.time - this.memory.control_level_stats[1];
            }
            
        }

        // dynamic room statistics --------------------------------------------------------------------------

        // dropped resources
        if (!this.memory.amount_dropped_energy || Game.time % 10 == 2) {
            let dropped_energy = this.find(FIND_DROPPED_RESOURCES, {filter: (r) => r.resourceType == RESOURCE_ENERGY});
            let stored_energy = this.find(FIND_STRUCTURES, {filter: (s) => (s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE)})
            let sum = 0;
            for (let i of dropped_energy) {
                sum += i.amount;
            }
            for (let s of stored_energy) {
                sum += s.store[RESOURCE_ENERGY];
            }
            this.memory.amount_dropped_energy = sum;
        }

        // miner near death
        if (!this.memory.miners_near_death || Game.time % 10 == 3) {
            let miners_near_death = _.filter(Game.creeps, c => c.memory.room_home == this.name && c.memory.role == CREEP_ROLE_MINER && c.ticksToLive < config.spawning.critical_ttl_for_miners);
            this.memory.miners_near_death = miners_near_death.map(c => c.id)
        }


        // structures ---------------------------------------------------------------------------------------

        // Links
        if (this.controller.level > 4 && (!this.memory.storage_link || Game.time % 20 == 2)) {
            let storages = _.filter(Game.structures, s => s.structureType == STRUCTURE_STORAGE && s.room == this);
            if (storages.length > 0) {
                let storage_links = storages[0].pos.findInRange(FIND_STRUCTURES, 2, {
                    filter: s => s.structureType == STRUCTURE_LINK
                });
                if (storage_links.length > 0) {
                    this.memory.storage_link = storage_links[0].id;
                }
            }
        }
        if (this.controller.level > 4 && (!this.memory.source_links || Game.time % 10 == 3)) {
            this.memory.source_links = [];
            let source_links = _.filter(Game.structures, s => s.pos.findInRange(FIND_SOURCES, 2).length > 0 && s.structureType == STRUCTURE_LINK);
            for (let i = 0; i < source_links.length; i++) {
                this.memory.source_links.push(source_links[i].id);  
            }
        }

        // Labs
        if (this.controller.level > 5 && (!this.memory.labs || Game.time % 10 == 4)) {
            this.memory.labs = {};
        }

        // creeps -------------------------------------------------------------------------------------------

        this.memory_roles();
    }

    Room.prototype.visualize = function (current_tasks) {
        const visual = new RoomVisual(this.name);

        const curR = this.memory.creepRoles_current;
        const maxR = this.memory.creepRoles_max;

        if (config.roomVisuals.roomStats) {
            let stats = [
                ["Energy", this.energyAvailable, this.energyCapacityAvailable],
                ["Defs", curR.defenders, maxR.defenders],
                ["Miner", curR.miners, maxR.miners],
                ["Carrier", curR.transporters, maxR.transporters],
                ["Worker", curR.workers, maxR.workers],
                ["R.Harv.", curR.remoteHarvesters, maxR.remoteHarvesters]
            ]
            visual.table(["Stats"], [2.6, 1.5, 1], stats, config.roomVisuals.roomStats.x, config.roomVisuals.roomStats.y)
        }

        if (config.roomVisuals.currentTasks) {
            visual.table(["Tasks"], [2.6, 1, 1], current_tasks, config.roomVisuals.currentTasks.x, config.roomVisuals.currentTasks.y)
        }

        if (config.roomVisuals.spawnQueu) {
            let queud_roles = [];
            for(let q in this.memory.spawn_queu) {
                queud_roles.push([
                    this.memory.spawn_queu[q].role, 
                    this.memory.spawn_queu[q].priority
                ]);
            }
            visual.table(["Spawn Queu"], [2.6, 1], queud_roles, config.roomVisuals.spawnQueu.x, config.roomVisuals.spawnQueu.y)
        }

        if (config.roomVisuals.rcl_stats) {
            let rcl_stats = []
            for(let k in this.memory.control_level_stats) {
                rcl_stats.push([k, this.memory.control_level_stats[k]]);
            }
            visual.table(["RCL Stats"], [1, 1], rcl_stats, config.roomVisuals.rcl_stats.x, config.roomVisuals.rcl_stats.y);
        }
    }
}
