module.exports = function () {
    StructureSpawn.prototype.createGenericCreep = function (energy, role) {
        const numOfParts = Math.floor(energy / 200);
        let body = [];
        for (let i = 0; i < numOfParts; i++) {
            body.push(WORK);
        }
        for (let i = 0; i < numOfParts; i++) {
            body.push(CARRY);
        }
        for (let i = 0; i < numOfParts; i++) {
            body.push(MOVE);
        }
        return this.spawnCreep(body, role + Game.time, {role: role, task: {name: 'idle'}});
    }
}