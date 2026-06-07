module.exports = function () {
    
    RoomVisual.prototype.list = function(title, items, top_left_x, top_left_y) {
        this.text(
            title, 
            top_left_x, top_left_y,
            { color: 'green', font: 0.8, align: 'left' }
        )
        for (let i = 0; i < items.length; i++) {
            this.text(
                items[i], 
                top_left_x, top_left_y + (i) + 1,
                { color: 'green', font: 0.6, align: 'left' }
            )
        }
    },

    RoomVisual.prototype.table = function(headers, column_widths, items, top_left_x, top_left_y) {
        let accum_x = top_left_x
        for (let col = 0; col < headers.length; col++) {
            this.text(
                headers[col], 
                accum_x, top_left_y,
                { color: 'green', font: 0.8, align: 'left' }
            )
            accum_x += column_widths[col]
        }
        for (let row = 0; row < items.length; row++) {
            accum_x = top_left_x;
            for (let col = 0; col < items[row].length; col++) {
                this.text(
                    items[row][col], 
                    accum_x, top_left_y + row + 1,
                    { color: 'green', font: 0.6, align: 'left' }
                )
                accum_x += column_widths[col]
            }
        }
    }

    RoomVisual.prototype.circle_with_text = function(text, x, y, radius, fill, opacity) {
        this.circle(x, y, {
            radius: radius,
            fill: fill,
            opacity: opacity
        })
        this.text(text, x, y+0.2, {
            color: '#000000',
            font: 0.7
        })
    }
}