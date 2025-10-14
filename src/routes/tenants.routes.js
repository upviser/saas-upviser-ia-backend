import { Router } from 'express'
import { createTenant, deleteTenant, editTenant, getTenants, getTenant } from '../controllers/tenant.controllers.js'

const router = Router()

router.post('/tenant', createTenant)

router.get('/tenants', getTenants)

router.get('/tenant/:tenant', getTenant)

router.put('/tenant/:tenant', editTenant)

router.delete('/tenant/:tenant', deleteTenant)

export default router