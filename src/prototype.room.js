const config = require('config')

module.exports = function () {
    Room.prototype.updateConstructionSites = function () {
        this.memory.construction_sites = {
            'tower': this.find(FIND_CONSTRUCTION_SITES, {
                filter:
                    c => c.structureType === STRUCTURE_TOWER
            }),
            'energy_storage': this.find(FIND_CONSTRUCTION_SITES, {
                filter:
                    c => c.structureType === STRUCTURE_EXTENSION ||
                        c.structureType === STRUCTURE_CONTAINER ||
                        c.structureType === STRUCTURE_STORAGE ||
                        c.structureType === STRUCTURE_LINK
            })
        }
    }

    Room.prototype.updateMemory = function () {
        let rcl = this.controller.level;
        let roomStage = config.roomStage[this.name];
        if (this.memory.stage) {
            // Von unten nach oben lesen

            // Bedingungen abschluss Stage 6
            if (rcl >= 7 && roomStage >= 7 &&
                this.find(FIND_STRUCTURES, {filter: s => s.structureType === STRUCTURE_EXTENSION}).length >= 40 &&
                this.find(FIND_STRUCTURES, {filter: s => s.structureType === STRUCTURE_CONTAINER}).length >= 2 &&
                this.find(FIND_STRUCTURES, {filter: s => s.structureType === STRUCTURE_TOWER}).length >= 2 &&
                this.find(FIND_STRUCTURES, {filter: s => s.structureType === STRUCTURE_STORAGE}).length >= 1 &&
                false // TODO: Extractor, Lab, Terminal
            ) {
                this.memory.stage = 7;
            }
            // Bedingungen abschluss Stage 5
            else if (rcl >= 6 && roomStage >= 6 &&
                this.find(FIND_STRUCTURES, {filter: s => s.structureType === STRUCTURE_EXTENSION}).length >= 30 &&
                this.find(FIND_STRUCTURES, {filter: s => s.structureType === STRUCTURE_CONTAINER}).length >= 2 &&
                this.find(FIND_STRUCTURES, {filter: s => s.structureType === STRUCTURE_TOWER}).length >= 2 &&
                this.find(FIND_STRUCTURES, {filter: s => s.structureType === STRUCTURE_STORAGE}).length >= 1 &&
                false // TODO: Link
            ) {
                this.memory.stage = 6;
            }
            // Bedingungen abschluss Stage 4
            else if (rcl >= 5 && roomStage >= 5 &&
                this.find(FIND_STRUCTURES, {filter: s => s.structureType === STRUCTURE_EXTENSION}).length >= 20 &&
                this.find(FIND_STRUCTURES, {filter: s => s.structureType === STRUCTURE_CONTAINER}).length >= 2 &&
                this.find(FIND_STRUCTURES, {filter: s => s.structureType === STRUCTURE_TOWER}).length >= 1 &&
                this.find(FIND_STRUCTURES, {filter: s => s.structureType === STRUCTURE_STORAGE}).length >= 1
            ) {
                this.memory.stage = 5;
            }
            // Bedingungen abschluss Stage 3
            else if (rcl >= 4 && roomStage >= 4 &&
                this.find(FIND_STRUCTURES, {filter: s => s.structureType === STRUCTURE_EXTENSION}).length >= 10 &&
                this.find(FIND_STRUCTURES, {filter: s => s.structureType === STRUCTURE_CONTAINER}).length >= 2 &&
                this.find(FIND_STRUCTURES, {filter: s => s.structureType === STRUCTURE_TOWER}).length >= 1
            ) {
                // Stage 4 ist erreicht, wenn Tower vorhanden Extensions gebaut
                // Im besten Fall auch Warrior Creep und RemoteHarvester
                this.memory.stage = 4;
            }
            // Bedingungen abschluss Stage 2
            else if (rcl >= 3 && roomStage >= 3
                && this.find(FIND_STRUCTURES, {filter: s => s.structureType === STRUCTURE_EXTENSION}).length >= 5
                && this.find(FIND_STRUCTURES, {filter: s => s.structureType === STRUCTURE_CONTAINER}).length >= 2) {
                // Stage 3 ist erreicht, wenn die Extensions gebaut sind und die Container neben den Sources stehen,
                // und im besten Fall Miner und Transporter, das Energie sammeln übernehmen
                // und im besten Fall ein Straßennetzwerk steht
                this.memory.stage = 3;
            }
            // Bedingungen abschluss Stage 1
            else if (rcl >= 2 && roomStage >= 2) {
                // Stage 2 ist erreicht, wenn RCL 2 erreicht ist
                this.memory.stage = 2;
            }
            // Bedingungen abschluss Stage 0
            else if (rcl >= 1 && roomStage >= 1 &&
                this.find(FIND_MY_STRUCTURES, {filter: s => s.structureType === STRUCTURE_SPAWN})
            ) {
                this.memory.stage = 1;
            }
            // default Stage 0
            else {
                this.memory.stage = 0;
            }
        } else {
            this.memory.stage = 0;
        }

        this.memory.full_containers = this.find(FIND_MY_STRUCTURES, {
            filter: (s) =>
                s.structureType === STRUCTURE_CONTAINER
                && s.store.getUsedCapacity() > s.store.getCapacity() * 0.8
        });
    }
}
