var config = require('config');

module.exports = function () {
    Room.prototype.memory_roles = function () {
        // update memory
        this.memory.creepRoles_current = {
            "defenders": _.sum(Game.creeps, (c) => (c.memory.role == 'defender' && c.memory.room_home == this.name)),
            "miners": _.sum(Game.creeps, (c) => (c.memory.role == 'miner' && c.memory.room_home == this.name)),
            "workers": _.sum(Game.creeps, (c) => (c.memory.role == 'worker' && c.memory.room_home == this.name)),
            "transporters": _.sum(Game.creeps, (c) => (c.memory.role == 'transporter' && c.memory.room_home == this.name))
        };
        if (!this.memory.creepRoles_max) {
            this.memory.creepRoles_max = {
                "defenders": config.initMaxCreepRoles.defenders
            };
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

    Room.prototype.memory_energy_sources =
        function () {
            this.memory.energy_sources = this.find(FIND_SOURCES);
        }

    Room.prototype.memory_mineral_sources =
        function () {
            let sources = this.find(FIND_MINERALS);
            this.memory.mineral_sources = []
            for (let source of sources) {
                this.memory.mineral_sources.push(source.id);
            }
        }

    Room.prototype.memory_construction_sites =
        function () {
            this.memory.construction_sites = this.find(FIND_CONSTRUCTION_SITES);
        }

    Room.prototype.memory_amount_dropped_energy =
        function () {
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

    Room.prototype.memory_storage_link =
        function () {
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

    Room.prototype.memory_source_links =
        function () {
            this.memory.source_links = [];
            let source_links = _.filter(Game.structures, s => s.pos.findInRange(FIND_SOURCES, 2).length > 0 && s.structureType == STRUCTURE_LINK);
            for (let i = 0; i < source_links.length; i++) {
                this.memory.source_links.push(source_links[i].id);
            }
        }

    Room.prototype.memory_labs =
        function () {
            this.memory.labs = {};
        }

    Room.prototype.handle_memory =
        function () {
            if (!this.memory.max_spawn_energy) {
                this.memory.max_spawn_energy = config.initalMaxSpawnEnergy;
            }
            

            this.memory_roles();
            this.memory_tasks();

            if (!this.memory.energy_sources || Game.time % 1000 == 0) {
                this.memory_energy_sources();
            }
            if (!this.memory.mineral_sources || Game.time % 1000 == 0) {
                this.memory_mineral_sources();
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

        let text_role = this.name + ' (' + this.controller.level + ') ' +
            ': E ' + this.energyAvailable + '/' + this.energyCapacityAvailable +
            ' D ' + curR.defenders + '/' + maxR.defenders +
            ' M ' + curR.miners + '/' + this.memory.energy_sources.length +
            ' W ' + curR.workers + '/' + (1 + Math.floor(this.memory.amount_dropped_energy / 250)) +
            ' T ' + curR.transporters + '/' + (curR.miners);

        let text_task = 'Tasks: ' +
            ' H' + curT.harvest +
            ' B' + curT.build +
            ' R' + curT.repair +
            ' U' + curT.upgrade +
            ' W' + curT.withdraw +
            ' P' + curT.pickup +
            ' T' + curT.transfer;

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
