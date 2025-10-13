import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { DistributedTask } from '../models/Task';

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

export const addSubAgent = async (req: Request, res: Response) => {
  try {
    const agentId = (req as any).userId;
    const { name, email, password, mobileNumber, countryCode } = req.body;
    
    const user = new User({ name, email, password, mobileNumber, countryCode, role: 'subagent', active: true, creatorId: agentId });
    await user.save();
    res.status(201).json({ message: 'Sub Agent added successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const listAgents = async(req: Request, res: Response) =>{
  try{
    const agents = await User.find({ role: 'agent' }).select('-password').lean();

    const agentsWithTasks = await Promise.all(agents.map(async (agent) => {
      const distributedTasks = await DistributedTask.find({ agentId: agent._id }).populate('tasks');
      const tasks = distributedTasks.flatMap(dt => dt.tasks);
      // console.log(tasks);
      return { ...agent, tasks };
    }));

    res.status(200).json(agentsWithTasks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export const listSubAgents = async(req: Request, res: Response) =>{
  try{
    const agentId = (req as any).userId;
    const agents = await User.find({ role: 'subagent',creatorId: agentId }).select('-password').lean();

    const agentsWithTasks = await Promise.all(agents.map(async (agent) => {
      const distributedTasks = await DistributedTask.find({ agentId: agent._id }).populate('tasks');
      const tasks = distributedTasks.flatMap(dt => dt.tasks);
      // console.log(tasks);
      return { ...agent, tasks };
    }));

    res.status(200).json(agentsWithTasks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export const deleteAgent = async(req: Request, res: Response) =>{
  try{
  const { id } = req.params;
  await DistributedTask.deleteMany({ agentId: id });
  await User.deleteOne({_id:id});
  res.status(200).json({ message: 'Agent deleted successfully' });
  }catch(error:any) {
    res.status(500).json({ error: error.message });
  }
}

export const updateAgent = async(req: Request, res: Response) =>{
  // console.log("request is coming in");
  try{
    const { id } = req.params;
    const { name, email, mobileNumber, countryCode, active } = req.body;

    const agent = await User.findByIdAndUpdate(id, { name, email, mobileNumber, countryCode, active }, { new: true });

    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    res.status(200).json({ message: 'Agent updated successfully', agent });
  }catch(error:any) {
    res.status(500).json({ error: error.message });
  }
}