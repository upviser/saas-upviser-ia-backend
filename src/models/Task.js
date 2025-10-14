import mongoose from 'mongoose'

const TaskSchema = new mongoose.Schema({
    tenantId: { type: String, required: true },
    dateCron: { type: String },
    subscriber: { type: String },
    subscribers: [{ type: String }],
    automatizationId: { type: String },
    startType: { type: String },
    startValue: { type: String },
    emailData: { affair: { type: String }, title: { type: String }, paragraph: { type: String }, buttonText: { type: String }, url: { type: String } },
    condition: [{ type: String }]
}, {
    timestamps: true
})

const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema)

export default Task