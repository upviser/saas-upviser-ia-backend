import mongoose from 'mongoose'

const PageSchema = new mongoose.Schema({
    tenantId: { type: String, required: true },
    page: { type: String },
    funnel: { type: String },
    step: { type: String },
    service: { type: String },
    stepService: { type: String }
}, {
    timestamps: true
})

const Page = mongoose.models.Page || mongoose.model('Page', PageSchema)

export default Page