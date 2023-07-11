module.exports = {
    run: function() {
        for (let i in Game.rooms) {
            if (!Game.rooms[i].memory.storage_link) continue;

            let storage_link = Game.getObjectById(Game.rooms[i].memory.storage_link);

            for (let j in Game.rooms[i].memory.source_links) {
                let link = Game.getObjectById(Game.rooms[i].memory.source_links[j]);
                if (link.id == storage_link.id) continue;

                if (link.store.getFreeCapacity(RESOURCE_ENERGY) < 50) {
                    link.transferEnergy(storage_link)
                }
            }
        }
    }
};