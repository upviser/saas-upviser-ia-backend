import mongoose from 'mongoose'

const ClientTagSchema = mongoose.Schema({
  tenantId: { type: String, required: true },
  tag: { type: String, required: true, unique: true }
}, {
  timestamps: true
})

const ClientTag = mongoose.models.ClientTag || mongoose.model('ClientTag', ClientTagSchema)

export default ClientTag