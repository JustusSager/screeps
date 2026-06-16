import _ from 'lodash';

// CONSTANTS --------------------------------------------------------------------------------------
const REPAIR_HITS_MAX_MULTIPLIER = 0.9

// Beschaffen
const TASKPRIO_PICKUP = 10
const TASKPRIO_WITHDRAW_CONTAINER_NEAR_SOURCE = 9
const TASKPRIO_WITHDRAW_STORAGE = 8
const TASKPRIO_WITHDRAW_CONTAINER = 7
const TASKPRIO_WITHDRAW = 3
const TASKPRIO_HARVEST = 1
// Benutzen
const TASKPRIO_UPGRADE_CRIT = 10
const TASKPRIO_REPAIR = 9
const TASKPRIO_BUILD = 8
const TASKPRIO_UPGRADE = 7
const TASKPRIO_TRANSFER_CONTAINER_NEAR_SPAWN = 6
const TASKPRIO_TRANSFER_CONTAINER_NEAR_CONTROLLER = 5
const TASKPRIO_TRANSFER_TOWER = 4
const TASKPRIO_TRANSFER_SPAWN_EXTENSIONS = 3
const TASKPRIO_TRANSFER_STORAGE = 2
const TASKPRIO_TRANSFER = 1


// ------------------------------------------------------------------------------------------------


export function gen_task_from_dict(creepTask: CreepTask) {
    switch (creepTask.type) {
        case 'upgrade':
            return new TaskUpgrade(Game.getObjectById(creepTask.target_id) as StructureController)
        case "harvest":
            return new TaskHarvest(Game.getObjectById(creepTask.target_id) as Source)
        case "build":
            return new TaskBuild(Game.getObjectById(creepTask.target_id) as ConstructionSite)
        case "repair":
            return new TaskRepair(Game.getObjectById(creepTask.target_id) as Structure)
        case "withdraw":
            return new TaskWithdraw(Game.getObjectById(creepTask.target_id) as AnyStoreStructure)
        case "pickup":
            return new TaskPickup(Game.getObjectById(creepTask.target_id) as Resource)
        case "transfer":
            return new TaskTransfer(Game.getObjectById(creepTask.target_id) as AnyStoreStructure)
    }
}

export class TaskManager {
    tasks: Task[]

    constructor() {
        this.tasks = []
    }

