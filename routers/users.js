// routes/users.js
const express = require('express');
const User = require('../schema/users');
const { generateYearPrefixedNumber } = require('../helpers/basicFunctions');
const { addUserToAgent } = require('../middleware/updateAgents');
const { renewUser } = require('../middleware/user/payment');

const router = express.Router();


router.get('/', async (req, res) => {
    try {
        const { healthId, number, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

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
        const users = await User.find(query)
            .skip(skip)
            .limit(Number(limit));

        // console.log({ users })
        const totalUsers = await User.countDocuments(query);
        res.status(200).json({
            users,
            currentPage: Number(page),
            totalPages: Math.ceil(totalUsers / limit),
            totalUsers
        });
    } catch (error) {
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
    const { payment } = req.body;
    try {
        if (payment) {
            await renewUser(healthId, payment, res);
        }
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