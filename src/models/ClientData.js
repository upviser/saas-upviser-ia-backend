import mongoose from 'mongoose'

const ClientDataSchema = new mongoose.Schema({
    tenantId: { type: String, required: true },
    name: { type: String },
    data: { type: String }
}, {
    timestamps: true
})

const ClientData = mongoose.models.ClientData || mongoose.model('ClientData', ClientDataSchema)

export default ClientData