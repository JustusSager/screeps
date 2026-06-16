
import { gen_task_from_dict } from './manager.tasks'

function work(creep: Creep): number {
    // Aufgabe aus dem Speicher holen
    if (!creep.memory.task) return -103

    let task;
    try {
        task = gen_task_from_dict(creep.memory.task);
    } catch {
        console.log("Something went wrong with creeps " + creep.name + " task " + JSON.stringify(creep.memory.task))
        creep.memory.task = undefined;
        return -100;
    }

    // Prüfen ob die Aufgabe gültig ist
    if (!task.is_valid()) {
        creep.memory.task = undefined;
        return -101;
    }
    if (!task.is_valid_for_creep(creep)) {
        creep.memory.task = undefined;
        return -102;
    }

    if (creep.moveToRoom(task.target.pos.roomName) != undefined) return OK
    
    // Falls man in Reichweite des Ziels ist -> Aufgabe durchführen
    if (creep.pos.inRangeTo(task.target, task.range)) {
        return task.do(creep)
    } 
    // ansonsten zum Ziel laufen
    else {
        return creep.moveTo(task.target);
    }
}

let roleWorker: {
    /**
     * @param {Creep} creep
     */
    run(creep: Creep): void
}

export default roleWorker = {
    run: function (creep: Creep) {
        let code = work(creep);
        if (code != OK) {
            switch(code) {
                case ERR_TIRED:
                    if (Memory.debug.creepSaysErrorCode) creep.say('💤')
                    break
                case ERR_NOT_ENOUGH_ENERGY:
                    if (Memory.debug.creepSaysErrorCode) creep.say('🪫')
                    creep.memory.task = undefined
                    break
                case ERR_NO_PATH:
                    if (Memory.debug.creepSaysErrorCode) creep.say('⏹️');
                    creep.memory.task = undefined
                    break
                case -101:
                    if (Memory.debug.creepSaysErrorCode) creep.say('InvTask')
                    creep.memory.task = undefined
                    break
                case -102:
                    if (Memory.debug.creepSaysErrorCode) creep.say('InvTarget')
                    creep.memory.task = undefined
                    break
                case -103:
                    if (Memory.debug.creepSaysErrorCode) creep.memory.task = undefined
                    creep.say('TaskUndef')
                    break
                default:
                    if (Memory.debug.creepSaysErrorCode) creep.say(code?.toString());
                    break;
            }
        }
    }
}