    find_open_tasks(room: Room) {
        // Upgrade
        if (room.controller) this.tasks.push(new TaskUpgrade(room.controller))
        
        // Repair
        const repair_sites = room.find(FIND_STRUCTURES, {
            filter: (s) => s.hits < (s.hitsMax * REPAIR_HITS_MAX_MULTIPLIER) && s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART
        })
        for (const structure of repair_sites) {
            this.tasks.push(new TaskRepair(structure));
        }

        // Build
        const construction_sites = room.find(FIND_CONSTRUCTION_SITES)
        for (const construction_site of construction_sites) {
            this.tasks.push(new TaskBuild(construction_site));
        }

        // Pickup
        // TODO aktuell nur RESOURCE_ENERGY
        const dropped_resources = room.find(FIND_DROPPED_RESOURCES, {filter: (r) => r.resourceType == RESOURCE_ENERGY});
        for (const resource of dropped_resources) {
            this.tasks.push(new TaskPickup(resource));
        }

        // Withdraw
        const withdraw_containers_near_source = room.find(FIND_STRUCTURES, {filter: 
            (s) => (s.structureType == STRUCTURE_CONTAINER) && s.store[RESOURCE_ENERGY] > 0 && s.pos.findInRange(FIND_SOURCES, 1).length > 0
        })
        for (const structure of withdraw_containers_near_source) {
            this.tasks.push(new TaskWithdraw(
                structure as StructureContainer, 
                TASKPRIO_WITHDRAW_CONTAINER_NEAR_SOURCE
            ));
        }
        const withdraw_storages = room.find(FIND_STRUCTURES, {filter: (s) => (s.structureType == STRUCTURE_STORAGE) && s.store[RESOURCE_ENERGY] > 0})
        for (const structure of withdraw_storages) {
            this.tasks.push(new TaskWithdraw(structure as StructureStorage, TASKPRIO_WITHDRAW_STORAGE));
        }

        // Transfer
        const transfer_towers = room.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_TOWER && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0});
        for (const structure of transfer_towers) {
            this.tasks.push(new TaskTransfer(structure as StructureTower, TASKPRIO_TRANSFER_TOWER));
        }
        const transfer_spawn = room.find(FIND_MY_STRUCTURES, {filter: (s) => (s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION) && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0});
        for (const structure of transfer_spawn) {
            this.tasks.push(new TaskTransfer(structure as StructureSpawn | StructureExtension, TASKPRIO_TRANSFER_SPAWN_EXTENSIONS));
        }
        const transfer_storage = room.find(FIND_MY_STRUCTURES, {filter: (s) => (s.structureType == STRUCTURE_STORAGE) && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0});
        for (const structure of transfer_storage) {
            this.tasks.push(new TaskTransfer(structure as StructureStorage, TASKPRIO_TRANSFER_STORAGE));
        }
        const spawner_pos = room.memory.spawner_base_centroid_pos
        if (spawner_pos != undefined) {
            const transfer_container_near_spawner = room.find(FIND_STRUCTURES, {filter: 
                s => s.structureType === STRUCTURE_CONTAINER && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
                s.pos.inRangeTo(spawner_pos.x, spawner_pos.y, 2)
            })
            for (const structure of transfer_container_near_spawner) {
                this.tasks.push(new TaskTransfer(structure as StructureContainer, TASKPRIO_TRANSFER_CONTAINER_NEAR_SPAWN));
            }
        }
        const controller = room.controller
        if (controller != undefined) {
            const transfer_container_near_controller = room.find(FIND_STRUCTURES, {filter: 
                s => s.structureType === STRUCTURE_CONTAINER && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
                s.pos.inRangeTo(controller.pos.x, controller.pos.y, 3)
            })
            for (const structure of transfer_container_near_controller) {
                this.tasks.push(new TaskTransfer(structure as StructureContainer, TASKPRIO_TRANSFER_CONTAINER_NEAR_CONTROLLER));
            }
        }

        // filter for only valid
        this.tasks = this.tasks.filter(t => t.is_valid())

        // order by priority
        this.tasks.sort((a, b) => b.priority - a.priority)
    }

    create_stats_assigned_tasks() {
        return [
            ['build', _.sum(_.filter(this.tasks, t => t.type === 'build').map(t => t.work_assigned)), _.sum(_.filter(this.tasks, t => t.type === 'build').map(t => t.work_left))],
            ['harvest', _.sum(_.filter(this.tasks, t => t.type === 'harvest').map(t => t.work_assigned)), _.sum(_.filter(this.tasks, t => t.type === 'harvest').map(t => t.work_left))],
            ['pickup', _.sum(_.filter(this.tasks, t => t.type === 'pickup').map(t => t.work_assigned)), _.sum(_.filter(this.tasks, t => t.type === 'pickup').map(t => t.work_left))],
            ['repair', _.sum(_.filter(this.tasks, t => t.type === 'repair').map(t => t.work_assigned)), _.sum(_.filter(this.tasks, t => t.type === 'repair').map(t => t.work_left))],
            ['transfer', _.sum(_.filter(this.tasks, t => t.type === 'transfer').map(t => t.work_assigned)), _.sum(_.filter(this.tasks, t => t.type === 'transfer').map(t => t.work_left))],
            ['upgrade', _.sum(_.filter(this.tasks, t => t.type === 'upgrade').map(t => t.work_assigned)), _.sum(_.filter(this.tasks, t => t.type === 'upgrade').map(t => t.work_left))],
            ['withdraw', _.sum(_.filter(this.tasks, t => t.type === 'withdraw').map(t => t.work_assigned)), _.sum(_.filter(this.tasks, t => t.type === 'withdraw').map(t => t.work_left))],
        ]
    }

    assign_task(creep: Creep, sort_by_distance=false) {
        let valid_tasks = this.tasks.filter(t => t.work_left > t.work_assigned && t.is_valid_for_creep(creep))
        if (sort_by_distance) {
            valid_tasks.sort(
                (a, b) => ((a.target.pos.x - creep.pos.x) + (a.target.pos.y - creep.pos.y)) - ((b.target.pos.x - creep.pos.x) + (b.target.pos.y - creep.pos.y))
            )
        }
        if (valid_tasks.length > 0) {
            valid_tasks[0].assign_to_creep(creep);
        }
        this.tasks = this.tasks.filter(t => t.is_valid())
    }

    visulize() {
        for (const t of this.tasks) {
            const rv = t.target.room?.visual
            if (rv == undefined) return 

            let color = ''
            switch (t.type) {
                case 'transfer':
                    color = '#ff0f0f'
                    break;
                case 'withdraw':
                    color = '#0fff0f'
                    break;
                case 'build':
                case 'repair':
                    color = '#0f0fff'
                    break;
                default:
                    color = '#ffffff'
                    break;
            }
            rv.circle_with_text(t.priority.toString(), t.target.pos.x, t.target.pos.y, 0.4, color, 0.6)
        }
    }
}

