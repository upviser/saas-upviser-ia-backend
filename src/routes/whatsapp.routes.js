import {Router} from 'express'
import { getPhones, getMessagesPhone, newMessage, viewMessage, whatsappToken } from '../controllers/whatsappMessages.js'

const router = Router()

router.get('/whatsapp', getPhones)

router.get('/whatsapp/:id', getMessagesPhone)

router.post('/whatsapp', newMessage)

router.put('/whatsapp/:id', viewMessage)

router.post('/whatsapp-token', whatsappToken)

export default router