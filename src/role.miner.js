/*
Sucht einen Container, der neben der ihm zugewiesenen Energy Source steht, stellt sich auf den Container und baut die Energy Source ab.
*/
module.exports = {
    // a function to run the logic for this role
    run: function(creep, speak) {
        let source = Game.getObjectById(creep.memory.source_id);
        if (creep.pos.inRangeTo(source, 1)) {
            if (creep.memory.link_mining) {
                let link = source.pos.findInRange(FIND_STRUCTURES, 2, {
                    filter: s => s.structureType == STRUCTURE_LINK
                })[0];
                if (creep.store.getFreeCapacity([RESOURCE_ENERGY]) == 0) {
                    if (creep.transfer(link, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(link);
                    }
                }
                if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source);
                }
            }
            else {
                let container = source.pos.findInRange(FIND_STRUCTURES, 1, {
                    filter: s => s.structureType == STRUCTURE_CONTAINER
                })[0];
                
                if (creep.pos.isEqualTo(container)) {
                    creep.harvest(source);
                }
                else {
                    creep.moveTo(container.pos);
                }
            }
        }
        else {
            creep.moveTo(source);
        }
    }
};
