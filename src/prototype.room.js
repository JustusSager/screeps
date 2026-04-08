var config = require('config');
const {
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
} = require('classes');

module.exports = function () {
    Room.prototype.memory_room_properties = function() {
        // energy sources
        let sources = this.find(FIND_SOURCES);
        this.memory.energy_sources = sources; // TODO refactor sodass nur die id gespeichert wird.

        // mineral sources
        sources = this.find(FIND_MINERALS);
        this.memory.mineral_sources = []
        for (let source of sources) this.memory.mineral_sources.push(source.id);
    }


    Room.prototype.memory_roles = function () {
        // update memory of current roles
        let current = {
            "defenders": _.sum(Game.creeps, (c) => (c.memory.role == 'defender' && c.memory.room_home == this.name)),
            "miners": _.sum(Game.creeps, (c) => (c.memory.role == 'miner' && c.memory.room_home == this.name)),
            "workers": _.sum(Game.creeps, (c) => (c.memory.role == 'worker' && c.memory.room_home == this.name)),
            "transporters": _.sum(Game.creeps, (c) => (c.memory.role == 'transporter' && c.memory.room_home == this.name))
        }
        this.memory.creepRoles_current = current;

        // update memory of target number of roles
        this.memory.creepRoles_max = {
            "defenders": ((this.find(FIND_HOSTILE_CREEPS).length > 0) && current.defenders < 2),
            "miners": this.memory.energy_sources.length,
            "workers": ((current.miners + Math.floor(this.memory.amount_dropped_energy / 500))),
            "transporters": current.miners
        }
    }

    Room.prototype.memory_tasks = function () {
        // update memory
        this.memory.creepTasks_current = {
            "harvest": _.sum(Game.creeps, (c) => (c.memory.task && c.memory.task.type == TASK_HARVEST && c.memory.room_home == this.name)),
            "upgrade": _.sum(Game.creeps, (c) => (c.memory.task && c.memory.task.type == TASK_UPGRADE && c.memory.room_home == this.name)),
            "build": _.sum(Game.creeps, (c) => (c.memory.task && c.memory.task.type == TASK_BUILD && c.memory.room_home == this.name)),
            "repair": _.sum(Game.creeps, (c) => (c.memory.task && c.memory.task.type == TASK_REPAIR && c.memory.room_home == this.name)),
            "withdraw": _.sum(Game.creeps, (c) => (c.memory.task && c.memory.task.type == TASK_WITHDRAW && c.memory.room_home == this.name)),
            "pickup": _.sum(Game.creeps, (c) => (c.memory.task && c.memory.task.type == TASK_PICKUP && c.memory.room_home == this.name)),
            "transfer": _.sum(Game.creeps, (c) => (c.memory.task && c.memory.task.type == TASK_TRANSFER && c.memory.room_home == this.name)),
        };
        return this.memory.creepTasks;
    }

    Room.prototype.reset_tasks = function() {
        this.memory.open_tasks = {
            "harvest": {},
            "upgrade": {},
            "build": {},
            "repair": {},
            "withdraw": {},
            "pickup": {},
            "transfer": {}
        }
        console.log("Tasks reset");
    }

    Room.prototype.update_tasks = function() {
        // setup memory
        if (!this.memory.open_tasks) this.reset_tasks();
        if (!this.memory.open_tasks.harvest) this.reset_tasks();
        if (!this.memory.open_tasks.upgrade) this.reset_tasks();
        if (!this.memory.open_tasks.build) this.reset_tasks();
        if (!this.memory.open_tasks.repair) this.reset_tasks();
        if (!this.memory.open_tasks.withdraw) this.reset_tasks();
        if (!this.memory.open_tasks.pickup) this.reset_tasks();
        if (!this.memory.open_tasks.transfer) this.reset_tasks();
        
        let open_tasks = this.memory.open_tasks;

        let search_result

        // upgrade
        if(!open_tasks.upgrade[this.controller.id]) {
            let task = gen_task_upgrade(this.controller.id);
            open_tasks.upgrade[this.controller.id] = task.to_dict()
        }

        // build
        search_result = this.find(FIND_CONSTRUCTION_SITES);
        for (let o of search_result) {
            if(!open_tasks.build[o.id]) {
                open_tasks.build[o.id] = gen_task_build(o.id).to_dict()
            }
        }

        // repair
        search_result = this.find(FIND_MY_STRUCTURES, {filter: (s) => s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART});
        for (let o of search_result) {
            if(!open_tasks.repair[o.id]) {
                open_tasks.repair[o.id] = gen_task_repair(o.id).to_dict()
            }
        }

        // withdraw
        search_result = this.find(FIND_STRUCTURES, {filter: (s) => ((s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE) && s.store[RESOURCE_ENERGY] > 0)});
        for (let o of search_result) {
            if(!open_tasks.withdraw[o.id]) {
                open_tasks.withdraw[o.id] = gen_task_withdraw(o.id, RESOURCE_ENERGY).to_dict()
            }
        }
        
        // pickup
        search_result = this.find(FIND_DROPPED_RESOURCES);
        for (let o of search_result) {
            if(!open_tasks.pickup[o.id]) {
                open_tasks.pickup[o.id] = gen_task_pickup(o.id).to_dict()
            }
        }

        // transfer
        search_result = this.find(FIND_MY_STRUCTURES, {filter: (s) => (s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION) && s.store.getFreeCapacity([RESOURCE_ENERGY]) > 0});
        for (let o of search_result) {
            if(!open_tasks.transfer[o.id]) {
                open_tasks.transfer[o.id] = gen_task_transfer(o.id, RESOURCE_ENERGY).to_dict()
            }
        }
        
        this.memory.open_tasks = open_tasks;
    }

    Room.prototype.assign_tasks = function(creeps) {
        var open_tasks = {}
        for (const [task_type, task_dict] of Object.entries(this.memory.open_tasks)) {
            for (const [id, d] of Object.entries(this.memory.open_tasks[task_type])) {
                let task = gen_task_from_dict(d);
                if (!open_tasks[task_type]) open_tasks[task_type] = []

                if (task.is_valid()) open_tasks[task_type].push(task);
            }
        }


        let num_upgraders = this.memory.creepTasks_current.upgrade;
        for (let creep of creeps) {
            // creep has energy
            if (creep.store.getUsedCapacity() > 0) {
                // one creep always upgrades
                if (num_upgraders == 0) {
                    console.log("Assigned Task upgrade (" + open_tasks.upgrade[0].target.id + ") to Creep " + creep.name);
                    open_tasks.upgrade[0].assign_to_creep(creep);
                    num_upgraders++;
                    continue;
                }

                // repair
                if (open_tasks.repair && open_tasks.repair.length > 0) {
                    console.log("Assigned Task repair (" + open_tasks.repair[0].target.id + ") to Creep " + creep.name);
                    open_tasks.repair[0].assign_to_creep(creep);
                    if (open_tasks.repair[0].work_left <= 0) open_tasks.repair.slice(1);
                    continue;
                }

                // build
                if (open_tasks.build && open_tasks.build.length > 0) {
                    console.log("Assigned Task build (" + open_tasks.build[0].target.id + ") to Creep " + creep.name);
                    open_tasks.build[0].assign_to_creep(creep);
                    if (open_tasks.build[0].work_left <= 0) open_tasks.build.slice(1);
                    continue;
                }

                // else upgrade
                console.log("Assigned Task upgrade (" + open_tasks.upgrade[0].target.id + ") to Creep " + creep.name);
                open_tasks.upgrade[0].assign_to_creep(creep);
                num_upgraders++;
                continue;
            } 
            // creep does not have energy
            else {
                // pickup
                if (open_tasks.pickup && open_tasks.pickup.length > 0) {
                    console.log("Assigned Task pickup (" + open_tasks.pickup[0].target.id + ") to Creep " + creep.name);
                    open_tasks.pickup[0].assign_to_creep(creep);
                    if (open_tasks.pickup[0].work_left <= 0) open_tasks.pickup.slice(1);
                    continue;
                }

                // withdraw
                if (open_tasks.withdraw && open_tasks.withdraw.length > 0) {
                    console.log("Assigned Task withdraw (" + open_tasks.withdraw[0].target.id + ") to Creep " + creep.name);
                    open_tasks.withdraw[0].assign_to_creep(creep);
                    if (open_tasks.withdraw[0].work_left <= 0) open_tasks.withdraw.slice(1);
                    continue;
                }
            }
        }
        var updated_tasks = {
            "harvest": {},
            "upgrade": {},
            "build": {},
            "repair": {},
            "withdraw": {},
            "pickup": {},
            "transfer": {}
        }
        for (const [key, val] of Object.entries(open_tasks)) {
            for (const t of val) {
                if (t.is_valid()) updated_tasks[key][t.target.id] = t.to_dict()
            };
        }

        this.memory.open_tasks = updated_tasks;
    }

    Room.prototype.memory_construction_sites = function () {
        this.memory.construction_sites = this.find(FIND_CONSTRUCTION_SITES);
    }

    Room.prototype.memory_amount_dropped_energy = function () {
        let dropped_energy = this.find(FIND_DROPPED_RESOURCES, {filter: (r) => r.resourceType == RESOURCE_ENERGY});
        let stored_energy = this.find(FIND_STRUCTURES, {filter: (s) => (s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE)})
        let sum = 0;
        for (let i of dropped_energy) {
            sum = sum + i.amount;
        }
        for (let s of stored_energy) {
            sum = sum + s.store[RESOURCE_ENERGY];
        }
        this.memory.amount_dropped_energy = sum;
    }

    Room.prototype.memory_storage_link = function () {
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

    Room.prototype.memory_source_links = function () {
        this.memory.source_links = [];
        let source_links = _.filter(Game.structures, s => s.pos.findInRange(FIND_SOURCES, 2).length > 0 && s.structureType == STRUCTURE_LINK);
        for (let i = 0; i < source_links.length; i++) {
            this.memory.source_links.push(source_links[i].id);
        }
    }

    Room.prototype.memory_labs = function () {
        this.memory.labs = {};
    }

    Room.prototype.handle_memory = function () {
        if (!this.memory.max_spawn_energy) {
            this.memory.max_spawn_energy = config.initalMaxSpawnEnergy;
        }
        

        this.memory_roles();
        this.memory_tasks();

        if (!this.memory.energy_sources || Game.time % 1000 == 0) {
            this.memory_room_properties();
        }
        if (!this.memory.mineral_sources || Game.time % 200 == 27) {
            this.reset_tasks();
        }
        if (!this.memory.construction_sites || Game.time % 10 == 0) {
            this.memory_construction_sites();
        }
        if (!this.memory.amount_dropped_energy || Game.time % 50 == 2) {
            this.memory_amount_dropped_energy();
        }

        // Links
        if (this.controller.level > 4 && (!this.memory.storage_link || Game.time % 10 == 1)) {
            this.memory_storage_link();
        }
        if (this.controller.level > 4 && (!this.memory.source_links || Game.time % 10 == 2)) {
            this.memory_source_links();
        }

        // Labs
        if (this.controller.level > 5 && !this.memory.labs) {
            this.memory_labs();
        }
    }

    Room.prototype.visualize = function (display_as_roomvisual = true, print_to_console = true) {
        const curR = this.memory.creepRoles_current;
        const maxR = this.memory.creepRoles_max;
        const curT = this.memory.creepTasks_current;
        const opeT = this.memory.open_tasks;

        let text_role = this.name + ' (' + this.controller.level + ') ' +
            ': E ' + this.energyAvailable + '/' + this.energyCapacityAvailable +
            ' D ' + curR.defenders + '/' + maxR.defenders +
            ' M ' + curR.miners + '/' + maxR.miners +
            ' W ' + curR.workers + '/' + maxR.workers +
            ' T ' + curR.transporters + '/' + maxR.transporters;

        let text_task = 'Tasks: ' +
            ' H' + curT.harvest + "/" + Object.keys(opeT.harvest).length +
            ' B' + curT.build + "/" + Object.keys(opeT.build).length +
            ' R' + curT.repair + "/" + Object.keys(opeT.repair).length +
            ' U' + curT.upgrade + "/" + Object.keys(opeT.upgrade).length +
            ' W' + curT.withdraw + "/" + Object.keys(opeT.withdraw).length +
            ' P' + curT.pickup + "/" + Object.keys(opeT.pickup).length +
            ' T' + curT.transfer + "/" + Object.keys(opeT.transfer).length;

        if (display_as_roomvisual) {
            new RoomVisual(this.name).text(text_role, 25, 2, { color: 'green', font: 0.8 });
            new RoomVisual(this.name).text(text_task, 25, 3, { color: 'green', font: 0.8 });
        }
        if (print_to_console) {
            console.log(text_role);
            console.log(text_task);
        }
    }
};
