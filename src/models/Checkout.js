import mongoose from 'mongoose'

const CheckoutSchema = new mongoose.Schema({
    tenantId: { type: String, required: true },
    page: { type: String },
    funnel: { type: String },
    step: { type: String },
    service: { type: String },
    stepService: { type: String },
    typeService: { type: String },
    typePrice: { type: String },
    plan: { type: String },
    price: { type: String }
}, {
    timestamps: true
})

const Checkout = mongoose.models.Checkout || mongoose.model('Checkout', CheckoutSchema)

export default Checkout