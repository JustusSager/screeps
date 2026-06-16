
module.exports = function() {
    RoomPosition.prototype.constructor = function(roomPos: IRoomPosition) {
        return new RoomPosition(roomPos.x, roomPos.y, roomPos.roomName)
    }
}

