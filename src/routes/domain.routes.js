import { Router } from 'express'
import { editDomain, getDomain } from '../controllers/domain.controllers.js'

const router = Router()

router.put('/domain', editDomain)

router.get('/domain', getDomain)

export default router