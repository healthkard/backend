// hospitalRoutes.js
const express = require('express');
const Hospital = require('../schema/hospitals');
const { addHospitalToAgent } = require('../middleware/updateAgents');
const { generateYearPrefixedNumber } = require('../helpers/basicFunctions');
const router = express.Router();
const { ObjectId } = require('mongodb');


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
        const { hospitalId, service, city } = req.query;
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

        const hospitals = await Hospital.find(query);

        res.status(200).json({
            hospitals
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/hospital/:id', async (req, res) => {
    const hospitalId = req.params.id;

    try {
        const hospital = await Hospital.findOne({ _id: hospitalId });
        if (hospital == null) {
            return res.status(404).json({ message: 'Hospital not found' });
        }
        res.status(200).json(hospital);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/hospital/:id', async (req, res) => {
    const hospitalId = req.params.id;
    const updatedData = req.body;
    console.log(hospitalId);
    try {
        const result = await Hospital.findOneAndUpdate(
            { _id: hospitalId },
            {
                $set: {
                    ...updatedData,
                    updatedDate: new Date().toISOString()
                }
            },
            { new: true }
        );
        if (!result) {
            return res.status(404).json({ message: "Hospital not found" });
        }
        res.status(200).json({ message: "Hospital updated successfully", data: result });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error updating hospital", error: error.message });
    }
});

router.put('/hospital/general/:id', async (req, res) => {
    try {
        const hospitalId = req.params.id;
        const { hospitalLegalName, hospitalNumber, desc, email } = req.body;
        const hospital = await Hospital.findById(hospitalId);
        hospital.hospitalDetails.hospitalLegalName = hospitalLegalName;
        hospital.hospitalDetails.hospitalNumber = hospitalNumber;
        hospital.mediaDetails.desc = desc;
        hospital.hospitalDetails.email = email;
        await hospital.save();
        res.status(200).json({ message: "Hospital updated successfully", data: hospital });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error updating hospital", error: error.message });
    }
});

router.put('/hospital/doctor/:id', async (req, res) => {
    try {
        const hospitalId = req.params.id;
        const doctors = req.body;
        const hospital = await Hospital.findById(hospitalId);
        hospital.doctorList = doctors;
        await hospital.save();
        res.status(200).json({ message: "Hospital updated successfully", data: hospital });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error updating hospital", error: error.message });
    }
});

router.put('/hospital/owner/:id', async (req, res) => {
    try {
        const hospitalId = req.params.id;
        const { name, email, phone } = req.body;
        const hospital = await Hospital.findById(hospitalId);
        hospital.hospitalDetails.hospitalOwnerFullName = name;
        hospital.hospitalDetails.hospitalOwnerEmail = email;
        hospital.hospitalDetails.hospitalOwnerContactNumber = phone;
        await hospital.save();
        res.status(200).json({ message: "Hospital updated successfully", data: hospital });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error updating hospital", error: error.message });
    }
});

router.put('/hospital/address/:id', async (req, res) => {
    try {
        const hospitalId = req.params.id;
        const address = req.body;
        const hospital = await Hospital.findById(hospitalId);
        hospital.hospitalDetails.address = address;
        await hospital.save();
        res.status(200).json({ message: "Hospital updated successfully", data: hospital });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error updating hospital", error: error.message });
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
        console.log(error);
        res.status(500).send(error);
    }
});


router.get('/statistics', async (req, res) => {
    const hospitals = await Hospital.find({});
    const today = new Date().toISOString().split('T')[0];
    const todayHospitals = hospitals.filter(hospital => hospital.createdDate.split('T')[0] === today);
    res.status(200).send([
        { label: 'Today’s approved hospitals', value: todayHospitals.length },
        { label: 'Total approved hospitals', value: hospitals.filter(hospital => hospital.isverified === '2').length },
        { label: 'Pending hospitals', value: hospitals.filter(hospital => hospital.isverified !== '2').length },
    ]);
});

module.exports = router;