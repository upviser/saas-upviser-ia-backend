import mongoose from 'mongoose'

const NotificationSchema = mongoose.Schema({
    tenantId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    url: { type: String, required: true },
    view: { type: Boolean }
}, {
    timestamps: true
})

const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema)

export default Notification