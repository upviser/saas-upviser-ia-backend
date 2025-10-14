import Tag from '../models/Tag.js'

export const createTag = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const {tag} = req.body
        const newTag = new Tag({tenantId, tag: tag})
        await newTag.save()
        return res.json(newTag)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getTags = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const tags = await Tag.find({ tenantId })
        return res.json(tags)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}