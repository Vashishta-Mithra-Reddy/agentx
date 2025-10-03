import { Request, Response } from "express";
import { Task, DistributedTask } from "../models/Task";
import mongoose from "mongoose";
import User from "../models/User";
import multer from "multer";
import csv from "csv-parser";
import * as XLSX from "xlsx";
import stream from "stream";

// multer config
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "text/csv", //csv
      "application/vnd.ms-excel", // .xls
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    ];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only CSV, XLS, XLSX files are allowed"));
  },
}).single("file");

// ---------- Upload + Save + Distribute ----------
export const uploadTasks = async (req: Request, res: Response) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const agents = await User.find({ role: "agent", active: true });
    if (agents.length === 0)
      return res
        .status(400)
        .json({ message: "No agents available to distribute tasks" });

    let tasks: any[] = [];
    const fileBuffer = req.file.buffer;

    try {
      // -------- Parse CSV --------
      if (
        req.file.mimetype === "text/csv" ||
        req.file.mimetype === "application/vnd.ms-excel"
      ) {
        const bufferStream = new stream.PassThrough();
        bufferStream.end(fileBuffer);

        bufferStream
          .pipe(csv())
          .on("data", (data: any) => tasks.push(data))
          .on("end", async () => {
            if (!validateTasks(tasks, res)) return;
            await saveAndDistribute(tasks, agents, res);
          });
      } else {
        // -------- Parse XLSX --------
        const workbook = XLSX.read(fileBuffer, { type: "buffer" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        tasks = XLSX.utils.sheet_to_json(sheet);
        if (!validateTasks(tasks, res)) return;
        await saveAndDistribute(tasks, agents, res);
      }
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Error processing file", error: error.message });
    }
  });
};

// ---------- Validate ----------
const validateTasks = (tasks: any[], res: Response): boolean => {
  if (!tasks || tasks.length === 0) {
    res.status(400).json({ message: "File is empty or invalid" });
    return false;
  }

  const requiredFields = ["FirstName", "Phone", "Notes"];
  const hasAllFields = requiredFields.every((f) =>
    Object.keys(tasks[0]).includes(f)
  );

  if (!hasAllFields) {
    res.status(400).json({
      message: `Invalid format. Required columns: ${requiredFields.join(", ")}`,
    });
    return false;
  }
  return true;
};

// ---------- Save in DB then Distribute ----------
const saveAndDistribute = async (tasks: any[], agents: any[], res: Response) => {
  try {
    // Step 1: Save all tasks into Task collection
    const insertedTasks = await Task.insertMany(
      tasks.map((task) => ({
        firstName: task.FirstName,
        phone: task.Phone,
        notes: task.Notes,
      }))
    );

    // Step 2: Get the IDs of inserted tasks
    const taskIds = insertedTasks.map((t) => t._id);

    // Step 3: Distribute IDs among agents (equal distribution first then round robin for remainder)
    const distributedTasks: { [key: string]: any } = {};
    agents.forEach((agent) => {
      distributedTasks[agent._id.toString()] = new DistributedTask({
        agentId: agent._id,
        tasks: [],
        uploadDate: new Date(),
      });
    });

    const numAgents = agents.length;
    const numTasks = taskIds.length;
    const baseTasksPerAgent = Math.floor(numTasks / numAgents);
    let remainingTasksCount = numTasks % numAgents;
    let taskIndex = 0;

    // Distribute baseTasksPerAgent to each agent
    for (let i = 0; i < numAgents; i++) {
      const agentId = agents[i]._id.toString();
      for (let j = 0; j < baseTasksPerAgent; j++) {
        if (taskIndex < numTasks) {
          distributedTasks[agentId].tasks.push(taskIds[taskIndex]);
          taskIndex++;
        }
      }
    }

    // Round-robin the remaining tasks
    for (let i = 0; i < remainingTasksCount; i++) {
      const agentId = agents[i % numAgents]._id.toString();
      if (taskIndex < numTasks) {
        distributedTasks[agentId].tasks.push(taskIds[taskIndex]);
        taskIndex++;
      }
    }

    // Step 4: Save distributed tasks
    const savedDistributedTasks = await Promise.all(
      Object.values(distributedTasks).map((dt) => dt.save())
    );

    res.status(200).json({
      message: "Tasks distributed successfully",
      savedDistributedTasks,
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error saving tasks", error: error.message });
  }
};

// ---------- Get Agent Tasks ----------
export const getAgentTasks = async (req: Request, res: Response) => {
  try {
    const agentId = (req as any).userId; // from auth middleware

    // Find all distributed tasks for this agent, sorted by uploadDate (newest first)
    const agentTasks = await DistributedTask.find({ agentId }).populate("tasks").sort({uploadDate: -1});
    
    res.status(200).json(agentTasks);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error fetching agent tasks", error: error.message });
  }
};

// ---------- Update Task Status ----------
export const updateTaskStatus = async (req: Request, res: Response) => {
  try {
    const taskId = req.params.id;
    const { completed } = req.body;
    const agentId = (req as any).userId;

    // Ensure agent actually owns this task
    const distDoc = await DistributedTask.findOne({ agentId, tasks: new mongoose.Types.ObjectId(taskId) });
    if (!distDoc)
      return res
        .status(403)
        .json({ message: "Task not found or not assigned to this agent" });

    // Update in Task collection
    const task = await Task.findByIdAndUpdate(
      taskId,
      { completed },
      { new: true }
    );

    if (!task) return res.status(404).json({ message: "Task not found" });

    res.status(200).json({ message: "Task updated successfully", task });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error updating task status", error: error.message });
  }
};
