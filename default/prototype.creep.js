var roleMiner = require('role.miner');
var roleWorker = require('role.worker');
var roleTransporter = require('role.transporter');
var roleRemoteHarvester = require('role.remoteHarvester');
const { CREEP_ROLE_MINER, CREEP_ROLE_WORKER, CREEP_ROLE_CARRIER, CREEP_ROLE_REMOTE_HARVESTER } = require('./constants');

module.exports = function() {
    Creep.prototype.run = function(speak = false) {
        switch (this.memory.role) {
            case CREEP_ROLE_MINER:
                return roleMiner.run(this, speak);
            case CREEP_ROLE_WORKER:
                return roleWorker.run(this, speak);
            case CREEP_ROLE_CARRIER:
                return roleTransporter.run(this, speak);
            case CREEP_ROLE_REMOTE_HARVESTER:
                return roleRemoteHarvester.run(this, speak)
            default:
                this.assignRoleByParts(this);
                return;
        }
    }

    Creep.prototype.assignRoleByParts = function(speak = true) {
        // TODO Bessere zuweisung der Rolle!
        this.memory.role = CREEP_ROLE_CARRIER;
        if (speak) {
            this.say("Im a " + this.memory.role + "now!");
        }
    }
    
    Creep.prototype.find_tombstones = 
    function(threshold = 0) {
        return this.pos.findClosestByPath(FIND_TOMBSTONES, {
            filter: (structure) => {
                return structure.store.getUsedCapacity() > threshold && structure.room == this.room;
            }
        });
    }
        
    Creep.prototype.find_dropped_rescources = 
    function(threshold = 0, resource = RESOURCE_ENERGY) {
        // nochmal anschauen was hier passieren muss!!!
        return this.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
            filter: (r) => {
                return r.resourceType == resource && r.amount > threshold;
            }
        });
    }
        
    Creep.prototype.find_extensions_not_full = 
    function(threshold = 0) {
        return this.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return  structure.structureType == STRUCTURE_EXTENSION && structure.store.getFreeCapacity(RESOURCE_ENERGY) > threshold;
            }
        });
    }
    
    Creep.prototype.find_towers_not_full = 
    function(threshold = 0) {
        return this.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return  structure.structureType == STRUCTURE_TOWER && structure.store.getFreeCapacity(RESOURCE_ENERGY) > threshold;
            }
        });
    }
    
    Creep.prototype.find_container_not_empty = 
    function(threshold = 0, resource = RESOURCE_ENERGY) {
        return this.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return  structure.structureType == STRUCTURE_CONTAINER && structure.store[resource] > threshold;
            }
        });
    }
        
    Creep.prototype.find_storage_not_full = 
    function(threshold = 0) {
        return this.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_STORAGE && structure.store.getFreeCapacity() > threshold;
            }
        });
    }
};
