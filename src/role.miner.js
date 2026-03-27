/*
Sucht einen Container, der neben der ihm zugewiesenen Energy Source steht, stellt sich auf den Container und baut die Energy Source ab.
*/
module.exports = {
    // a function to run the logic for this role
    run: function(creep, speak) {
        let source = Game.getObjectById(creep.memory.source_id);
        let links = source.pos.findInRange(FIND_STRUCTURES, 2, {
            filter: s => s.structureType == STRUCTURE_LINK
        });
        let link_mining = (links.length > 0) && (creep.store.getCapacity() > 0);
        if (link_mining) {
            if (creep.store.getFreeCapacity() == 0) {
                if (creep.transfer(links[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(links[0]);
                }
            }
            if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
            }
        }
        else {
            let containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
                filter: s => s.structureType == STRUCTURE_CONTAINER
            });
            if (containers.length > 0 && !creep.pos.isEqualTo(containers[0])) {
                creep.moveTo(container.pos);
            } else {
                if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source);
                }
            }
        }
    }
};
