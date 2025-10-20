import ClientData from '../models/ClientData.js'

export const createtData = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const newData = new ClientData({tenantId, name: req.body.data, data: req.body.data.toLowerCase().replace(/ /g, '_')})
        const newDataSave = await newData.save()
        return res.json(newDataSave)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getData = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const data = await ClientData.find({ tenantId }).lean()
        return res.json(data)
    } catch {
        return res.status(500).json({message: error.message})
    }
}