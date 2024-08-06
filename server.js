const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

const gridSize = 100 * 100;
let gridState = Array(gridSize).fill('#ffffff');

io.on('connection', (socket) => {
    console.log('A user connected');

    // Отправляем текущее состояние сетки новому пользователю
    socket.emit('initialGrid', gridState);

    // Обрабатываем изменение цвета ячейки
    socket.on('colorChange', (data) => {
        gridState[data.index] = data.color;
        // Отправляем изменения всем пользователям
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
