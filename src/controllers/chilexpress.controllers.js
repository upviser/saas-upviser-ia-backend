import Chilexpress from '../models/Chilexpress.js'

export const createChilexpress = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const chilexpress = await Chilexpress.findOne({ tenantId }).lean()
        if (chilexpress) {
            const edit = await Chilexpress.findByIdAndUpdate(chilexpress.id, req.body, { new: true })
            return res.send(edit)
        } else {
            const create = new Chilexpress({ ...req.body, tenantId })
            const createSave = await create.save()
            return res.send(createSave)
        }
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export const editChilexpress = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const edit = await Chilexpress.findByIdAndUpdate(req.params.id, req.body, { new: true })
        return res.send(edit)
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export const getChilexpress = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const chilexpress = await Chilexpress.findOne({ tenantId }).lean()
        if (!chilexpress) return res.send({ message: 'Not Found' })
        return res.send(chilexpress)
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}