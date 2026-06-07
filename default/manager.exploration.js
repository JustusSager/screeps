const { ROOM_STATUS_TAKEN } = require("./constants");

const map = [[]]

class ExplorationManager {
    constructor() {
        this.worldmap = Memory.worldmap;
        this.exploration_queu = [];
    }

    find_unexplored_neighbors() {
        for (const room_name of Object.keys(this.worldmap)) {
            const room = this.worldmap[room_name]
            if (room.ownership.type == ROOM_STATUS_TAKEN && room.ownership.by == 'Amnitor') {
                for (const neighbor of Object.values(room.exits)) {
                    if (!this.worldmap[neighbor] && !this.exploration_queu.includes(neighbor)) {
                        this.exploration_queu.push(neighbor)
                    }
                }
            }
        }
        Memory.exploration_queu = this.exploration_queu;
        return this.exploration_queu;
    }

}

module.exports = {
    ExplorationManager
}