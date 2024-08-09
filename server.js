const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('pixel'));

const gridSize = 200 * 200;
const gridFilePath = path.join(__dirname, 'gridState.json');

// Загрузка состояния сетки из файла или создание нового состояния
let gridState = [];
if (fs.existsSync(gridFilePath)) {
    const data = fs.readFileSync(gridFilePath);
    gridState = JSON.parse(data);
} else {
    gridState = Array(gridSize).fill('#ffffff');
}

io.on('connection', (socket) => {
    console.log('A user connected');

    // Отправляем текущее состояние сетки новому пользователю
    socket.emit('initialGrid', gridState);

    // Обрабатываем изменение цвета ячейки
    socket.on('colorChange', (data) => {
        gridState[data.index] = data.color;

        // Сохраняем текущее состояние сетки в файл периодически
        if (Date.now() - lastSave > 5000) { // Сохраняем каждую 5 секунд
            fs.writeFileSync(gridFilePath, JSON.stringify(gridState));
            lastSave = Date.now();
        }

        // Отправляем изменения всем пользователям
        io.emit('updateCell', data);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

let lastSave = Date.now();
const port = 4000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
