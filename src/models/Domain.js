import mongoose from 'mongoose'

const DomainSchema = new mongoose.Schema({
    domain: { type: String, required: true }
}, {
    timestamps: true
})

const Domain = mongoose.models.Domain || mongoose.model('Domain', DomainSchema)

export default Domain