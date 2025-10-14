import ClientTag from '../models/ClientTag.js'

export const createTag = async (req, res) => {
  try {
    const tenantId = req.headers['x-tenant-id']
    const newClientTag = new ClientTag({...req.body, tenantId})
    await newClientTag.save()
    return res.json(newClientTag)
  } catch (error) {
    return res.status(500).json({message: error.message})
  }
}

export const getTags = async (req, res) => {
  try {
    const tenantId = req.headers['x-tenant-id']
    const clientTags = await ClientTag.find({ tenantId }).lean()

    if (!clientTags) {
      return undefined
    }

    return res.json(clientTags)
  } catch (error) {
    return res.status(500).json({message: error.message})
  }
}