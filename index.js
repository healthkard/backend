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
    'https://healthkard.in',
    'https://www.healthkard.in',
    'https://backend-green-tau.vercel.app',
    'http://localhost:3000',
    'http://localhost:3002',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3002',
];

// Add logging to help debug CORS issues
app.use((req, res, next) => {
    console.log('Incoming request from origin:', req.headers.origin);
    next();
});

const corsOptions = {
    origin: function (origin, callback) {
        console.log('Request origin:', origin);
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('Origin not allowed:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
    exposedHeaders: ['Access-Control-Allow-Origin'],
    preflightContinue: false,
    optionsSuccessStatus: 204
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Add a pre-flight route handler
app.options('*', cors(corsOptions));

// Add headers middleware as a backup
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});

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