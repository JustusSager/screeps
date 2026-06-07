var roleMiner = require('role.miner');
var roleWorker = require('role.worker');
var roleRemoteHarvester = require('role.remoteHarvester');
const { CREEP_ROLE_MINER, CREEP_ROLE_WORKER, CREEP_ROLE_CARRIER, CREEP_ROLE_REMOTE_HARVESTER } = require('./constants');

module.exports = function() {
    Creep.prototype.run = function(speak = false) {
        switch (this.memory.role) {
            case CREEP_ROLE_MINER:
                return roleMiner.run(this, speak);
            case CREEP_ROLE_WORKER:
            case CREEP_ROLE_CARRIER:
                return roleWorker.run(this, speak);
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
};
