
module.exports = function() {
    Room.prototype.init_memory = 
    function() {
        if (!this.memory.energy_sources) {
            this.memory.energy_sources = this.find(FIND_SOURCES);
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
    }
    
    Room.prototype.update_memory = 
    function(force) {
        if (Game.time % 1000 == 0) {
            this.memory.energy_sources = this.find(FIND_SOURCES);
        } 
        else if (Game.time % 50 == 1 || force) {
            this.memory.num_construction_sites = this.find(FIND_CONSTRUCTION_SITES).length;
        }
        else if (Game.time % 50 == 2 || force) {
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
    }
};