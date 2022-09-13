module.exports = {
    run: function() {
        var towers = _.filter(Game.structures, s => s.structureType == STRUCTURE_TOWER);
        
        if (towers.length > 0) {
            for (var i in towers) {
                if (towers[i]) {
                    var closest_hostile = towers[i].pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                    var closest_damaged_creep = towers[i].pos.findClosestByRange(FIND_MY_CREEPS, { filter: (creep) => {return ( creep.hits < creep.hitsMax );}})
                    var closest_damaged_structure = towers[i].pos.findClosestByRange(FIND_STRUCTURES, {filter: (s) => s.hits < s.hitsMax});
                    
                    if(closest_hostile) {
                        console.log('Warning! Hostile spotted at' + towers[i].room.name);
                        towers[i].attack(closest_hostile);
                    }
                    else if (closest_damaged_creep) {
                        towers[i].heal(closest_damaged_creep);
                    }
                    else if (closest_damaged_structure) {
                        if(towers[i].energy > 750) {
                            towers[i].repair(closest_damaged_structure);
                        }
                    }
                }
            }
        }
    }
};