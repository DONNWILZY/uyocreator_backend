// controllers/authControllers.js

const AppError  = require('../utilities/appError');
const User = require('../models/User');
const UserSettings = require('../models/UserSettings');
const { send2mfaOtpEmail, sendAccountLockedEmail } = require('../utilities/mailerHelpers');
const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const jwt = require('jsonwebtoken');
const { generateOTPCode } = require('../utilities/optGenerator');
const { generateSystemNumber } = require('../utilities/appId');
const OtpCode = require('../models/OtpCode');
const transporter = require('../utilities/mailerTransporter');
const { clearAuthTokenCookie } = require('../utilities/cookieHelpers');

/// SignUp with Email
const signupWithEmail = async (req, res, next) => {
    const { name, email} = req.body;
       // Generate a 10-digit system number (appId)
       const appId = generateSystemNumber();

    try {
        let user = await User.findOne({ email });

        if (user) {
            if (user.isEmailVerified) {
                throw new AppError('Email already verified. Please log in.', 400, 'EMAIL_ALREADY_VERIFIED');
            } else {
                // Resend OTP
                const otp = await OtpCode.findOne({ userId: user._id, expiresAt: { $gt: Date.now() } });
                if (otp) {
                    await sendVerificationEmail(email, name, otp.code);
                    return res.status(200).json({
                        status: 'success',
                        message: 'OTP resent for verification.',
                    });
                }
            }
        } else {
            user = new User({ name, email, appId });
            await user.save();
        }

        const otpCode = generateOTPCode();
        const resetLink = `${process.env.CLIENT_URL}/reset-password/${otpCode}`;
        const otpExpiration = new Date(Date.now() + 60 * 60 * 1000); // Expires after 1 hour

        await new OtpCode({
            userId: user._id,
            code: otpCode,
            expiresAt: otpExpiration
        }).save();

        await sendVerificationEmail(email, name, otpCode);

        res.status(200).json({
            status: 'success',
            message: 'Signup successful, OTP sent for verification.',
        });
    } catch (error) {
        next(error);
    }
};

const sendVerificationEmail = async (email, name, otpCode) => {
    const verifyLink = `${process.env.CLIENT_URL}/verify-email/${otpCode}`;
    try {
        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: "Verify Your Email",
            html: `
                <h1>Email Verification</h1>
                <p>Please enter the verification code to continue:</p>
                <h2>${otpCode}</h2>
                <p>or click the link below to verify your email:</p>
                <p><a href="${verifyLink}">Verify Email</a></p>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log("Verification email sent successfully.");
    } catch (error) {
        console.error("Error sending verification email:", error);
        throw new AppError("Failed to send verification email.", 500, "EMAIL_SEND_ERROR");
    }
};

// verify Email
const verifyEmail = async (req, res, next) => {
    const { email } = req.body;
    const otpCode = req.body.otpCode || req.params.otpCode;

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            throw new AppError('User not found with this email.', 404, 'USER_NOT_FOUND');
        }

        // Find the OTP code and check if it is valid
        const otp = await OtpCode.findOne({ userId: user._id, code: otpCode, expiresAt: { $gt: Date.now() } });
        if (!otp) {
            throw new AppError('Invalid or expired OTP code.', 400, 'INVALID_OTP');
        }

        // Verify the user's email
        user.isEmailVerified = true;
        await user.save();

        // Send a notification email to the user
        await sendEmailVerificationConfirmationEmail(user.email, user.name);

        // Delete the used OTP code
        await OtpCode.deleteOne({ _id: otp._id });

        // Respond with success message
        return res.status(200).json({
            status: 'success',
            message: 'Email verified successfully.',
            user: {
                name: user.name,
                id: user._id,
                email: user.email,
                username: user.username,
                phoneNumber: user.phoneNumber,
                isEmailVerified: user.isEmailVerified,
            }
        });
    } catch (error) {
        next(error);
    }
};

const sendEmailVerificationConfirmationEmail = async (email, name) => {
    try {
        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: "Email Verification Confirmed",
            html: `
                <h1>Email Verification Confirmed</h1>
                <p>Your email address has been successfully verified.</p>
                <p>You can now continue the signup process.</p>
                <p>Best regards,</p>
                <p> Sotrip App Team</p>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log("Email verification confirmation email sent successfully.");
    } catch (error) {
        console.error("Error sending email verification confirmation email:", error);
        throw new AppError("Failed to send email verification confirmation email.", 500, "EMAIL_SEND_ERROR");
    }
};

const addCurrentLocation = async (req, res, next) => {
    const { email, location } = req.body;

    try {
        const user = await User.findOneAndUpdate({ email }, { location }, { new: true });

        if (!user) {
            throw new AppError('User not found with this email.', 404, 'USER_NOT_FOUND');
        }

        return res.status(200).json({
            status: 'success',
            message: 'Location updated successfully.',
            user: {
                name: user.name,
                email: user.email,
                location: user.location,
            }
        });
    } catch (error) {
        next(error);
    }
};

