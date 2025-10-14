import mongoose from 'mongoose'

const ContactSchema = new mongoose.Schema({
  tenantId: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  images: [{ type: String }]
}, {
  timestamps: true
})

const Contact = mongoose.models.Contact || mongoose.model('Contact', ContactSchema)

export default Contact