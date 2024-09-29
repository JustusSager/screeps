const config = require('config');

module.exports = function () {
    StructureTower.prototype.run = function () {
        let target = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (target) {
            this.attack(target);
        } else if (this.store[RESOURCE_ENERGY] > 750) {
            target = this.pos.findClosestByRange(FIND_STRUCTURES, {
                filter:
                    s => s.hits < s.hitsMax &&
                        s.structureType !== STRUCTURE_WALL && s.structureType !== STRUCTURE_RAMPART
                        && this.pos.inRangeTo(s, 8)
            }) // TODO: fixe werte durch config ersetzen
            if (target) {
                this.repair(target);
            }
        }
    }
}