// add user details to complete signup
const addDetails = async (req, res, next) => {
    const { email, name, phone, password } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            throw new AppError('User not found with this email.', 404, 'USER_NOT_FOUND');
        }

        // Check if the user's email is verified
        if (!user.isEmailVerified) {
            throw new AppError('Email not verified. Please verify your email before proceeding.', 400, 'EMAIL_NOT_VERIFIED');
        }

        // Check if user details are already saved
        if (user.name && user.phone && user.password) {
            return res.status(200).json({
                status: 'success',
                message: 'User details already provided. Please log in.',
                user: {
                    name: user.name,
                    email: user.email,
                    phoneNumber: user.phone,
                }
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user details
        user.name = name;
        user.phone = phone;
        user.password = hashedPassword;

        // Save the updated user details
        await user.save();

        // Send a notification email to the user
        await sendConfirmationEmail(user.email, user.name);

        // Generate auth token
        const authToken = jsonwebtoken.sign({ userId: user._id }, process.env.JWT_SEC_KEY);

        // Respond with success message and auth token
        return res.status(200).json({
            status: 'success',
            message: 'User details added successfully. Confirmation email sent.',
            user: {
                name: user.name,
                email: user.email,
                phoneNumber: user.phone,
            },
            authToken
        });
    } catch (error) {
        next(error);
    }
};


const sendConfirmationEmail = async (email, name) => {
    try {
        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: "Registration Successful",
            html: `
                <h1>Welcome to SoTrip</h1>
                <p>Dear ${name},</p>
                <p>Your registration was successful. You can now log in using your credentials.</p>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log("Confirmation email sent successfully.");
    } catch (error) {
        console.error("Error sending confirmation email:", error);
        throw new AppError("Failed to send confirmation email.", 500, "EMAIL_SEND_ERROR");
    }
};


/// Resend OTP request
const requestOtp = async (req, res, next) => {
    const { email } = req.body;

    try {
        // Check if email is already verified
        const user = await User.findOne({ email });
        if (!user) {
            throw new AppError('User not found with this email.', 404, 'USER_NOT_FOUND');
        }
        if (user.isEmailVerified) {
            // Email is already verified, ask user to login with password or request new password
            return res.status(200).json({
                status: 'success',
                message: 'Email is already registered and verified. Please login with your password or request a new password.',
                login: true
            });
        }

        // Generate OTP code
        const otpCode = generateOTPCode();
        const verifyLink = `${process.env.CLIENT_URL}/verify-email/${otpCode}`;

        // Send OTP code to user's email
        await sendOtpEmail(email, otpCode, user.name);

        // Save OTP code in database with userId
        await OtpCode.create({ userId: user._id, code: otpCode, expiresAt: new Date(Date.now() + 30 * 60 * 1000) }); // expires in 30 minutes

        return res.status(200).json({
            status: 'success',
            message: 'OTP code sent to your email. Please verify your email.',
            otp: true
        });
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                status: 'failed',
                message: error.message,
                errorCode: error.errorCode,
                details: error.details
            });
        } else {
            console.error('Error while requesting OTP:', error);
            return res.status(500).json({
                status: 'failed',
                message: 'An error occurred while requesting OTP. Please try again.'
            });
        }
    }
};

const sendOtpEmail = async (email, otpCode, name) => {
    const verifyLink = `${process.env.CLIENT_URL}/verify-email/${otpCode}`;

    try {
        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: "OTP Code",
            html: `
                <h1>OTP Code</h1>
                <p>Dear ${name},</p>
                <p>Your OTP code is:</p>
                <h2>${otpCode}</h2>
                <p><a href="${verifyLink}">Verify Email</a></p>
                <p>This code will expire in 30 minutes.</p>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log("OTP email sent successfully.");
    } catch (error) {
        console.error("Error sending OTP email:", error);
        throw new AppError("Failed to send OTP email.", 500, "EMAIL_SEND_ERROR");
    }
};



const requestPasswordReset = async (req, res, next) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            throw new AppError('User not found with this email.', 404, 'USER_NOT_FOUND');
        }

        const otpCode = generateOTPCode();
        const resetLink = `${process.env.CLIENT_URL}/reset-password/${otpCode}`;

        await User.updateOne({ _id: user._id }, { $set: { otpCode } });

        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: "Password Reset",
            html: `
                <h1>Password Reset</h1>
                <p>Dear ${user.name},</p>
                <p>Please click the link below to reset your password:</p>
                <a href="${resetLink}">Reset Password</a>
                <p>Or enter the code manually: ${otpCode}</p>
            `,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            status: 'success',
            message: 'Password reset email sent successfully.',
        });
    } catch (error) {
        next(error);
    }
};