interface Task {
    type: TaskType
    range: number
    resource: ResourceConstant
    target: TaskTargetType
    work_left: number
    work_assigned: number
    priority: number

    is_valid(): boolean

    is_valid_for_creep(creep: Creep): boolean

    assign_to_creep(creep: Creep): void

    do(creep: Creep): void

    to_dict(): CreepTask

    toString(): string
}

class TaskUpgrade implements Task {
    type: 'upgrade' = 'upgrade'
    range: 3 = 3
    resource: RESOURCE_ENERGY = RESOURCE_ENERGY
    target: StructureController
    work_left: number
    work_assigned: number
    priority: number
    

    constructor(controller: StructureController) {
        let work_assigned = 0;
        for (const creep of _.filter(Game.creeps, c => c.memory.task != undefined && c.memory.task.type == 'upgrade' && c.memory.task.target_id == controller.id)) {
            work_assigned += creep.store[RESOURCE_ENERGY];
        }
        this.target = controller
        this.work_left = controller.progressTotal - controller.progress
        this.work_assigned = work_assigned
        this.priority = _.some(Game.creeps, c => c.memory.task != undefined && c.memory.task.type == 'upgrade') ? TASKPRIO_UPGRADE : TASKPRIO_UPGRADE_CRIT
    }

    is_valid() {
        return this.work_left > 0;
    }

    is_valid_for_creep(creep: Creep) {
        return (
            creep.getActiveBodyparts(WORK) > 0 &&
            creep.store[RESOURCE_ENERGY] > 0
        )
    }

    assign_to_creep(creep: Creep) {
        console.log("Assigning " + this.toString() + " to creep " + creep.name)
        creep.memory.task = this.to_dict()
        new RoomVisual(creep.room.name).line(creep.pos.x, creep.pos.y, this.target.pos.x, this.target.pos.y, {color: '#ffffff', opacity: 1})
        this.work_left -= creep.store[RESOURCE_ENERGY];
        this.priority = 3;
    }

    do(creep: Creep) {
        if (Memory.debug.creepSaysTask) creep.say("🆙");
        return creep.upgradeController(this.target);
    }

    to_dict(): CreepTask {
        return {
            type: this.type,
            target_id: this.target.id,
            target_pos: this.target.pos,
            range: this.range,
            resource: this.resource
        }
    }

    toString(): string {
        return (`Task ${this.type} (${this.target.pos.x}, ${this.target.pos.y}, ${this.target.pos.roomName}) - ${this.work_assigned}/${this.work_left}`)
    }
}

