
module.exports = function() {
    Room.prototype.memory_energy_sources = 
    function() {
        this.memory.energy_sources = this.find(FIND_SOURCES);
    }

    Room.prototype.memory_construction_sites = 
    function() {
        this.memory.construction_sites = this.find(FIND_SOURCES);
    }

    Room.prototype.memory_amount_dropped_energy = 
    function() {
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
    function() {
        let storages = _.filter(Game.structures, s => s.structureType == STRUCTURE_STORAGE && s.room == this);
        if (storages.length  > 0) {
            let storage_links = storages[0].pos.findInRange(FIND_STRUCTURES, 2, {
                filter: s => s.structureType == STRUCTURE_LINK
            });
            if (storage_links.length > 0) {
                this.memory.storage_link = storage_links[0].id;
            }
        }
    }
    
    Room.prototype.memory_source_links = 
    function() {
        this.memory.source_links = [];
        let source_links = _.filter(Game.structures, s => s.pos.findInRange(FIND_SOURCES, 2).length > 0 && s.structureType == STRUCTURE_LINK);
        for (let i = 0; i < source_links.length; i++) {
            this.memory.source_links.push(source_links[i].id);
        }
    }

    Room.prototype.handle_memory = 
    function() {
        if (!this.memory.energy_sources || Game.time % 1000 == 0) {
            this.memory_energy_sources();
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
    }
};