import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'asdfsdbgerw4fecdsve';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'cwvf3rsdvr3vweafr3rw';

const generateTokens = (user: IUser) => {
  const accessToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: user._id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, mobileNumber, countryCode } = req.body;
    const user = new User({ name, email, password, mobileNumber, countryCode, role: 'agent', active: false });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const { accessToken, refreshToken } = generateTokens(user);
    res.cookie('accessToken', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
    res.json({ message: 'Logged in successfully', role: user.role });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const refresh = async (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    const { accessToken, refreshToken } = generateTokens(user);
    res.cookie('accessToken', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
    res.json({ message: 'Token refreshed successfully', role: user.role });
  } catch (error: any) {
    return res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logged out successfully' });
};

export const verify = async (req: Request, res: Response) => {
  const accessToken = req.cookies.accessToken;
  if (!accessToken) {
    return res.status(401).json({ message: 'No access token provided' });
  }

  try {
    const decoded: any = jwt.verify(accessToken, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.json({ user: { id: user._id, role: user.role } });
  } catch (error: any) {
    return res.status(403).json({ message: 'Invalid or expired access token' });
  }
};

export const addAgent = async (req: Request, res: Response) => {
  try {
    const { name, email, password, mobileNumber, countryCode } = req.body;
    const user = new User({ name, email, password, mobileNumber, countryCode, role: 'agent', active: true });
    await user.save();
    res.status(201).json({ message: 'Agent added successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};