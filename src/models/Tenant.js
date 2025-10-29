import mongoose from 'mongoose'

const TenantSchema = new mongoose.Schema({
    tenantId: { type: String, required: true },
    domain: { type: String },
    instagramState: { type: String },
    instagramId: { type: String },
    messengerId: { type: String },
    whatsappId: { type: String },
    googleState: { type: String },
    zoomState: { type: String }
}, {
    timestamps: true
})

const Tenant = mongoose.models.Tenant || mongoose.model('Tenant', TenantSchema)

export default Tenant