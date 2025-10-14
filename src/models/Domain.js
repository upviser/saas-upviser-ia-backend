import mongoose from 'mongoose'

const DomainSchema = new mongoose.Schema({
    tenantId: { type: String, required: true },
    domain: { type: String, required: true },
    name: { type: String },
    email: { type: String },
    dkim1: { type: { type: String }, value: { type: String }, hostname: { type: String } },
    dkim2: { type: { type: String }, value: { type: String }, hostname: { type: String } },
    brevo: { type: { type: String }, value: { type: String }, hostname: { type: String } },
    dmarc: { type: { type: String }, value: { type: String }, hostname: { type: String } }
}, {
    timestamps: true
})

const Domain = mongoose.models.Domain || mongoose.model('Domain', DomainSchema)

export default Domain