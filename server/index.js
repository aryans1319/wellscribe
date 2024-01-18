const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const socketIO = require('socket.io');
const connectDB = require('./config/db');
const apiRoutes = require('./routes/index');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

connectDB();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.send('Server running fine!');
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Server running successfully on port ${PORT}`);
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});
