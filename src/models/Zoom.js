import mongoose from 'mongoose'

const ZoomSchema = new mongoose.Schema({
    tenantId: { type: String, required: true },
    access_token: { type: String },
    expires_in: { type: Number }
}, {
    timestamps: true
})

const Zoom = mongoose.models.Zoom || mongoose.model('Zoom', ZoomSchema)

export default Zoom