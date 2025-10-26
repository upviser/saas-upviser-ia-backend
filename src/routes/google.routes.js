import { Router } from 'express'
import { googleAuth, googleAuthCallback } from '../controllers/google.controllers.js'

const router = Router()

router.get('/google-auth', googleAuth)

router.get('/google-auth-callback', googleAuthCallback)

export default router