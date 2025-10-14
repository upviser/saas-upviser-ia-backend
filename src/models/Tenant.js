import mongoose from 'mongoose'

const TenantSchema = new mongoose.Schema({
    tenantId: { type: String, required: true },
    domain: { type: String }
}, {
    timestamps: true
})

const Tenant = mongoose.models.Tenant || mongoose.model('Tenant', TenantSchema)

export default Tenant