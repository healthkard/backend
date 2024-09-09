// routes/users.js
const express = require('express');
const User = require('../schema/users');
const { generateYearPrefixedNumber } = require('../helpers/basicFunctions');

const router = express.Router();


router.get('/', async (req, res) => {
    try {
        const { healthId, number, page = 1, limit = 10 } = req.query;
        const formatedNumber = number && number.length === 10 ? `91${number}` : number;
        const skip = (page - 1) * limit;

        let query = {};
        if (healthId) {
            query.healthId = healthId;
        } else if (number) {
            query.number = formatedNumber;
        }

        const users = await User.find(query)
            .skip(skip)
            .limit(Number(limit));

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
    const user = new User({
        healthId: `HK${generateYearPrefixedNumber}`,
        name: req.body.name,
        image: req.body.image,
        email: req.body.email,
        number: req.body.number,
        gender: req.body.gender,
        age: req.body.age,
        address: req.body.address,
        city: req.body.city,
        pincode: req.body.pincode,
        expireDate: req.body.expireDate,
        agent: req.body.agent,
        payments: req.body.payments
    });

    try {
        const newUser = await user.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            req.body, { new: true, runValidators: true }
        );
        if (updatedUser == null) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(updatedUser);
    } catch (error) {
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