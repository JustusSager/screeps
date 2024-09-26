module.exports = function () {
    Room.prototype.updateConstructionSites = function () {
        this.memory.constructionSites = {
            'tower': this.find(FIND_CONSTRUCTION_SITES, {filter:
                        c => c.structureType === STRUCTURE_TOWER
            }),
            'energy_storage': this.find(FIND_CONSTRUCTION_SITES, {filter:
                        c => c.structureType === STRUCTURE_EXTENSION ||
                            c.structureType === STRUCTURE_CONTAINER ||
                            c.structureType === STRUCTURE_STORAGE ||
                            c.structureType === STRUCTURE_LINK
            })
        }
    }
}