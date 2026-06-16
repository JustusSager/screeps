module.exports = function () {

    Creep.prototype.moveToRoom = function(roomName) {
        // Falls die Aufgabe in einem anderen Raum ist, in die richtung gehen
        if (roomName != this.room.name) {
            const exit_direction = this.room.findExitTo(roomName);
            if (exit_direction == ERR_NO_PATH || exit_direction == ERR_INVALID_ARGS) return exit_direction
            const closest_exit = this.pos.findClosestByPath(exit_direction)
            if (!closest_exit) return ERR_NO_PATH
            return this.moveTo(closest_exit);
        }
        // Die Ränder des Raumes frei halten, damit man nicht zwischen Raum hin und her springt
        if (this.pos.x == 0) return this.move(RIGHT);
        if (this.pos.x == 49) return this.move(LEFT);
        if (this.pos.y == 0) return this.move(BOTTOM);
        if (this.pos.y == 49) return this.move(TOP);
        return
    }
}