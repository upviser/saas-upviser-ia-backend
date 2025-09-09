import { Router } from 'express'
import { editDomain } from '../controllers/domain.controllers.js'

const router = Router()

router.put('/domain', editDomain)

export default router