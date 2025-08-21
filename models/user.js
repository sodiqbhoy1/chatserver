const mongoose = require('mongoose');

// Create a schema for the buyer
const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
    },
    email: {
        type: String,
    },

});

// Create a model for the user
const user = mongoose.model('User', userSchema);

module.exports = user;