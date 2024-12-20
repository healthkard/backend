// routes/users.js
const express = require('express');
const User = require('../schema/users');
const { generateYearPrefixedNumber } = require('../helpers/basicFunctions');
const { addUserToAgent } = require('../middleware/updateAgents');
const { renewUser } = require('../middleware/user/payment');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { healthId, number } = req.query;

        let query = {};
        if (healthId) {
            query.healthId = healthId;
        } else if (number) {
            // Create an array of possible number formats
            const numberFormats = [number];
            if (number.length === 10) {
                numberFormats.push(`91${number}`);
            } else {
                numberFormats.push(number);
            }
            query.number = { $in: numberFormats };
        }
        const users = await User.find({ ...query }).sort({ createdDate: -1 });
        // Update all users to be registered
        // users.forEach(user => {
        //     user.registered = true;
        // });
        // await Promise.all(users.map(user => user.save()));
        res.status(200).json({
            users
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/user/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user == null) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/unregistered/:number', async (req, res) => {
    try {
        let user = await User.findOne({ number: req.params.number });
        if (!user) {
            user = new User({
                healthId: generateYearPrefixedNumber('HK'),
                name: 'xyz',
                number: req.params.number,
                registered: false
            });
            await user.save();
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/unregistered/:number', async (req, res) => {
    try {
        await User.findOneAndUpdate({ number: req.params.number, registered: false }, req.body);
        res.status(200).json({ message: 'User registered' });
    } catch (error) {
        console.log({ error });
        res.status(500).json({ message: error.message });
    }
});

router.post('/', async (req, res) => {
    const newId = generateYearPrefixedNumber('HK');
    const plans = require('../data/plans');
    const lastValidPayment = req.body.payments.slice().reverse().find(p => p.paymentStatus);
    let expireDate;

    if (lastValidPayment) {
        const plan = plans.find(p => p.id === lastValidPayment.plan);
        if (plan) {
            const durationInDays = plan.days;
            expireDate = new Date(new Date().getTime() + durationInDays * 24 * 60 * 60 * 1000).toISOString();
        }
    }

    const user = new User({
        healthId: newId,
        name: req.body.name,
        image: req.body.image,
        email: req.body.email,
        number: req.body.number.length === 10 ? `91${req.body.number}` : req.body.number,
        gender: req.body.gender,
        dob: req.body.dob,
        age: req.body.age,
        address: req.body.address,
        city: req.body.city,
        pincode: req.body.pincode,
        expireDate: expireDate || req.body.expireDate,
        agent: req.body.agent,
        payments: req.body.payments
    });

    try {
        const newUser = await user.save();
        await addUserToAgent(newId, req.body.payments[req.body.payments.length - 1], 'new', req.body.name);

        res.status(201).json(newUser);
    } catch (error) {
        console.log({ error });
        res.status(400).json({ message: error.message });
    }
});

router.put('/:healthId', async (req, res) => {
    const { healthId } = req.params;
    try {
        const user = await User.findOne({ healthId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.set(req.body);
        await user.save();
        res.status(200).json({ user, status: 200 });
    } catch (error) {
        console.log({ error });
        res.status(400).json({ message: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (user == null) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;


//statistics
router.get('/statistics', async (req, res) => {
    const users = await User.find({});
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const totalUsers = await User.countDocuments({});
    res.status(200).json({
        users: [
            { label: 'Today’s users count', value: users.filter(user => new Date(user.dateJoined) >= today).length },
            { label: 'This month’s users count', value: users.filter(user => new Date(user.dateJoined) >= thisMonth).length },
            { label: 'Total users count', value: totalUsers }
        ]
    });
});
