// controllers/accountSettings.js

const AppError = require('../utilities/appError');
const UserSettings = require('../models/UserSettings');

const updateMfaSettings = async (req, res, next) => {
    const { userId, mfaEnabled, mfaMethod } = req.body;

    try {
        await UserSettings.updateOne(
            { userId },
            { mfaEnabled, mfaMethod },
            { upsert: true }
        );

        return res.status(200).json({
            status: 'success',
            message: 'MFA settings updated successfully.',
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { updateMfaSettings };
