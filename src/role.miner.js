/*
Sucht einen Container, der neben der ihm zugewiesenen Energy Source steht, stellt sich auf den Container und baut die Energy Source ab.
*/
module.exports = {
    // a function to run the logic for this role
    run: function(creep, speak) {
        let source = Game.getObjectById(creep.memory.source_id);
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
};
