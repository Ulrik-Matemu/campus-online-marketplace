import { Request, Response } from 'express';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendEmail } from '../utils/sendEmail';

export const register = async (req: Request, res: Response) => {
  const { email, password, name, registrationNumber, phoneNumber, campus } = req.body;

  // 1. Create a random token
  const verificationToken = crypto.randomBytes(20).toString('hex');

  // 2. Create the user
  const user = await User.create({
    email,
    password,
    name,
    registrationNumber,
    phoneNumber,
    campus,
    verificationToken
  });

  // 3. Send the email
  const verifyUrl = `http://localhost:3000/api/v1/auth/verify/${verificationToken}`;
  const message = `Welcome to the Campus Marketplace! Please verify your account by clicking: ${verifyUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Email Verification',
      message
    });

    res.status(201).json({ message: 'Registration successful! Please check your email to verify your account.' });
  } catch (err) {
    user.verificationToken = undefined;
    await user.save();
    res.status(500).json({ message: 'Email could not be sent' });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    // Find the user with this verification token
    const user = await User.findOne({ verificationToken: token });  

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    // Update user status
    user.isVerified = true;
    user.verificationToken = undefined; // Clear the token after use
    await user.save();

    // In a real app, you might redirect to your frontend login page here
    res.status(200).json({ 
      message: 'Email verified successfully! You can now log in.' 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during verification', error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1. Find user and explicitly include password (if you used 'select: false' in schema)
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 2. Check if the password is correct
    const isMatch = await (user as any).comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 3. BLOCK LOGIN if not verified (Functional Requirement)
    if (!user.isVerified) {
      return res.status(403).json({ 
        message: 'Your email is not verified. Please check your inbox.' 
      });
    }

    // 4. Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role }, // Payload includes role for RBAC
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '1d' }
    );

    // 5. Respond with user data and token
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        campus: user.campus
      },
      message: "Login Successful"
    });
  } catch (error) {
    res.status(500).json({ message: 'Login error', error });
  }
};