const resetPassword = async (req, res, next) => {
    // OTP code can come from query or body
    const otpCode = req.query.otpCode || req.body.otpCode;
    const email = req.body.email || req.query.email;
    const newPassword = req.body.newPassword;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            throw new AppError('User not found with this email.', 404, 'USER_NOT_FOUND');
        }

        if (user.otpCode !== otpCode) {
            throw new AppError('Invalid or expired OTP code.', 400, 'INVALID_OTP');
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user's password and clear OTP code
        await User.updateOne({ _id: user._id }, { $set: { password: hashedPassword, otpCode: null } });

        // Send success email
        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: "Password Changed Successfully",
            html: `
                <h1>Password Changed Successfully</h1>
                <p>Dear ${user.name},</p>
                <p>Your password has been changed successfully.</p>
                <p>If you did not make this change, please contact our support team immediately.</p>
            `,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            status: 'success',
            message: 'Password changed successfully. An email notification has been sent.',
        });
    } catch (error) {
        next(error);
    }
};






  /// login

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 1 * 60 * 60 * 1000; // 2 hours


// Login function
const login = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        // Validate email and password
        if (!email || !password) {
            throw new AppError('Email and password are required.', 400, 'VALIDATION_ERROR');
        }

        const user = await User.findOne({ email });
        if (!user) {
            throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
        }

        if (!user.isEmailVerified) {
            throw new AppError('Email is not verified. Please verify your email first.', 400, 'EMAIL_NOT_VERIFIED');
        }

        // Check if the user is locked
        const userSettings = await UserSettings.findOne({ userId: user._id });
        if (userSettings && userSettings.lockUntil && userSettings.lockUntil > Date.now()) {
            throw new AppError('Your account is locked. Please check your email for unlock instructions.', 403, 'ACCOUNT_LOCKED');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            await handleFailedLogin(user);
            throw new AppError('Invalid email or password.', 400, 'INVALID_CREDENTIALS');
        }

        // Clear login attempts on successful login
        if (user.loginAttempts > 0) {
            user.loginAttempts = 0;
            await user.save();
        }

            // Set account status to online
            user.accountStatus = 'online';
            await user.save()

        // Handle MFA if enabled
        if (userSettings && userSettings.mfaEnabled) {
            const otpCode = generateOTPCode();
            await OtpCode.create({ userId: user._id, code: otpCode, type: userSettings.mfaMethod, expiresAt: new Date(Date.now() + 10 * 60 * 1000) }); // Expires in 10 minutes

            if (userSettings.mfaMethod === 'email') {
                await send2mfaOtpEmail(email, otpCode, user.name);
            } else if (userSettings.mfaMethod === 'sms') {
                // Implement SMS sending logic here
            }

            return res.status(200).json({
                status: 'MFA_REQUIRED',
                message: 'Multi-factor authentication code sent. Please verify to proceed.',
                mfa: true,
            });
        }

        // Generate and send auth toke
        const authToken = generateAuthToken(user);
        setAuthTokenCookie(res, authToken);

        return res.status(200).json({
            status: 'success',
            message: 'Login successful.',
            authToken,
            appId: user.appId,
            name: user.name,
            status: user.accountStatus,
            loction: user.location,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            isPhoneVerified: user.isPhoneVerified,
        });
    } catch (error) {
        next(error);
    }
};

const handleFailedLogin = async (user) => {
    user.loginAttempts += 1;
    if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        const lockUntil = new Date(Date.now() + LOCK_TIME);
        await UserSettings.updateOne({ userId: user._id }, { lockUntil }, { upsert: true });
        await sendAccountLockedEmail(user.email, user.name);
    }
    await user.save();
};

const setAuthTokenCookie = (res, authToken) => {
    res.cookie('authToken', authToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
};

const generateAuthToken = (user) => {
    return jwt.sign({ userId: user._id }, process.env.JWT_SEC_KEY, { expiresIn: '1d' });
};


// Verify MFA function
const verifyMfa = async (req, res, next) => {
    const { userId, otpCode } = req.body;

    try {
        // Validate userId and OTP code
        if (!userId || !otpCode) {
            throw new AppError('User ID and OTP code are required.', 400, 'VALIDATION_ERROR');
        }

        const otp = await OtpCode.findOne({ userId, code: otpCode, expiresAt: { $gt: Date.now() } });
        if (!otp) {
            throw new AppError('Invalid or expired OTP code.', 400, 'INVALID_OTP');
        }

        // Delete the used OTP code
        await OtpCode.deleteOne({ _id: otp._id });

        // Generate and send auth token
        const user = await User.findById(userId);
        const authToken = generateAuthToken(user);
        setAuthTokenCookie(res, authToken);

        return res.status(200).json({
            status: 'success',
            message: 'MFA verified successfully.',
            authToken,
            appId: user.appId,
            name: user.name,
            status: user.accountStatus,
            loction: user.location,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            isPhoneVerified: user.isPhoneVerified,
        });
    } catch (error) {
        next(error);
    }
};


// Logout function
const logout = async (req, res, next) => {
    try {
        const { userId } = req.body;

        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
        }

        // Update account status to offline
        user.accountStatus = 'offline';
        await user.save();

        // Clear auth token cookie
        clearAuthTokenCookie(res);

        return res.status(200).json({
            status: 'success',
            message: 'Logout successful.'
        });
    } catch (error) {
        next(error);
    }
};






  
module.exports = { signupWithEmail, verifyEmail, addCurrentLocation, addDetails, requestOtp, requestPasswordReset, login, verifyMfa, logout, resetPassword  };


