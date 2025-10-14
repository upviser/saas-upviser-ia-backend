import mongoose from 'mongoose'

const ChatTagSchema = mongoose.Schema({
    tenantId: { type: String, required: true },
    tag: { type: String },
    color: { type: String }
}, {
    timestamps: true
})

const ChatTag = mongoose.models.ChatTag || mongoose.model('ChatTag', ChatTagSchema)

export default ChatTag