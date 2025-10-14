import Funnel from '../models/Funnel.js'
import mongoose from 'mongoose'

export const createFunnel = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const funnel = await Funnel.findOne({ funnel: req.body.funnel })
        if (funnel) {   
            const editFunnel = new Funnel({...req.body, tenantId})
            const editFunnelSave = await Funnel.findByIdAndUpdate(funnel._id, editFunnel, { new: true })
            return res.json(editFunnelSave)
        } else {
            const newFunnel = new Funnel({...req.body, tenantId})
            const newFunnelSave = await newFunnel.save()
            return res.json(newFunnelSave)
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const getFunnels = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const funnels = await Funnel.find({ tenantId }).lean()
        return res.json(funnels)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getFunnel = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const funnel = await Funnel.findById(req.params.id)
        return res.json(funnel)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getFunnelSlug = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const funnel = await Funnel.findOne({ tenantId, slug: req.params.slug })
        return res.json(funnel)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getStepSlug = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const funnel = await Funnel.findOne({ tenantId, slug: req.params.funnel })
        const step = funnel.steps.find(step => step.slug === req.params.step)
        return res.json(step)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const editFunnel = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const edit = await Funnel.findByIdAndUpdate(req.params.id, req.body, { new: true })
        return res.json(edit)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const deleteFunnel = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const funnelDelete = await Funnel.findByIdAndDelete(req.params.id)
        return res.json(funnelDelete)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const updateAllFunnels = async (req, res) => {
    const tenantId = req.headers['x-tenant-id']
  const funnels = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    for (const funnel of funnels) {
      await Funnel.updateOne(
        { _id: funnel._id },
        {
          $set: {
            funnel: funnel.funnel,
            description: funnel.description,
            slug: funnel.slug,
            steps: funnel.steps
          }
        },
        { session, upsert: true }
      );
    }

    await session.commitTransaction();
    session.endSession();
    return res.status(200).json({ message: 'All funnels updated successfully' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ message: error.message });
  }
}

export const updateStep = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const { _id, ...updatedData } = req.body;

        // Encuentra el documento Funnel que contiene el paso a actualizar
        const funnelToUpdate = await Funnel.findOne({ _id: req.params.id, "steps._id": _id });

        if (!funnelToUpdate) {
            return res.status(404).json({ message: "Step not found" });
        }

        // Encuentra el paso específico dentro del array de steps
        const step = funnelToUpdate.steps.id(_id);

        // Actualiza manualmente los campos que necesitas
        Object.assign(step, updatedData);
        step.updatedAt = new Date(); // Actualiza la fecha manualmente

        // Guarda el documento Funnel actualizado
        await funnelToUpdate.save();

        return res.json(funnelToUpdate);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const getFunnelStep = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const funnels = await Funnel.find({ tenantId }).lean()
        const funnel = funnels.find(funnel => req.params.id.includes(funnel.slug))
        const step = funnel.steps.find(step => req.params.id.includes(step.slug))
        return res.json({ funnel, step })
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const getFunnelByStep = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const funnels = await Funnel.find({ tenantId }).lean()
        const funnel = funnels.find(funnel => 
            funnel.steps.some(step => step.slug === req.params.id)
        );
        if (!funnel) {
            return res.json({ message: 'Funnel not found' });
        }
        return res.json(funnel.funnel)
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const getFunnelByName = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const funnel = await Funnel.findOne({ tenantId, funnel: req.params.funnel }).lean()
        return res.json(funnel)
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}