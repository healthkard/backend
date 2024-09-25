// hospitalRoutes.js
const express = require('express');
const Hospital = require('../schema/hospitals');
const { addHospitalToAgent } = require('../middleware/updateAgents');
const { generateYearPrefixedNumber } = require('../helpers/basicFunctions');
const router = express.Router();

// Create a new hospital
router.post('/', async (req, res) => {
    try {
        const hospitalId = generateYearPrefixedNumber('HH');
        console.log({ hospitalId });
        const hospital = { ...req.body, hospitalId: hospitalId };
        const newHospital = new Hospital(hospital);
        await newHospital.save();
        await addHospitalToAgent(hospital.hospitalId, hospital.hospitalDetails.hospitalLegalName, hospital.agentID);
        res.status(201).send(hospital);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
});

router.get('/', async (req, res) => {
    try {
        const { hospitalId, page = 1, limit = 10, service, city } = req.query;
        const skip = (page - 1) * limit;

        let query = {};

        if (hospitalId) {
            query.hospitalId = hospitalId;
        }

        if (service) {
            query.$or = [
                { 'hospitalDetails.servicesOffered': 'All Services' },
                { 'hospitalDetails.servicesOffered': service }
            ];
        }

        if (city && city !== 'All Cities') {
            query['hospitalDetails.address.city'] = { $regex: new RegExp(city, 'i') };
        }

        // If only city is selected and it's not 'All cities', return all hospitals in that city
        if (city && city !== 'All Cities' && !service) {
            delete query.$or;
        }

        const hospitals = await Hospital.find(query)
            .skip(skip)
            .limit(Number(limit));

        const totalHospitals = await Hospital.countDocuments(query);


        res.status(200).json({
            hospitals,
            currentPage: Number(page),
            totalPages: Math.ceil(totalHospitals / limit),
            totalHospitals
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a hospital by ID
router.patch('/:id', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
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