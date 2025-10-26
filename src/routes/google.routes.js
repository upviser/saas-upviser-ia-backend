import { Router } from 'express'
import { googleAuth, googleAuthCallback, removeGoogle } from '../controllers/google.controllers.js'

const router = Router()

router.get('/google-auth', googleAuth)

router.get('/google-auth-callback', googleAuthCallback)

router.get('/remove-google', removeGoogle)

export default router