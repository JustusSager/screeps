require('creep-tasks');

module.exports = {
    run: function () {
        let creeps = _.filter(Game.creeps, c => c.memory.role == 'generic' );

        for (var i in creeps) {
            var creep = creeps[i];
            if (!creep.memory.task || creep.memory.task == {}) {
                creep.memory.task = {};
                if (creep.store[RESOURCE_ENERGY] > 0) {
                    if (creep.room.memory.construction_sites && creep.room.memory.construction_sites.length > 0) {
                        creep.memory.task['name'] = "build";
                        creep.memory.task['target'] = creep.room.memory.construction_sites[0].id;
                        creep.memory.task['range'] = 3;
                    }
                    else {
                        creep.memory.task['name'] = "upgrade";
                        creep.memory.task['target'] = creep.room.controller.id;
                        creep.memory.task['range'] = 3;
                    }
                } 
                else {
                    if (creep.find_dropped_rescources()) {
                        creep.memory.task['name'] = "pickup";
                        creep.memory.task['target'] = creep.find_dropped_rescources().id;
                    }
                    else if (creep.find_energy(false)) {
                        creep.memory.task['name'] = "withdraw";
                        creep.memory.task['target'] = creep.find_energy(false).id;
                        creep.memory.task['resource'] = RESOURCE_ENERGY;
                    }
                    else {
                        creep.memory.task['name'] = "harvest";
                        creep.memory.task['target'] = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE).id;
                    }
                }
                
            }
            creep.say(creep.work());
        }
    }
}