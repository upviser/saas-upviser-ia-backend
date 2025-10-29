import express from 'express'
import cors from 'cors'
import fileUpload from 'express-fileupload'
import {connectDB} from './db.js'
import http from 'http'
import {Server as SocketServer} from 'socket.io'
import { loadTasks } from './utils/tasks.js'
import ShopLogin from './models/ShopLogin.js'
import cron from 'node-cron'

import contactRoutes from './routes/contact.routes.js'
import clientTagRoutes from './routes/clientTag.routes.js'
import clientsRoutes from './routes/client.routes.js'
import storeDataRoutes from './routes/storeData.routes.js'
import chatRoutes from './routes/chat.routes.js'
import notificationsRoutes from './routes/notifications.routes.js'
import campaignRoutes from './routes/campaign.routes.js'
import automatizationsRoutes from './routes/automatizations.routes.js'
import politicsRoutes from './routes/politics.routes.js'
import designRoutes from './routes/design.routes.js'
import subscriptionRoutes from './routes/subscription.routes.js'
import shopLoginRoutes from './routes/shopLogin.routes.js'
import postRoutes from './routes/post.routes.js'
import emailRoutes from './routes/email.routes.js'
import sessionRoutes from './routes/session.routes.js'
import funnelsRoutes from './routes/funnels.routes.js'
import formsRoutes from './routes/form.routes.js'
import callsRoutes from './routes/calls.routes.js'
import meetingsRoutes from './routes/meetings.routes.js'
import clientDataRoutes from './routes/clientData.router.js'
import mercadopagoRoutes from './routes/mercadoPago.routes.js'
import servicesRoutes from './routes/services.routes.js'
import bunnyRoutes from './routes/bunny.routes.js'
import zoomRoutes from './routes/zoom.routes.js'
import paysRoutes from './routes/pays.routes.js'
import stadisticsRoutes from './routes/stadistics.routes.js'
import checkoutRoutes from './routes/checkouts.routes.js'
import pagesRoutes from './routes/pages.routes.js'
import leadsRoutes from './routes/leads.routes.js'
import paymentsRoutes from './routes/payments.controllers.js'
import desubscribesRoutes from './routes/desubscribes.routes.js'
import brevoWebhookRoutes from './routes/brevoWebhook.routes.js'
import integrationsRoutes from './routes/integrations.routes.js'
import transbankRoutes from './routes/transbank.routes.js'
import trackingRoutes from './routes/tracking.routes.js'
import productsRoutes from './routes/products.routes.js'
import addCartRoutes from './routes/addCart.routes.js'
import categoriesRoutes from './routes/categories.routes.js'
import promotionalCodeRoutes from './routes/promotionalCode.routes.js'
import tagsRoutes from './routes/tags.routes.js'
import viewContentRoutes from './routes/viewContent.routes.js'
import informationRoutes from './routes/information.routes.js'
import mercadopago2Routes from './routes/mercadoPago2.js'
import chilexpressRoutes from './routes/chilexpress.controllers.js'
import sellsRoutes from './routes/sells.routes.js'
import aiRoutes from './routes/ai.routes.js'
import instagramRoutes from './routes/instagram.routes.js'
import messengerRoutes from './routes/messenger.routes.js'
import whatsappRoutes from './routes/whatsapp.routes.js'
import webhookRoutes from './routes/webhook.routes.js'
import notificationRoutes from './routes/notifications.routes.js'
import cartRoutes from './routes/cart.routes.js'
import DomainRoutes from './routes/domain.routes.js'
import TenantRoutes from './routes/tenants.routes.js'
import GoogleRoutes from './routes/google.routes.js'

connectDB()

const app = express()
const server = http.createServer(app)
const io = new SocketServer(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    },
    pingInterval: 10000,
    pingTimeout: 5000
})

const corsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
}

app.use(cors(corsOptions))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({limit: '50mb', extended: false}))
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: './upload',
    limits: { fileSize: 100 * 1024 * 1024 }
}))

try {
    await loadTasks()
} catch (error) {
    console.error('Error loading tasks:', error)
}

