import mongoose from 'mongoose'

const InformationSchema = mongoose.Schema({
  tenantId: { type: String, required: true },
  cart: { type: Array, required: true }
}, {
  timestamps: true
})

const Information = mongoose.models.Inrformation || mongoose.model('Information', InformationSchema)

export default Information