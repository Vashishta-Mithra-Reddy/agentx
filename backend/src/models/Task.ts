import mongoose, { Document, Schema } from "mongoose";

export interface ITask extends Document {
  firstName: string;
  phone: string;
  notes: string;
  completed: boolean;
}

export interface IDistributedTask extends Document {
  agentId: mongoose.Schema.Types.ObjectId;
  tasks: mongoose.Schema.Types.ObjectId[];
  uploadDate: Date;
}

const TaskSchema: Schema = new Schema({
  firstName: { type: String, required: true },
  phone: { type: String, required: true },
  notes: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const DistributedTaskSchema: Schema = new Schema({
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
  uploadDate: { type: Date, default: Date.now },
});

const Task = mongoose.model<ITask>("Task", TaskSchema);
const DistributedTask = mongoose.model<IDistributedTask>(
  "DistributedTask",
  DistributedTaskSchema
);

export { Task, DistributedTask };
