import Notification from '../models/Notification.js'

export const createNotification = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const newNotification = new Notification({...req.body, tenantId})
        await newNotification.save()
        return res.send(newNotification)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getNotifications = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const notifications = await Notification.find({ tenantId }).sort({ _id: -1 }).lean()
        return res.send(notifications)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getUltimateNotifications = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const ultimateNotifications = await Notification.find({ tenantId }).sort({ _id: -1 }).limit(10).lean()
        return res.send(ultimateNotifications)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const viewNotification = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const notification = await Notification.findByIdAndUpdate(req.params.id, { view: true }, { new: true })
        return res.send(notification)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}