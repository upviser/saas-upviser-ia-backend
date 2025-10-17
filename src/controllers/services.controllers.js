import Service from '../models/Service.js'

export const createService = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const newService = new Service({...req.body, tenantId})
        const newServiceSave = await newService.save()
        return res.json(newServiceSave)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getServices = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const services = await Service.find({ tenantId })
        return res.json(services)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getService = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const service = await Service.findById(req.params.id)
        return res.json(service)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const editService = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const serviceEdit = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true })
        return res.json(serviceEdit)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const deleteService = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const serviceDelete = await Service.findByIdAndDelete(req.params.id)
        return res.json(serviceDelete)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const updateServiceStep = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const { _id, ...updatedData } = req.body;

        // Encuentra el documento Funnel que contiene el paso a actualizar
        const serviceToUpdate = await Service.findOne({ _id: req.params.id, "steps._id": _id });

        if (!serviceToUpdate) {
            return res.status(404).json({ message: "Step not found" });
        }

        // Encuentra el paso específico dentro del array de steps
        const step = serviceToUpdate.steps.id(_id);

        // Actualiza manualmente los campos que necesitas
        Object.assign(step, updatedData);
        step.updatedAt = new Date(); // Actualiza la fecha manualmente

        // Guarda el documento Funnel actualizado
        await serviceToUpdate.save();

        return res.json(serviceToUpdate);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}