class TaskHarvest implements Task {
    type: 'upgrade' = 'upgrade'
    range: 1 = 1
    resource: RESOURCE_ENERGY = RESOURCE_ENERGY
    target: Source
    work_left: number
    work_assigned: number
    priority: number

    constructor(source: Source) {
        let work_assigned = 0;
        for (const creep of _.filter(Game.creeps, c => c.memory.task != undefined && c.memory.task.type == 'harvest' && c.memory.task.target_id == source.id)) {
            work_assigned += creep.store.getFreeCapacity();
        }
        this.target = source
        this.work_left = source.energy
        this.work_assigned = work_assigned
        this.priority = TASKPRIO_HARVEST
    }

    is_valid() {
        return this.work_left > 0 && this.target.energy > 0;
    }

    is_valid_for_creep(creep: Creep) {
        return (
            creep.getActiveBodyparts(WORK) > 0 &&
            creep.store.getFreeCapacity() > 0
        )
    }

    assign_to_creep(creep: Creep) {
        console.log("Assigning " + this.toString() + " to creep " + creep.name)
        creep.memory.task = this.to_dict()
        new RoomVisual(creep.room.name).line(creep.pos.x, creep.pos.y, this.target.pos.x, this.target.pos.y, {color: '#ffffff', opacity: 1})
        this.work_left -= creep.store.getFreeCapacity();
    }

    do(creep: Creep) {
        if (Memory.debug.creepSaysTask) creep.say("⛏️")
        return creep.harvest(this.target);
    }

    to_dict(): CreepTask {
        return {
            type: this.type,
            target_id: this.target.id,
            target_pos: this.target.pos,
            range: this.range,
            resource: this.resource
        }
    }

    toString(): string {
        return (`Task ${this.type} (${this.target.pos.x}, ${this.target.pos.y}, ${this.target.pos.roomName}) - ${this.work_assigned}/${this.work_left}`)
    }
}

class TaskBuild implements Task {
    type: 'build' = 'build'
    range: 3 = 3
    resource: RESOURCE_ENERGY = RESOURCE_ENERGY
    target: ConstructionSite
    work_left: number
    work_assigned: number
    priority: number

    constructor(construction_site: ConstructionSite) {
        let work_assigned = 0;
        for (const creep of _.filter(Game.creeps, c => c.memory.task != undefined && c.memory.task.type == 'build' && c.memory.task.target_id == construction_site.id)) {
            work_assigned += creep.store[RESOURCE_ENERGY];
        }
        this.target = construction_site
        this.work_left = construction_site.progressTotal - construction_site.progress
        this.work_assigned = work_assigned
        this.priority = TASKPRIO_BUILD
    }

    is_valid() {
        return this.work_left > 0
    }

    is_valid_for_creep(creep: Creep) {
        return (
            creep.getActiveBodyparts(WORK) > 0 &&
            creep.store[RESOURCE_ENERGY] > 0
        )
    }

    assign_to_creep(creep: Creep) {
        console.log("Assigning " + this.toString() + " to creep " + creep.name)
        creep.memory.task = this.to_dict()
        new RoomVisual(creep.room.name).line(creep.pos.x, creep.pos.y, this.target.pos.x, this.target.pos.y, {color: '#ffffff', opacity: 1})
        this.work_left -= creep.store[RESOURCE_ENERGY];
    }

    do(creep: Creep) {
        if (Memory.debug.creepSaysTask) creep.say("🔨");
        return creep.build(this.target);
    }

    to_dict(): CreepTask {
        return {
            type: this.type,
            target_id: this.target.id,
            target_pos: this.target.pos,
            range: this.range,
            resource: this.resource
        }
    }

    toString(): string {
        return (`Task ${this.type} (${this.target.pos.x}, ${this.target.pos.y}, ${this.target.pos.roomName}) - ${this.work_assigned}/${this.work_left}`)
    }
}

