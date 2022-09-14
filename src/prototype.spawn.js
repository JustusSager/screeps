module.exports = function() {
    StructureSpawn.prototype.createBalancedCreep =
        function(energy, role) {
            var number_of_parts = Math.floor(energy / 200);
            if (number_of_parts > 0) {
                var body = [];
                for (let i = 0; i < number_of_parts; i++) {
                    body.push(WORK);
                }
                for (let i = 0; i < number_of_parts; i++) {
                    body.push(CARRY);
                }
                for (let i = 0; i < number_of_parts; i++) {
                    body.push(MOVE);
                }
    
                return this.spawnCreep(body, role + Game.time, { memory: {
                    role: role,
                    working: true,
                    room_home: this.room.name,
                    room_target: this.room.name
                }});
            }
        }
    
    StructureSpawn.prototype.createFighterCreep =
        function(energy, role) {
            var number_of_parts = Math.floor(energy / 190);
            if (number_of_parts > 0) {
                var body = [];
                for (let i = 0; i < number_of_parts; i++) {
                    body.push(TOUGH);
                }
                for (let i = 0; i < number_of_parts; i++) {
                    body.push(ATTACK);
                }
                for (let i = 0; i < number_of_parts; i++) {
                    body.push(MOVE);
                    body.push(MOVE);
                }
            }

            return this.spawnCreep(body, role + Game.time, { memory: {
                role: role,
                working: true,
                room_home: this.room.name,
                room_target: this.room.name
            }});
        }

        StructureSpawn.prototype.createCarrierCreep =
        function(energy, role) {
            var number_of_parts = Math.floor((energy - 100) / 100);
            if (number_of_parts > 0) {
                var body = [];
                body.push(WORK);
                for (let i = 0; i < number_of_parts; i++) {
                    body.push(CARRY);
                }
                for (let i = 0; i < number_of_parts; i++) {
                    body.push(MOVE);
                }
    
                return this.spawnCreep(body, role + Game.time, { memory: {
                    role: role,
                    working: true,
                    room_home: this.room.name,
                    room_target: this.room.name
                }});
            }
        }
};
