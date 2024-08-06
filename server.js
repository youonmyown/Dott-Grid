const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

const gridSize = 100 * 100;
const gridFilePath = path.join(__dirname, 'gridState.json');

let gridState = [];
if (fs.existsSync(gridFilePath)) {
    const data = fs.readFileSync(gridFilePath);
    gridState = JSON.parse(data);
} else {
    gridState = Array(gridSize).fill('#ffffff');
}

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.emit('initialGrid', gridState);

    socket.on('colorChange', (data) => {
        gridState[data.index] = data.color;

        fs.writeFileSync(gridFilePath, JSON.stringify(gridState));

        io.emit('updateCell', data);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

const port = 4000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
