var config = require('config')

module.exports = {
    // a function to run the logic for this role
    run: function(creep, speak) {
        if(creep.memory.role == 'defender' || creep.memory.role == 'claimer') {
            return;
        }
        if(creep.room.name == creep.memory.room_home && creep.room.memory.construction_sites.length < config.basebuilding.maxConstructionSites && creep.pos.lookFor(LOOK_STRUCTURES).length == 0) {
            creep.pos.createConstructionSite(STRUCTURE_ROAD);
            creep.room.memory.num_construction_sites = creep.room.find(FIND_CONSTRUCTION_SITES).length;
            return;
        }
    }
};
