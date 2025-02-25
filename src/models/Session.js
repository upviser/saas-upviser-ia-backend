import mongoose from 'mongoose'

const SessionSchema = mongoose.Schema({
    page: { type: String },
    funnel: { type: String },
    step: { type: String },
    service: { type: String },
    stepService: { type: String }
}, {
    timestamps: true
})

const Session = mongoose.models.Session || mongoose.model('Session', SessionSchema)

export default Session