const User = require('../models/user'); // Import the Customer model

const userRegister = async (req, res) => {
    const { name, email } = req.body;

    try {
        // Check if the email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Create a new user
        const newUser = new User({
            fullName:name,
            email,
        });

        // Save the user
        await newUser.save(); // Corrected from newAdmin.save()

        // Return a success message
        res.status(201).json({ message: 'Joined successfully' });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// fetch all users
const fetchAllUsers = async (req, res) => {
    try {
        const users = await User.find({}); // Fetch all users
        res.status(200).json(users); // Return users as JSON
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Delete a user by ID
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params; // Get user ID from the URL

        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    userRegister,
    fetchAllUsers,
    deleteUser // Export the new function
};