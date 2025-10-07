import mongoose from 'mongoose'

const ShopLoginSchema = new mongoose.Schema({
    name: { type: String },
    email: { type: String, required: true },
    password: { type: String, required: true, select: false },
    type: { type: String, required: true },
    permissions: [{ type: String }],
    plan: { type: String },
    textAI: { type: Number },
    imagesAI: { type: Number },
    videosAI: { type: Number },
    conversationsAI: { type: Number },
    emails: { type: Number },
    textAIAdd: { type: Number },
    imagesAIAdd: { type: Number },
    videosAIAdd: { type: Number },
    conversationsAIAdd: { type: Number },
    emailsAdd: { type: Number }
}, {
    timestamps: true
})

const ShopLogin = mongoose.models.ShopLogin || mongoose.model('ShopLogin', ShopLoginSchema)

export default ShopLogin