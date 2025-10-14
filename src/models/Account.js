import mongoose from 'mongoose'

const AccountSchema = new mongoose.Schema({
    tenantId: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, required: true, unique: true },
    phone: { type: Number },
    password: { type: String, required: true, select: false },
    cart: { type: Array },
    address: { type: String },
    number: { type: Number },
    details: { type: String },
    city: { type: String },
    region: { type: String }
}, {
    timestamps: true
})

const Account = mongoose.models.Account || mongoose.model('Account', AccountSchema)

export default Account