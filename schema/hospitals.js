const mongoose = require('mongoose');

const HospitalSchema = new mongoose.Schema({
    hospitalId: {
        type: String,
        unique: true,
    },
    email: {
        type: String,
        unique: true,
    },
    isverified: {
        type: String,
        default: '0'
    },
    createdDate: {
        type: String,
        default: new Date().toISOString()
    },
    updatedDate: {
        type: String,
        default: new Date().toISOString()
    },
    agentID: {
        type: String,
        default: 'self'
    },
    hospitalDetails: {
        daysAvailabilty: Array,
        from: String,
        // gstNumber: String,
        // hospitalGSTFile: String,
        hospitalLegalName: String,
        hospitalLicense: String,
        hospitalNumber: String,
        hospitalOwnerContactNumber: String,
        hospitalOwnerEmail: String,
        hospitalOwnerFullName: String,
        hospitalTradeName: String,
        licenseNumber: String,
        address: {
            lat: String,
            lng: String,
            city: String,
            code: String,
            country: String,
            landmark: String,
            state: String,
            street: String
        },
        typeOfHospital: String,
        servicesOffered: Array,
        to: String
    },
    doctorList: [{
        doctorLicenseURL: String,
        email: String,
        lisenceNumber: String,
        name: String,
        number: String,
        qualification: String
    }],
    mediaDetails: {
        achivements: Array,
        desc: String,
        doctorImageURL: String,
        hospitalImageURL: String,
        logoURL: String
    },
    users: {
        type: Array,
        default: []
    }
});

const HospitalModel = mongoose.model('Hospital', HospitalSchema);

module.exports = HospitalModel;