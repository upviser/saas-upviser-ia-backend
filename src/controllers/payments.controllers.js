import Payment from '../models/Payment.js'

export const createPayment = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const payment = await Payment.findOne({ tenantId })
        if (payment) {
            const paymentEdit = await Payment.findByIdAndUpdate(req.body._id, req.body, { new: true })
            return res.json(paymentEdit)
        } else {
            const newPayment = new Payment({...req.body, tenantId})
            const newPaymentSave = await newPayment.save()
            return res.json(newPaymentSave)
        }
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getPayment = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const payment = await Payment.findOne({ tenantId })
        return res.json(payment)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}