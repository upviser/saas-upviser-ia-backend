import mongoose from 'mongoose'

const EmailSchema = new mongoose.Schema({
    tenantId: { type: String, required: true },
    address: { type: String, required: true },
    affair: { type: String, required: true },
    title: { type: String },
    paragraph: { type: String },
    buttonText: { type: String },
    url: { type: String },
    date: { type: Date, required: true }
}, {
    timestamps: true
})

const Email = mongoose.models.Email || mongoose.model('Email', EmailSchema)

export default Email