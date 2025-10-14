import Integrations from '../models/Integrations.js'

export const createIntegrations = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const integrations = await Integrations.findOne({ tenantId }).lean()
        if (integrations) {
            const updateIntegrations = await Integrations.findByIdAndUpdate(integrations._id, req.body, { new: true })
            return res.json(updateIntegrations)
        } else {
            const newIntegrations = new Integrations({...req.body, tenantId})
            const newIntegrationsSave = await newIntegrations.save()
            return res.json(newIntegrationsSave)
        }
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getIntegrations = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const integrations = await Integrations.findOne({ tenantId }).lean()
        return res.json(integrations)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}