class TaskRepair implements Task {
    type: 'repair' = 'repair'
    range: 3 = 3
    resource: RESOURCE_ENERGY = RESOURCE_ENERGY
    target: Structure
    work_left: number
    work_assigned: number
    priority: number
    constructor(structure: Structure) {
        let work_assigned = 0;
        for (const creep of _.filter(Game.creeps, c => c.memory.task != undefined && c.memory.task.type == 'repair' && c.memory.task.target_id == structure.id)) {
            work_assigned += creep.store[RESOURCE_ENERGY];
        }
        this.target = structure
        this.work_left = structure.hitsMax - structure.hits
        this.work_assigned = work_assigned
        this.priority = TASKPRIO_REPAIR
    }

    is_valid() {
        return this.work_left > 0;
    }

    is_valid_for_creep(creep: Creep) {
        return (
            creep.getActiveBodyparts(WORK) > 0 &&
            creep.store[RESOURCE_ENERGY] > 0
        )
    }

    assign_to_creep(creep: Creep) {
        console.log("Assigning " + this.toString() + " to creep " + creep.name)
        creep.memory.task = this.to_dict()
        new RoomVisual(creep.room.name).line(creep.pos.x, creep.pos.y, this.target.pos.x, this.target.pos.y, {color: '#ffffff', opacity: 1})
        this.work_left -= creep.store[RESOURCE_ENERGY];
    }

    do(creep: Creep) {
        if (Memory.debug.creepSaysTask) creep.say("🔧");
        return creep.repair(this.target);
    }

    to_dict(): CreepTask {
        return {
            type: this.type,
            target_id: this.target.id,
            target_pos: this.target.pos,
            range: this.range,
            resource: this.resource
        }
    }

    toString(): string {
        return (`Task ${this.type} (${this.target.pos.x}, ${this.target.pos.y}, ${this.target.pos.roomName}) - ${this.work_assigned}/${this.work_left}`)
    }
}

class TaskWithdraw implements Task {
    type: 'withdraw' = 'withdraw'
    range: 1 = 1
    resource: ResourceConstant
    target: AnyStoreStructure
    work_left: number
    work_assigned: number
    priority: number
    constructor(structure: AnyStoreStructure, priority=TASKPRIO_WITHDRAW, resource=RESOURCE_ENERGY) {
        let work_assigned = 0;
        for (const creep of _.filter(Game.creeps, c => c.memory.task != undefined && c.memory.task.type == 'withdraw' && c.memory.task.target_id == structure.id)) {
            work_assigned += creep.store.getFreeCapacity();
        }
        this.resource = resource
        this.target = structure
        this.work_left = structure.store[resource]
        this.work_assigned = work_assigned
        this.priority = priority
    }

    is_valid() {
        return this.work_left > 0 && this.target.store[this.resource] > 0;
    }

    is_valid_for_creep(creep: Creep) {
        return (
            creep.getActiveBodyparts(CARRY) > 0 &&
            creep.store.getFreeCapacity(this.resource) > 0
        )
    }

    assign_to_creep(creep: Creep) {
        console.log("Assigning " + this.toString() + " to creep " + creep.name)
        creep.memory.task = this.to_dict()
        new RoomVisual(creep.room.name).line(creep.pos.x, creep.pos.y, this.target.pos.x, this.target.pos.y, {color: '#ffffff', opacity: 1})
        this.work_left -= creep.store.getFreeCapacity();
    }

    do(creep: Creep) {
        if (Memory.debug.creepSaysTask) creep.say("🧺");
        // amount = this.memory.task.amount ? this.memory.task.amount : this.store.getFreeCapacity;
        return creep.withdraw(this.target, this.resource);
    }

    to_dict(): CreepTask {
        return {
            type: this.type,
            target_id: this.target.id,
            target_pos: this.target.pos,
            range: this.range,
            resource: this.resource
        }
    }

    toString(): string {
        return (`Task ${this.type} (${this.target.pos.x}, ${this.target.pos.y}, ${this.target.pos.roomName}) - ${this.work_assigned}/${this.work_left}`)
    }
}

