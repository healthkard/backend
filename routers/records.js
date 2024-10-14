const express = require('express');
const router = express.Router();
const Record = require('../schema/records');
const User = require('../schema/users');

router.get('/', async (req, res) => {
    try {
        const records = await Record.find();
        res.json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET all records for a user
router.get('/:healthId', async (req, res) => {
    try {
        const user = await User.findOne({ healthId: req.params.healthId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const records = await Record.find({ _id: { $in: user.records } });
        res.json(records.reverse());
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST a new record
router.post('/:healthId', async (req, res) => {
    const record = new Record({
        name: req.body.name,
        url: req.body.url,
    });

    try {
        const newRecord = await record.save();
        const user = await User.findOne({ healthId: req.params.healthId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.records.push(newRecord._id);
        await user.save();
        res.status(201).json(newRecord);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT (update) a record
router.put('/:id', async (req, res) => {
    try {
        console.log(req.params.id);
        const record = await Record.findById(req.params.id);
        console.log(record);
        if (!record) {
            return res.status(404).json({ message: 'Record not found' });
        }
        if (req.body.name) record.name = req.body.name;
        if (req.body.url) record.url = req.body.url;
        const updatedRecord = await record.save();
        res.json(updatedRecord);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE a record
router.delete('/:id', async (req, res) => {
    try {
        const record = await Record.findById(req.params.id);
        if (!record) {
            return res.status(404).json({ message: 'Record not found' });
        }
        await record.remove();
        // Remove record from user's records array
        await User.updateMany({}, { $pull: { records: req.params.id } });
        res.json({ message: 'Record deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
