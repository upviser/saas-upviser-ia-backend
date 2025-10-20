import { Router } from 'express'
import { createTenant, deleteTenant, editTenant, getTenants, getTenant, getTenantByHostname } from '../controllers/tenant.controllers.js'

const router = Router()

router.post('/tenant', createTenant)

router.get('/tenants', getTenants)

router.get('/tenant/:tenantId', getTenant)

router.get('/tenant-hostname/:hostname', getTenantByHostname)

router.put('/tenant/:tenantId', editTenant)

router.delete('/tenant/:tenantId', deleteTenant)

export default router