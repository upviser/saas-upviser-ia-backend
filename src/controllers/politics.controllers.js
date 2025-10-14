import Politics from '../models/Politics.js'

export const createPolitics = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const data = await Politics.findOne({ tenantId }).lean()
        if (data) {
            await Politics.findOneAndDelete(data._id)
        }
        const newPolitics = new Politics({...req.body, tenantId})
        await newPolitics.save()
        return res.send(newPolitics)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getPolitics = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const politics = await Politics.findOne({ tenantId }).lean()
        if (!politics) return res.json({})
        return res.json(politics)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getPolitic = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const politic = await Politics.findOne({ tenantId }).select(`${req.params.id}`).lean()
        if (!politic) return res.sendStatus(204)
        return res.send(politic)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}