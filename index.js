const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const usersRouter = require('./routers/users');
const hospitalRouter = require('./routers/hospitals');
const agentsRouter = require('./routers/agents');
const authRouter = require('./routers/auth');
const paymentRouter = require('./routers/payment');

require('dotenv').config();

const corsOptions = {
    origin: '*',
    credentials: true,
    optionsSuccessStatus: 200
}
// middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// database connected
mongoose.connect(process.env.MONGODB_URL).then(() => console.log('Database Connected')).catch(err => console.log(err));

// port
app.listen(process.env.PORT, () => { console.log('Server is running on port ' + process.env.PORT); });

// routes
app.get('/', (req, res) => { res.status(200).send('Server is running'); });
app.use('/users', usersRouter);
app.use('/hospitals', hospitalRouter);
app.use('/agents', agentsRouter);
app.use('/auth', authRouter);
app.use('/pay', paymentRouter);