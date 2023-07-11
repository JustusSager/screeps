
module.exports = function() {
    Room.prototype.init_memory = 
    function() {
        if (!this.memory.energy_sources) {
            this.memory.energy_sources = this.find(FIND_SOURCES);
        }
        if (!this.memory.construction_sites) {
            this.memory.construction_sites = this.find(FIND_CONSTRUCTION_SITES);
        }
        if (!this.memory.num_construction_sites) {
            this.memory.num_construction_sites = this.find(FIND_CONSTRUCTION_SITES).length;
        }
        if (!this.memory.amount_dropped_energy) {
            let dropped_energy = num_dropped_energy = this.find(FIND_DROPPED_RESOURCES, {
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

        // Links
        if (!this.memory.storage_link && this.controller.level > 4) {
            let storages = _.filter(Game.structures, s => s.structureType == STRUCTURE_STORAGE && s.room == this);
            if (storages.length  > 0) {
                let storage_links = storages[0].pos.findInRange(FIND_STRUCTURES, 2, {
                    filter: s => s.structureType == STRUCTURE_LINK
                });
                if (storage_links > 0) {
                    this.memory.storage_link = storage_links[0].id;
                }
            }
        }
    }
    
    Room.prototype.update_memory = 
    function(force) {
        if (Game.time % 10 == 0) {
            this.memory.construction_sites = this.find(FIND_CONSTRUCTION_SITES);
        }
        // Links
        if(this.controller.level > 4 & Game.time % 10 == 1) {
            let storages = _.filter(Game.structures, s => s.structureType == STRUCTURE_STORAGE && s.room == this);
            if (storages.length  > 0) {
                let storage_links = storages[0].pos.findInRange(FIND_STRUCTURES, 2, {
                    filter: s => s.structureType == STRUCTURE_LINK
                });
                if (storage_links > 0) {
                    this.memory.storage_link = storage_links[0].id;
                }
            }
        }

        if (Game.time % 50 == 1 || force) {
            this.memory.num_construction_sites = this.find(FIND_CONSTRUCTION_SITES).length;
        }
        if (Game.time % 50 == 2 || force) {
            let dropped_energy = num_dropped_energy = this.find(FIND_DROPPED_RESOURCES, {
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
        if (Game.time % 1000 == 0) {
            this.memory.energy_sources = this.find(FIND_SOURCES);
        }
    }
};