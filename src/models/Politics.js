import mongoose from 'mongoose'

const PoliticsSchema = new mongoose.Schema({
    tenantId: { type: String, required: true },
    terms: { type: String },
    privacy: { type: String },
    devolutions: { type: String },
    shipping: { type: String },
    pay: { type: String }
}, {
    timestamps: true
})

const Politics = mongoose.models.Politics || mongoose.model('Politics', PoliticsSchema)

export default Politics