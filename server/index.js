const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const connectDB = require('./config/db')
const apiRoutes = require('./routes/index');
const app = express()


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

connectDB();

app.use('/api', apiRoutes)
app.get('/', (req, res) => {
    res.send('Server runnning fine!')
});


const PORT = 4000;
app.listen(PORT, console.log(`Server Running Successfully on ${PORT}`));