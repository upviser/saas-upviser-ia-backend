import Tenant from '../models/Tenant.js'

export const createTenant = async (req, res) => {
    try {
        const newTenant = new Tenant(req.body)
        const newTenantSave = await newTenant.save()
        return res.json(newTenantSave)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getTenants = async (req, res) => {
    try {
        const tenants = await Tenant.find().lean()
        return res.json(tenants)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getTenant = async (req, res) => {
    try {
        const tenant = await Tenant.findOne({ tenantId: req.params.id }).lean()
        return res.json(tenant)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const editTenant = async (req, res) => {
    try {
        const editTenant = await Tenant.findOneAndUpdate( { tenantId: req.params.tenantId }, req.body, { new: true } )
        return res.json(editTenant)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const deleteTenant = async (req, res) => {
    try {
        const deleteTenant = await Tenant.findOneAndDelete({ tenantId: req.params.tenantId })
        return res.json(deleteTenant)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}