// controllers/userControllers.js

const AppError = require('../utilities/appError');
const User = require('../models/User');

// Function to get users with specified fields
const getUsers = async (req, res, next) => {
    try {
        // Retrieve users from the database with specified fields
        const users = await User.find({}, 'appId name accountStatus location email phone role isEmailVerified isPhoneVerified');

        // Transform data if needed
        const userDetails = users.map(user => ({
            appId: user.appId,
            name: user.name,
            status: user.accountStatus,
            location: user.location,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            isPhoneVerified: user.isPhoneVerified
        }));

        return res.status(200).json({
            status: 'success',
            data: userDetails
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getUsers };
