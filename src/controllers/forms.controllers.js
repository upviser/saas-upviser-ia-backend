import Form from '../models/Form.js'

export const createForm = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const newForm = new Form({...req.body, tenantId})
        const newFormSave = await newForm.save()
        return res.json(newFormSave)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getForms = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const forms = await Form.find({ tenantId }).lean()
        return res.json(forms)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getForm = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const form = await Form.findById(req.params.id)
        return res.json(form)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const editForm = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const formEdit = await Form.findByIdAndUpdate(req.params.id, req.body, { new: true })
        return res.json(formEdit)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const deteleFotm = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const formDelete = await Form.findByIdAndDelete(req.params.id)
        return res.send(formDelete)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}