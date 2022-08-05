import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import tasksRoutes from './routes/taskRoutes.js';
import { Server } from 'socket.io';

const app = express();

app.use(express.json());

dotenv.config();

const PORT = process.env.PORT || 4000;

connectDB();

// CORS config
const whitelist = [process.env.FRONTEND_URI];

const corsOptions = {
    origin: function (origin, callback){
        if(whitelist.includes(origin)){
            callback(null, true);        
        }else{
            callback(new Error('CORS error'));
        }
    }
}

app.use(cors(corsOptions));

//Routing
app.use('/api/users', userRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/tasks', tasksRoutes)

const server = app.listen (PORT, ()=>{
    console.log (`Run on port: ${PORT}`);
});

// Socket.io

const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONTEND_URI
    },
})

io.on('connection', (socket) => {
    console.log('Connect to Socket.io')
    socket.on ('Open Project', (id)=>{
        socket.join(id)
    })

    socket.on('newTask', (task) => {
        const project  = task.project;
        socket.to(project).emit('taskAdded', task);
    })

    socket.on('deleteTask', (task) => {
        const project  = task.project;
        socket.to(project).emit('taskDeleted', task);
    })

    socket.on('updateTask', (task) => {
        const project = task.project._id;
        socket.to(project).emit('taskUpdated', task);
    })

    socket.on('changeState', (task) => {
        const project = task.project._id
        socket.to(project).emit('stateChanged', task)
    })
})



 /*   //"start": "node index.js",
    //"dev": "nodemon index.js",
    //"test": "echo \"Error: no test specified\" && exit 1"*/