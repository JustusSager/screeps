module.exports = {
    run: function(creep, speak) {
        if (creep.pos != Game.flags[creep.memory.target].pos) {
            creep.moveTo(Game.flags[creep.memory.target].pos);
        }
        
        var links = Game.flags[creep.memory.target].pos.findInRange(FIND_STRUCTURES, 1, {
            filter: s => s.structureType == STRUCTURE_LINK
        });
        var towers = Game.flags[creep.memory.target].pos.findInRange(FIND_STRUCTURES, 1, {
            filter: s => s.structureType == STRUCTURE_TOWER && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        });
        var storages = Game.flags[creep.memory.target].pos.findInRange(FIND_STRUCTURES, 1, {
            filter: s => s.structureType == STRUCTURE_STORAGE
        });
        
        if (creep.store[RESOURCE_ENERGY] > 0) {
            if (towers.length > 0) {
                creep.transfer(towers[0], RESOURCE_ENERGY)
            } else if (storages.length > 0){
                creep.transfer(storages[0], RESOURCE_ENERGY)
            }
        } else {
            if (links.length > 0) {
                creep.withdraw(links[0], RESOURCE_ENERGY)
            } else if (storages.length > 0) {
                creep.withdraw(storages[0], RESOURCE_ENERGY)
            }
        }
    }
};