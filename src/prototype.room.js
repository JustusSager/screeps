const config = require('config')

module.exports = function () {
    Room.prototype.updateConstructionSites = function () {
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
            })
        }
    }

    Room.prototype.updateMemory = function () {
        if (config.roomStage[this.name]) {
            this.memory.stage = config.roomStage[this.name];
        } else {
            this.memory.stage = 1;
        }

        this.memory.full_containers = this.find(FIND_MY_STRUCTURES, {
            filter: (s) =>
                s.structureType === STRUCTURE_CONTAINER
                && s.store.getUsedCapacity() > s.store.getCapacity() * 0.8
        });
    }
}
