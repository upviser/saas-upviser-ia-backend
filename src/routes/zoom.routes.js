import { Router } from 'express'
import { createToken, redirectZoom, removeZoom, zoomCallback} from '../controllers/zoom.controllers.js'

const router = Router()

router.get('/zoom-token', createToken)

router.get('/auth/zoom', redirectZoom)

router.get('/zoom/callback', zoomCallback)

router.get('/remove-zoom', removeZoom)

export default router