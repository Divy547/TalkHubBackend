const express = require('express')
const { Server } = require("socket.io")
const http = require("http");
const cors = require('cors')

const app = express()
app.use(cors())
let users = {}
let cUiR = {}

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "https://chatting-application-frontend.vercel.app",
        methods: ['GET', 'POST'],
    },
});

app.get('/', (req, res) => {
    res.send('Hello,World!')
})

io.on('connection', (socket) => {
    socket.on('new-user-joined', name => {
        users[socket.id] = name
        io.emit('users', users)
    })

    socket.on('UserMessage', data => {
        io.to(data.roomName).emit('message', { name: data.name, message: data.message, id: socket.id})
    })
    socket.on('userDisconnected', data => {
        let id = data.id
        delete users[id]
        io.emit('disconnection', { users: users, name: data.name, id: data.id })
        socket.disconnect()
    })
    socket.on('roomCreation', data => {
        cUiR[socket.id] = data.name
        socket.join(data.RoomName)
        socket.broadcast.emit('newRoom', data)
    })

    socket.on('Joining-Room', data => {
        cUiR[socket.id] = data.name
        socket.join(data.rName)
        io.to(data.rName).emit('new-room-connection', {name:data.name, roomName: data.rName, cUiR:cUiR, id:data.id})
    })

    socket.on('leave-room', data => {
        delete cUiR[socket.id]
        socket.leave(data.roomName)
        io.to(data.roomName).emit('leftRoom', {name:data.name, roomName:data.roomName, id:data.id, cUiR:cUiR})
    })
});

const port = 3001
server.listen(port, () => {
    console.log(`Example app listening on http://localhost:${port}/`)
})
