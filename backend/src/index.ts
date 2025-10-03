import express, { Application, Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes";
import taskRoutes from "./routes/taskRoutes";
import { protect } from "./middleware/auth";
import User from "./models/User";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ credentials: true, origin: ["http://localhost:3000"] }));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("This is the backend for AgentX.");
});

app.use("/api/auth", authRoutes);

app.use("/api/tasks", taskRoutes);

app.get("/api/dashboard", protect, async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: "Welcome to your dashboard", user, role: user.role });
  } catch (error) {
    console.error('Error fetching user for dashboard route:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

mongoose.connect(process.env.MONGO_URI as string)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error(err));
