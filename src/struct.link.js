module.exports = {
    run: function() {
        for (let i = 0; i < Game.rooms.length; i++) {
            if (!Game.rooms[i].memory.storage_link) continue;

            let storage_link = Game.getObjectById(Game.rooms[i].memory.storage_link)

            links = _.filter(Game.structures, s => s.structureType == STRUCTURE_LINK && s.room == Game.rooms[i]);

            for (let j = 0; j < links.length; j++) {
                link = links[j];
                if (link.id == storage_link.id) continue;

                if (link.store.getFreeCapacity < link.store.getCapacity * 0.9) {
                    link.transferEnergy(storage_link)
                }
            }
        }
    }
};