class TaskPickup implements Task {
    type: 'pickup' = 'pickup'
    range: 1 = 1
    resource: ResourceConstant
    target: Resource
    work_left: number
    work_assigned: number
    priority: number
    constructor(target: Resource) {
        let work_assigned = 0;
        for (const creep of _.filter(Game.creeps, c => c.memory.task != undefined && c.memory.task.type == 'pickup' && c.memory.task.target_id == target.id)) {
            work_assigned += creep.store.getFreeCapacity();
        }
        this.resource = target.resourceType
        this.target = target
        this.work_left = target.amount
        this.work_assigned = work_assigned
        this.priority = TASKPRIO_PICKUP
    }

    is_valid() {
        return this.work_left > 0 && this.target.amount > 0;
    }

    is_valid_for_creep(creep: Creep) {
        return (
            creep.getActiveBodyparts(CARRY) > 0 &&
            creep.store.getFreeCapacity(this.resource) > 0
        )
    }

    assign_to_creep(creep: Creep) {
        console.log("Assigning " + this.toString() + " to creep " + creep.name)
        creep.memory.task = this.to_dict()
        new RoomVisual(creep.room.name).line(creep.pos.x, creep.pos.y, this.target.pos.x, this.target.pos.y, {color: '#ffffff', opacity: 1})
        this.work_left -= creep.store.getFreeCapacity();
    }

    do(creep: Creep) {
        if (Memory.debug.creepSaysTask) creep.say("🧺");
        return creep.pickup(this.target);
    }

    to_dict(): CreepTask {
        return {
            type: this.type,
            target_id: this.target.id,
            target_pos: this.target.pos,
            range: this.range,
            resource: this.resource
        }
    }

    toString(): string {
        return (`Task ${this.type} (${this.target.pos.x}, ${this.target.pos.y}, ${this.target.pos.roomName}) - ${this.work_assigned}/${this.work_left}`)
    }
}

class TaskTransfer implements Task {
    type: 'transfer' = 'transfer'
    range: 1 = 1
    resource: ResourceConstant
    target: AnyStoreStructure
    work_left: number
    work_assigned: number
    priority: number
    constructor(structure: AnyStoreStructure, priority=TASKPRIO_TRANSFER, resource=RESOURCE_ENERGY) {
        let work_assigned = 0;
        for (const creep of _.filter(Game.creeps, c => c.memory.task != undefined && c.memory.task.type == 'transfer' && c.memory.task.target_id == structure.id)) {
            work_assigned += creep.store[resource];
        }
        this.resource = resource
        this.target = structure
        this.work_left = structure.store.getFreeCapacity(resource)
        this.work_assigned = work_assigned
        this.priority = priority
    }

    is_valid() {
        const amount = this.target.store.getFreeCapacity(this.resource)
        if (amount == null) return false
        return this.work_left > 0 && amount > 0;
    }

    is_valid_for_creep(creep: Creep) {
        return (
            creep.getActiveBodyparts(CARRY) > 0 &&
            creep.store[this.resource] > 0
        )
    }

    assign_to_creep(creep: Creep) {
        console.log("Assigning " + this.toString() + " to creep " + creep.name)
        creep.memory.task = this.to_dict()
        new RoomVisual(creep.room.name).line(creep.pos.x, creep.pos.y, this.target.pos.x, this.target.pos.y, {color: '#ffffff', opacity: 1})
        this.work_left -= creep.store[this.resource];
    }

    do(creep: Creep) {
        if (Memory.debug.creepSaysTask) creep.say("🧺");
        // amount = this.memory.task.amount ? this.memory.task.amount : this.store[resource];
        return creep.transfer(this.target as AnyStoreStructure, this.resource);
    }

    to_dict(): CreepTask {
        return {
            type: this.type,
            target_id: this.target.id,
            target_pos: this.target.pos,
            range: this.range,
            resource: this.resource
        }
    }

    toString(): string {
        return (`Task ${this.type} (${this.target.pos.x}, ${this.target.pos.y}, ${this.target.pos.roomName}) - ${this.work_assigned}/${this.work_left}`)
    }
}
