
module.exports = function() {
    Flag.prototype.memory_structures_in_range = 
    function() {
        this.memory.structureSpawns = [];
        let structureSpawns = this.pos.findInRange(FIND_MY_SPAWNS, 1);
        if (structureSpawns.length > 0) {
            for (let spawn of structureSpawns) {
                this.memory.structureSpawns.push(spawn.id);
            }
        }

        this.memory.structureStorages = [];
        let structureStorages = this.pos.findInRange(FIND_MY_STRUCTURES, 1, {
            filter: s => s.structureType == STRUCTURE_STORAGE
        });
        if (structureStorages.length > 0) {
            for (let storage of structureStorages) {
                this.memory.structureStorages.push(storage.id);
            }
        }
        
        this.memory.structureLinks = [];
        let structureLinks = this.pos.findInRange(FIND_MY_STRUCTURES, 1, {
            filter: s => s.structureType == STRUCTURE_LINK
        });
        if (structureLinks.length > 0) {
            for (let link of structureLinks) {
                this.memory.structureLinks.push(link.id);
            }
        }

        this.memory.structureTerminals = [];
        let structureTerminals = this.pos.findInRange(FIND_MY_STRUCTURES, 1, {
            filter: s => s.structureType == STRUCTURE_TERMINAL
        });
        if (structureTerminals.length > 0) {
            for (let terminal of structureTerminals) {
                this.memory.structureTerminals.push(terminal.id);
            }
        }

        this.memory.structureTowers = [];
        let structureTowers = this.pos.findInRange(FIND_MY_STRUCTURES, 1, {
            filter: s => s.structureType == STRUCTURE_TOWER
        });
        if (structureTowers.length > 0) {
            for (let tower of structureTowers) {
                this.memory.structureTowers.push(tower.id);
            }
        }
    }

    Flag.prototype.handle_memory = 
    function() {
        if (this.name.includes('BunkerFlag') && (Game.time % 10 == 3 || !this.memory.structureSpawns || !this.memory.structureStorages || !this.memory.structureLinks || !this.memory.structureTerminals || this.memory.structureTowers)) {
            this.memory_structures_in_range();
        }
    }
}
