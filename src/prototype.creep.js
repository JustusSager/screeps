module.exports = function() {
    Creep.prototype.getResourceEnergy =
        function(speak) {
            var source_tombstone = this.room.find(FIND_TOMBSTONES, {
                filter: (structure) => {
                    return (structure.store[RESOURCE_ENERGY] > 0 &&
                            structure.room == this.room)
                }
            })[0];
            var source_ground = this.room.find(FIND_DROPPED_RESOURCES)[0];
            var source_container = this.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.structureType == STRUCTURE_CONTAINER ||
                            structure.structureType == STRUCTURE_STORAGE) &&
                            structure.store[RESOURCE_ENERGY] > this.store[RESOURCE_ENERGY].getFreeCapacity
                            )
                }
            });

            if (source_tombstone != null) {
                if (speak) {this.say('Tombstone');}
                if (this.withdraw(source_tombstone, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    this.moveTo(source_tombstone);
                }
            }
            else if (source_ground) {
                if (speak) {this.say('DroppedItem');}
                if (this.pickup(source_ground) == ERR_NOT_IN_RANGE) {
                    this.moveTo(source_ground);
                }
            }
            else if (source_container != null) {
                if(speak){this.say('Storage');}
                if (this.withdraw(source_container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    this.moveTo(source_container);
                }
            }
            else {
                var source_spawn = this.room.find(FIND_MY_SPAWNS)[0]; // find closest source
                if(speak) {this.say('Spawn');}
                // try to harvest energy, if the source is not in range move towards the source
                if (this.withdraw(source_spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    this.moveTo(source_spawn);
                }
            }
        }
};
