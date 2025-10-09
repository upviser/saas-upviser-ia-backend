import { Router } from 'express'
import { createToken, redirectZoom, removeZoom } from '../controllers/zoom.controllers.js'

const router = Router()

router.get('/zoom-token', createToken)

router.get('/auth/zoom', redirectZoom)

router.get('/remove-zoom', removeZoom)

export default router