import mongoose from 'mongoose'

const ChilexpressSchema = new mongoose.Schema({
    tenantId: { type: String, required: true },
    active: { type: Boolean },
    coberturaKey: { type: String },
    cotizadorKey: { type: String },
    enviosKey: { type: String },
    cardNumber: { type: Number }
}, {
    timestamps: true
})

const Chilexpress = mongoose.models.Chilexpress || mongoose.model('Chilexpress', ChilexpressSchema)

export default Chilexpress