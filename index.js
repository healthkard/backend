const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const usersRouter = require('./routers/users');
const hospitalRouter = require('./routers/hospitals');
const agentsRouter = require('./routers/agents');
const authRouter = require('./routers/auth');
const paymentRouter = require('./routers/payment');
const recordsRouter = require('./routers/records');
const mobileRouter = require('./routers/mobile');
const emailsRouter = require('./routers/emails');
const paymentsRouter = require('./routers/payments');
require('dotenv').config();

const allowedOrigins = [
    'http://healthkard.in',
    'http://www.healthkard.in',
    'https://backend-green-tau.vercel.app',
    'http://localhost:3000',
    'http://localhost:3002'
];

// Simplify the CORS configuration by using the cors middleware directly
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
};

// Remove the custom middleware and use cors with options
app.use(cors(corsOptions));

// middlewares
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
app.use('/records', recordsRouter);
app.use('/payments', paymentsRouter);
app.use('/mobile', mobileRouter);
app.use('/emails', emailsRouter);