var config = require('config');

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
            "workers": (((current.miners * 2) + Math.floor(this.memory.amount_dropped_energy / 250))),
            "transporters": current.miners
        }
    }

    Room.prototype.memory_tasks = function () {
        // update memory
        this.memory.creepTasks_current = {
            "harvest": _.sum(Game.creeps, (c) => (c.memory.task && c.memory.task.name == 'harvest' && c.memory.room_home == this.name)),
            "upgrade": _.sum(Game.creeps, (c) => (c.memory.task && c.memory.task.name == 'upgrade' && c.memory.room_home == this.name)),
            "build": _.sum(Game.creeps, (c) => (c.memory.task && c.memory.task.name == 'build' && c.memory.room_home == this.name)),
            "repair": _.sum(Game.creeps, (c) => (c.memory.task && c.memory.task.name == 'repair' && c.memory.room_home == this.name)),
            "withdraw": _.sum(Game.creeps, (c) => (c.memory.task && c.memory.task.name == 'withdraw' && c.memory.room_home == this.name)),
            "pickup": _.sum(Game.creeps, (c) => (c.memory.task && c.memory.task.name == 'pickup' && c.memory.room_home == this.name)),
            "transfer": _.sum(Game.creeps, (c) => (c.memory.task && c.memory.task.name == 'transfer' && c.memory.room_home == this.name)),
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

    Room.prototype.remove_invalid_tasks = function() {
        let tasks = this.memory.open_tasks;
        for (const [id, attr] of Object.entries(tasks.pickup)) {
            if (attr.amount <= 0) this.memory.open_tasks.pickup[id] = undefined;
            else if (Game.getObjectById(id) == null) this.memory.open_tasks.pickup[id] = undefined;
        }
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

        this.remove_invalid_tasks();
        
        let open_tasks = this.memory.open_tasks;

        let search_result

        // upgrade
        if(!open_tasks.upgrade[this.controller.id]) {
            open_tasks.upgrade[this.controller.id] = {
                "target_id": this.controller.id,
                "resource_type": RESOURCE_ENERGY, 
                "amount": (this.controller.progressTotal - this.controller.progress) // TODO was kommt hier bei RCL 8 raus?
            }
        }

        // build
        search_result = this.find(FIND_CONSTRUCTION_SITES);
        for (let o of search_result) {
            if(!open_tasks.build[o.id]) {
                open_tasks.build[o.id] = {
                    "target_id": o.id,
                    "resource_type": RESOURCE_ENERGY,
                    "amount": (o.progressTotal - o.progress)
                }
            }
        }
        
        // dropped resouces
        search_result = this.find(FIND_DROPPED_RESOURCES);
        for (let o of search_result) {
            if(!open_tasks.pickup[o.id]) {
                open_tasks.pickup[o.id] = {
                    "target_id": o.id,
                    "resource_type": o.type,
                    "amount": o.amount
                }
            }
        }

        // 

        this.memory.open_tasks = open_tasks;
    }

    Room.prototype.memory_construction_sites = function () {
        this.memory.construction_sites = this.find(FIND_CONSTRUCTION_SITES);
    }

    Room.prototype.memory_amount_dropped_energy = function () {
        let dropped_energy = this.find(FIND_DROPPED_RESOURCES, {
            filter: (r) => {
                return r.resourceType == RESOURCE_ENERGY

            }
        });
        let sum = 0;
        for (let i of dropped_energy) {
            sum = sum + i.amount;
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
