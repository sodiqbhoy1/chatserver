const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin'); // Import the Customer model
const nodemailer = require('nodemailer');

const adminSignup = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    try {
        // Check if the email already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newAdmin = new Admin({
            firstName,
            lastName,
            email,
            password: hashedPassword // Save the hashed password
        });

        // Save the user
        await newAdmin.save();

        // Return a success message
        res.status(201).json({ message: 'Admin created successfully' });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const adminSignin = async (req, res) => {
    console.log('Login attempt received:', { email: req.body.email });
    
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            console.error('Missing required fields:', { email: !!email, password: !!password });
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Check if JWT_SECRET exists
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET environment variable is not configured');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        // Check if the admin email exists
        const existingAdmin = await Admin.findOne({ email });
        if (!existingAdmin) {
            console.log('Admin not found with email:', email);
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Check if the password is correct
        const isPasswordValid = await bcrypt.compare(password, existingAdmin.password);
        if (!isPasswordValid) {
            console.log('Invalid password for email:', email);
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Generate a token - trim JWT_SECRET to handle any whitespace
        const jwtSecret = process.env.JWT_SECRET ? process.env.JWT_SECRET.trim() : '';
        if (!jwtSecret) {
            console.error('JWT_SECRET is empty after trimming');
            return res.status(500).json({ error: 'Server configuration error' });
        }
        
        const token = jwt.sign(
            { userId: existingAdmin._id, email: existingAdmin.email },
            jwtSecret,
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        console.log('Login successful for:', email);
        
        // Return the token
        res.status(200).json({
            message: 'Signin successful',
            token: token
        });

    } catch (error) {
        // Log the full error details for debugging
        console.error('Error during signin:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            code: error.code
        });
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Forgot password
const adminForgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        if (!process.env.JWT_SECRET || !process.env.GMAIL_USER || !process.env.GMAIL_PASSWORD) {
            console.error('Environment variables are not properly configured.');
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Check if the admin email exists
        const existingAdmin = await Admin.findOne({ email });
        if (!existingAdmin) {
            return res.status(400).json({ error: 'Email not found' });
        }

        // Generate a password reset token - trim JWT_SECRET to handle any whitespace
        const jwtSecret = process.env.JWT_SECRET ? process.env.JWT_SECRET.trim() : '';
        if (!jwtSecret) {
            console.error('JWT_SECRET is empty after trimming');
            return res.status(500).json({ error: 'Server configuration error' });
        }
        
        const token = jwt.sign(
            { userId: existingAdmin._id, email: existingAdmin.email },
            jwtSecret,
            { expiresIn: '10m' } // Token expires in 10 minutes
        );

        // Save the token and expiration time
        existingAdmin.resetPasswordToken = token;
        existingAdmin.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

        await existingAdmin.save();

        // Send email with reset link
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASSWORD,
            }
        });
        
        const resetUrl = `${process.env.FRONTEND_URL}/admin/reset-password/${token}`;
        
        // Styled HTML email template
        const emailTemplate = `
          <div style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 16px; color: #333; background-color: #f7f7f7; padding: 50px 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
              <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eee;">
                <h1 style="font-size: 24px; color: #2c3e50; margin: 0;">ChatApp Password Reset</h1>
              </div>
              <div style="padding: 20px 0;">
                <p>Hello,</p>
                <p>You are receiving this email because you (or someone else) requested a password reset for your ChatApp account.</p>
                <p>Please click the button below to reset your password. This link is valid for 10 minutes.</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${resetUrl}" style="background-color: #3498db; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Your Password</a>
                </div>
                <p>If you did not request a password reset, please ignore this email and your password will remain unchanged.</p>
                <p>Thank you,<br>The ChatApp Team</p>
              </div>
              <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999;">
                <p>If you're having trouble with the button above, copy and paste the URL below into your web browser:</p>
                <p style="word-break: break-all;">${resetUrl}</p>
                <p>&copy; ${new Date().getFullYear()} ChatApp. All rights reserved.</p>
              </div>
            </div>
          </div>
        `;

        await transporter.sendMail({
            from: 'ChatApp <noreply@chatapp.com>',
            to: existingAdmin.email,
            subject: 'Reset Your ChatApp Password',
            html: emailTemplate,
            // Fallback for non-HTML clients
            text: `You are receiving this email because you (or someone else) requested a password reset for your ChatApp account.\n\n
              Please click on the following link to reset your password: ${resetUrl}\n\n
              If you did not request a password reset, please ignore this email and your password will remain unchanged.\n`
        });

        res.status(200).json({ message: 'Reset password email sent' });

    } catch (error) {
        console.error('Error sending forgot password email:', error);
        res.status(500).json({ error: 'Error sending mail' });
    }
};


// Reset password
// This function handles the password reset process
const AdminresetPassword = async (req, res) => {
    const { token } = req.params; // Get token from URL parameter
    const { newPassword } = req.body;

    try {
        if (!newPassword) {
            return res.status(400).json({ error: 'New password is required' });
        }

        // Verify token
        const user = await Admin.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ error: 'Token is invalid or expired' });
        }

        // Hash and update password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();
        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// get admin details

const adminDetails = async (req, res) => {
    try {
        // Check JWT_SECRET environment variable
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET environment variable is not configured');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'No token provided' });
        }
        
        const token = authHeader.split(' ')[1]; // Assuming the format is "Bearer <token>"
        
        try {
            // Trim JWT_SECRET to handle any whitespace
            const jwtSecret = process.env.JWT_SECRET ? process.env.JWT_SECRET.trim() : '';
            const decoded = jwt.verify(token, jwtSecret);
            const admin = await Admin.findById(decoded.userId).select('-password'); // Exclude password from the response
            
            if (!admin) {
                return res.status(404).json({ message: 'Admin not found' });
            }
            
            res.status(200).json(admin);
        } catch (jwtError) {
            // More specific error for token verification issues
            console.error('JWT verification error:', jwtError.message);
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
    } catch (error) {
        // Log the specific error message for debugging
        console.error('Error fetching admin details:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = { 
    signup: adminSignup, 
    signin: adminSignin, 
    forgotPassword: adminForgotPassword, 
    resetPassword: AdminresetPassword, 
    getProfile: adminDetails 
};
