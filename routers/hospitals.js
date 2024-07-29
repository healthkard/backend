// hospitalRoutes.js
const express = require('express');
const Hospital = require('../schema/hospitals');
const router = express.Router();

// Create a new hospital
router.post('/', async(req, res) => {
    try {
        const hospital = new Hospital(req.body);
        await hospital.save();
        res.status(201).send(hospital);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get('/', async(req, res) => {
    try {
        const { hospitalId } = req.query;
        let hospitals;
        if (hospitalId) {
            hospitals = await Hospital.find({ hospitalId });
        } else {
            hospitals = await Hospital.find();
        }
        res.status(200).json(hospitals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a hospital by ID
router.patch('/:id', async(req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['email', 'isverified', 'agentID', 'hospitalDetails', 'doctorList', 'mediaDetails', 'users'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        const hospital = await Hospital.findById(req.params.id);
        if (!hospital) {
            return res.status(404).send();
        }

        updates.forEach((update) => (hospital[update] = req.body[update]));
        hospital.updatedDate = new Date().toISOString();
        await hospital.save();
        res.status(200).send(hospital);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Delete a hospital by ID
router.delete('/:id', async(req, res) => {
    try {
        const hospital = await Hospital.findByIdAndDelete(req.params.id);
        if (!hospital) {
            return res.status(404).send();
        }
        res.status(200).send(hospital);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;