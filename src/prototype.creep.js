module.exports = function() {
    Creep.prototype.find_tombstones = 
    function() {
        return this.pos.findClosestByPath(FIND_TOMBSTONES, {
            filter: (structure) => {
                return structure.store[RESOURCE_ENERGY] > 0 && structure.room == this.room;
            }
        });
    }
        
    Creep.prototype.find_dropped_rescources = 
    function() {
        // nochmal anschauen was hier passieren muss!!!
        return this.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
            filter: (r) => {
                return r.resourceType == RESOURCE_ENERGY && r.amount > this.store.getFreeCapacity([RESOURCE_ENERGY]);
            }
        });
    }
        
    Creep.prototype.find_extensions_not_full = 
    function() {
        return this.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return  structure.structureType == STRUCTURE_EXTENSION && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        });
    }
    
    Creep.prototype.find_towers_not_full = 
    function() {
        return this.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return  structure.structureType == STRUCTURE_TOWER && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        });
    }
    
    Creep.prototype.find_container_not_empty = 
    function() {
        return this.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return  structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 0;
            }
        });
    }

    Creep.prototype.find_container_not_full = 
    function() {
        return this.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return  structure.structureType == STRUCTURE_CONTAINER && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        });
    }
        
    Creep.prototype.find_storage_not_empty = 
    function() {
        return this.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return  structure.structureType == STRUCTURE_STORAGE && structure.store[RESOURCE_ENERGY] > 0;
            }
        });
    }
        
    Creep.prototype.find_storage_not_full = 
    function() {
        return this.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_STORAGE && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        });
    }
    
    Creep.prototype.find_container_storage_not_empty = 
    function() {
        return this.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return ((structure.structureType == STRUCTURE_CONTAINER ||
                        structure.structureType == STRUCTURE_STORAGE) &&
                        structure.store[RESOURCE_ENERGY] > this.store.getFreeCapacity([RESOURCE_ENERGY]) // ???
                        )
            }
        });
    }
    
    Creep.prototype.getResourceEnergy =
    function(speak) {
        var source_tombstone = this.find_tombstones();
        if (source_tombstone) {
            if (speak) {this.say('Tombstone');}
            if (this.withdraw(source_tombstone, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.moveTo(source_tombstone);
            }
            return true;
        }
        var source_ground = this.find_dropped_rescources();
        if (source_ground) {
            if (speak) {this.say('DroppedItem');}
            if (this.pickup(source_ground) == ERR_NOT_IN_RANGE) {
                this.moveTo(source_ground);
            }
            return true;
        }
        var source_container = this.find_container_storage_not_empty();
        if (source_container != null) {
            if(speak){this.say('Storage');}
            if (this.withdraw(source_container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.moveTo(source_container);
            }
            return true;
        }
        var source_spawn = this.room.find(FIND_MY_SPAWNS, {
            filter: (structure) => {return structure.store[RESOURCE_ENERGY] > 200}
        })[0]; // find closest source
    
        if(speak) {this.say('Spawn');}
        // try to harvest energy, if the source is not in range move towards the source
        if (this.withdraw(source_spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.moveTo(source_spawn);
        }
        return false;
    }

    Creep.prototype.storeResourceEnergy =
    function(speak) {
        var target_extension = this.find_extensions_not_full();
        if (target_extension) {
            if (this.transfer(target_extension, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.moveTo(target_extension);
            }
            return;
        }
        var target_storage = this.find_storage_not_full();
        if (target_storage) {
            if (this.transfer(target_storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.moveTo(target_storage);
            }
            return;
        }
        var target_container = this.find_container_not_full();
        if (target_container) {
            if (this.transfer(target_container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.moveTo(target_container);
            }
            return;
        }
        var target_spawn = this.room.find(FIND_MY_SPAWNS, {
            filter: (structure) => {return structure.store[RESOURCE_ENERGY] > 200}
        });
        if (target_spawn > 0) {
            if (this.transfer(source_spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.moveTo(source_spawn);
            }
            return;
        }
    }
};