cron.schedule("0 0 * * *", async () => {
    try {
        const now = new Date()

        const accounts = await ShopLogin.find({ type: 'Administrador' }).lean()

        for (const account of accounts) {
            const updates = {}

            const createdAt = new Date(account.createdAt)
            const dateSubscription = new Date(account.dateSubscription)

            const diffCreated = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24)) // en días
            const diffSubscription = Math.floor((now - dateSubscription) / (1000 * 60 * 60 * 24)) // en días

            // Si han pasado más de 3 días desde creado y aún no tiene subscription activa
            if (diffCreated > 3 && !account.subscription && account.tenantId !== process.env.MAIN_TENANT_ID) {
                updates.state = false
            }

            // Si tiene suscripción activa y ha pasado 1 mes (30 días) desde la última renovación
            if (account.subscription && diffSubscription >= 30 && account.tenantId !== process.env.MAIN_TENANT_ID) {
                // Aplicar el plan correspondiente
                switch (account.plan) {
                    case 'Esencial':
                        updates.emails = 1500
                        updates.textAI = 100
                        updates.imagesAI = 40
                        updates.videosAI = 15
                        updates.conversationsAI = 250
                        break
                    case 'Avanzado':
                        updates.emails = 3500
                        updates.textAI = 200
                        updates.imagesAI = 80
                        updates.videosAI = 30
                        updates.conversationsAI = 600
                        break
                    case 'Profesional':
                        updates.emails = 6000
                        updates.textAI = 400
                        updates.imagesAI = 160
                        updates.videosAI = 60
                        updates.conversationsAI = 1500
                        break
                    default:
                        updates.emails = 0
                        updates.textAI = 0
                        updates.imagesAI = 0
                        updates.videosAI = 0
                        updates.conversationsAI = 0
                        break
                }

                // Actualizar fecha de suscripción
                updates.dateSubscription = now
            }

            // Si hay algo que actualizar
            if (Object.keys(updates).length > 0) {
                await ShopLogin.findByIdAndUpdate(account._id, updates)
            }
        }

        console.log(`[CRON] Ejecutado el ${now.toISOString()} para ${accounts.length} cuentas.`)
    } catch (error) {
        console.error('Error en cron job:', error)
    }
})

app.use(contactRoutes)
app.use(clientsRoutes)
app.use(clientTagRoutes)
app.use(storeDataRoutes)
app.use(chatRoutes)
app.use(notificationsRoutes)
app.use(campaignRoutes)
app.use(automatizationsRoutes)
app.use(politicsRoutes)
app.use(designRoutes)
app.use(subscriptionRoutes)
app.use(shopLoginRoutes)
app.use(postRoutes)
app.use(emailRoutes)
app.use(sessionRoutes)
app.use(funnelsRoutes)
app.use(formsRoutes)
app.use(callsRoutes)
app.use(meetingsRoutes)
app.use(clientDataRoutes)
app.use(mercadopagoRoutes)
app.use(servicesRoutes)
app.use(bunnyRoutes)
app.use(zoomRoutes)
app.use(paysRoutes)
app.use(stadisticsRoutes)
app.use(checkoutRoutes)
app.use(pagesRoutes)
app.use(leadsRoutes)
app.use(paymentsRoutes)
app.use(desubscribesRoutes)
app.use(brevoWebhookRoutes)
app.use(integrationsRoutes)
app.use(transbankRoutes)
app.use(trackingRoutes)
app.use(productsRoutes)
app.use(addCartRoutes)
app.use(categoriesRoutes)
app.use(promotionalCodeRoutes)
app.use(tagsRoutes)
app.use(viewContentRoutes)
app.use(informationRoutes)
app.use(mercadopago2Routes)
app.use(chilexpressRoutes)
app.use(sellsRoutes)
app.use(aiRoutes)
app.use(instagramRoutes)
app.use(messengerRoutes)
app.use(whatsappRoutes)
app.use(webhookRoutes)
app.use(notificationRoutes)
app.use(cartRoutes)
app.use(DomainRoutes)
app.use(TenantRoutes)
app.use(GoogleRoutes)

io.on('connection', async (socket) => {
    socket.on('message', async (message) => {
        socket.broadcast.emit('message', message)
    })
    socket.on('messageAdmin', (message) => {
        socket.broadcast.emit('messageAdmin', message)
    })
    socket.on('newNotification', (message) => {
        socket.broadcast.emit('newNotification', message)
    })
    socket.on('whatsapp', async (message) => {
        socket.broadcast.emit('whatsapp', message)
    })
    socket.on('messenger', async (message) => {
        socket.broadcast.emit('messenger', message)
    })
    socket.on('instagram', async (message) => {
        socket.broadcast.emit('instagram', message)
    })
})

export { io }

server.listen(process.env.PORT || 3000)
console.log('Server on port', process.env.PORT || 3000)