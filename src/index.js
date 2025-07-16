import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from "socket.io";

import { PORT } from './config.js';

const app = express();
const server = http.createServer(app);

//Configurar socket.io
export const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
})

//Middlewares de Express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

//RUTAS USER
import placeRoutes from './routes/places.routes.js'
import routesRoutes from './routes/routes.routes.js'
import createRoutes from './routes/create.routes.js'

//USE ROUTERS USER
app.use('/api/v1/', placeRoutes)
app.use('/api/v1/', routesRoutes)
app.use('/api/v1/', createRoutes)

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// -------------- SOCKET.IO -------------------
io.on('connection', (socket) => {
    console.log('Usuario conectado', socket.id);

    //Escuchar registro del usuario
    socket.on('register', ({ userId, role }) => {
        const roomName = `${role}-${userId}`;
        socket.join(roomName);
        console.log(`El usuario ${userId} registrado en la sala ${roomName}`);
    });

    socket.on('disconnect', () => {
        console.log(`Usuario desconectado ${socket.id}`);
    })
});

server.listen(PORT, () => {
    console.log(`Listening on port http://localhost:${PORT}`);
});