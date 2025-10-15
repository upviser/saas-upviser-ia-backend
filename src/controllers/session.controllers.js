import Session from '../models/Session.js'

export const createSession = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const newSession = new Session({...req.body, tenantId})
        const newSessionSave = await newSession.save()
        return res.json(newSessionSave)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getSessions = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const sessions = await Session.find({ tenantId })
        return res.json(sessions)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}