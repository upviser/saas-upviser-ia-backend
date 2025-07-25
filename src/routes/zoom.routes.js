import { Router } from 'express'
import { createToken, redirectZoom } from '../controllers/zoom.controllers.js'

const router = Router()

router.get('/zoom-token', createToken)

router.get('/auth/zoom', redirectZoom)

export default router