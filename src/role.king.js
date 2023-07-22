module.exports = {
    run: function(creep, speak) {
        if (creep.pos != Game.flags[creep.memory.target].pos) {
            creep.moveTo(Game.flags[creep.memory.target].pos);
        }
        
        var links = Game.flags[creep.memory.target].pos.findInRange(FIND_STRUCTURES, 1, {
            filter: s => s.structureType == STRUCTURE_LINK
        });
        var towers = Game.flags[creep.memory.target].pos.findInRange(FIND_STRUCTURES, 1, {
            filter: s => s.structureType == STRUCTURE_TOWER && s.store.getFreeCapacity(RESOURCE_ENERGY) > 50
        });
        var storages = Game.flags[creep.memory.target].pos.findInRange(FIND_STRUCTURES, 1, {
            filter: s => s.structureType == STRUCTURE_STORAGE
        });
        var spawns = Game.flags[creep.memory.target].pos.findInRange(FIND_MY_SPAWNS, 1, {
            filter: s => s.store.getFreeCapacity(RESOURCE_ENERGY) > 50
        });
        
        if (creep.store[RESOURCE_ENERGY] > 0) {
            if (spawns.length > 0) {
                creep.transfer(spawns[0], RESOURCE_ENERGY)
            }
            else if (towers.length > 0) {
                creep.transfer(towers[0], RESOURCE_ENERGY)
            } 
            else if (storages.length > 0){
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