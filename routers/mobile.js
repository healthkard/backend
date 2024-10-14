const express = require('express');
const router = express.Router();
const MobileUser = require('../schema/mobileUser');

router.get('/', async (req, res) => {
    try {
        const mobileUsers = await MobileUser.find().sort({ createdAt: -1 });
        res.status(200).json(mobileUsers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const mobileUser = await MobileUser.findById(req.params.id);
        res.status(200).json(mobileUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

