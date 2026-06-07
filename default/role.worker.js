const config = require("config");

const { gen_task_from_dict } = require('./manager.tasks')

Creep.prototype.work = function() {
    // Aufgabe aus dem Speicher holen
    let task;
    try {
        task = gen_task_from_dict(this.memory.task);
    } catch {
        console.log("Something went wrong with creeps " + this.name + " task " + JSON.stringify(this.memory.task))
        this.memory.task = undefined;
        return -100;
    }

    // Prüfen ob die Aufgabe gültig ist
    if (!task.is_valid()) {
        this.memory.task = undefined;
        return -101;
    }
    if (!task.is_valid_for_creep(this)) {
        this.memory.task = undefined;
        return -102;
    }

    // Falls die Aufgabe in einem anderen Raum ist, in die richtung gehen
    if (task.target.room != this.room) {
        var exit_direction = this.room.findExitTo(task.target);
        return this.moveTo(this.pos.findClosestByPath(exit_direction));
    }
    // Die Ränder des Raumes frei halten, damit man nicht zwischen Raum hin und her springt
    if (this.pos.x == 0) return this.move(RIGHT);
    if (this.pos.x == 49) return this.move(LEFT);
    if (this.pos.y == 0) return this.move(BOTTOM);
    if (this.pos.y == 49) return this.move(TOP);
    
    // Falls man in Reichweite des Ziels ist -> Aufgabe durchführen
    if (this.pos.inRangeTo(task.target, task.range)) {
        return task.do(this)
    } 
    // ansonsten zum Ziel laufen
    else {
        return this.moveTo(task.target);
    }
}

module.exports = {
    run: function (creep) {
        code = creep.work();
        if (code != OK) {
            switch(code) {
                case ERR_TIRED:
                    creep.say('💤');
                    break;
                case ERR_NOT_ENOUGH_ENERGY:
                    creep.say('🪫');
                    creep.memory.task = undefined
                    break;
                case ERR_NO_PATH:
                    creep.say('⏹️');
                    creep.memory.task = undefined
                    break;
                case -101:
                    creep.say('InvTask');
                    break;
                case -102:
                    creep.say('InvTarget');
                    break;
                default:
                    creep.say(code);
                    break;
            }
        }
    }
}
