const mongoose = require('mongoose');


// Create a schema for the buyer
const adminSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'Name is required']
    },
    lastName: {
        type: String,
        required: [true, 'Name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: [true, 'Email already exists']
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },

    resetPasswordToken: String,       // Add this
    resetPasswordExpires: Date, 

});

// Create a model for the admin
const admin = mongoose.model('Admin', adminSchema);

module.exports = admin;