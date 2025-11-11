import Pay from '../models/Pay.js'
import Client from '../models/Client.js'
import bizSdk from 'facebook-nodejs-business-sdk'
import Integrations from '../models/Integrations.js'
import { sendEmailBuyBrevo } from '../utils/sendEmailBuyBrevo.js'
import StoreData from '../models/StoreData.js'
import Style from '../models/Style.js'
import Service from '../models/Service.js'
import Domain from '../models/Domain.js'

export const createPay = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const integrations = await Integrations.findOne({ tenantId }).lean()
        const domain = await Domain.findOne({ tenantId }).lean()
        if (req.body.state === 'Pago iniciado' || req.body.state === 'Segundo pago iniciado') {
            if (integrations && integrations.apiToken && integrations.apiToken !== '' && integrations.apiPixelId && integrations.apiPixelId !== '') {
                const Content = bizSdk.Content
                const CustomData = bizSdk.CustomData
                const EventRequest = bizSdk.EventRequest
                const UserData = bizSdk.UserData
                const ServerEvent = bizSdk.ServerEvent
                const access_token = integrations.apiToken
                const pixel_id = integrations.apiPixelId
                const api = bizSdk.FacebookAdsApi.init(access_token)
                let current_timestamp = Math.floor(new Date() / 1000)
                const userData = (new UserData())
                    .setFirstName(req.body.firstName)
                    .setLastName(req.body.lastName)
                    .setEmail(req.body.email)
                    .setPhone(req.body.phone && req.body.phone !== '' ? `56${req.body.phone}` : undefined)
                    .setClientIpAddress(req.connection.remoteAddress)
                    .setClientUserAgent(req.headers['user-agent'])
                    .setFbp(req.body.fbp)
                    .setFbc(req.body.fbc)
                const content = (new Content())
                    .setId(req.body.service && req.body.service !== '' ? req.body.service : req.body.call)
                    .setQuantity(1)
                    .setItemPrice(Number(req.body.price))
                const customData = (new CustomData())
                    .setContentName(req.body.service && req.body.service !== '' ? req.body.service : req.body.call)
                    .setContents([content])
                    .setCurrency('clp')
                    .setValue(Number(req.body.price))
                const serverEvent = (new ServerEvent())
                    .setEventId(req.body.eventId)
                    .setEventName('AddPaymentInfo')
                    .setEventTime(current_timestamp)
                    .setUserData(userData)
                    .setCustomData(customData)
                    .setEventSourceUrl(`${domain.domain === 'upviser.cl' ? process.env.WEB_URL : `https://${domain.domain}`}${req.body.page}`)
                    .setActionSource('website')
                const eventsData = [serverEvent];
                const eventRequest = (new EventRequest(access_token, pixel_id))
                    .setEvents(eventsData)
                eventRequest.execute().then(
                    response => {
                        console.log('Response: ', response)
                    },
                    err => {
                        console.error('Error: ', err)
                    }
                )
            }
        } else if (req.body.state === 'Pago realizado' || req.body.state === 'Segundo pago realizado') {
            if (integrations && integrations.apiToken && integrations.apiToken !== '' && integrations.apiPixelId && integrations.apiPixelId !== '') {
                const Content = bizSdk.Content
                const CustomData = bizSdk.CustomData
                const EventRequest = bizSdk.EventRequest
                const UserData = bizSdk.UserData
                const ServerEvent = bizSdk.ServerEvent
                const access_token = integrations.apiToken
                const pixel_id = integrations.apiPixelId
                const api = bizSdk.FacebookAdsApi.init(access_token)
                let current_timestamp = Math.floor(new Date() / 1000)
                const userData = (new UserData())
                    .setFirstName(req.body.firstName)
                    .setLastName(req.body.lastName)
                    .setEmail(req.body.email)
                    .setPhone(req.body.phone && req.body.phone !== '' ? `56${req.body.phone}` : undefined)
                    .setClientIpAddress(req.connection.remoteAddress)
                    .setClientUserAgent(req.headers['user-agent'])
                    .setFbp(req.body.fbp)
                    .setFbc(req.body.fbc)
                const content = (new Content())
                    .setId(req.body.service && req.body.service !== '' ? req.body.service : req.body.call)
                    .setQuantity(1)
                    .setItemPrice(Number(req.body.price))
                const customData = (new CustomData())
                    .setContentName(req.body.service && req.body.service !== '' ? req.body.service : req.body.call)
                    .setContents([content])
                    .setCurrency('clp')
                    .setValue(Number(req.body.price))
                const serverEvent = (new ServerEvent())
                    .setEventId(req.body.eventId)
                    .setEventName('Purchase')
                    .setEventTime(current_timestamp)
                    .setUserData(userData)
                    .setCustomData(customData)
                    .setEventSourceUrl(`${domain.domain === 'upviser.cl' ? process.env.WEB_URL : `https://${domain.domain}`}${req.body.page}`)
                    .setActionSource('website')
                const eventsData = [serverEvent];
                const eventRequest = (new EventRequest(access_token, pixel_id))
                    .setEvents(eventsData)
                eventRequest.execute().then(
                    response => {
                        console.log('Response: ', response)
                    },
                    err => {
                        console.error('Error: ', err)
                    }
                )
            }
            const storeData = await StoreData.findOne({ tenantId }).lean()
            const style = await Style.findOne({ tenantId }).lean()
            const services = await Service.find({ tenantId }).lean()
            sendEmailBuyBrevo({ tenantId, pay: req.body.pay, storeData: storeData, style: style, services: services, call: req.body.call })
        }
        const newPay = new Pay({...req.body, tenantId})
        const newPaySave = await newPay.save()
        return res.json(newPaySave)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getPays = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const pays = await Pay.find({ tenantId }).lean()
        return res.json(pays)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getPay = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const pay = await Pay.findById(req.params.id)
        return res.json(pay)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getPayEmailService = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const [ email, serviceId ] = req.params.id.split('-')
        const client = await Client.findOne({ email: email })
        if (client.services.length && client.services.find(service => service.service === serviceId)) {
            const servicePrice = client.services.find(service => service.service === serviceId).price
            return res.json({ price: servicePrice ? servicePrice : null })
        } else {
            return res.json({ message: 'No price' })
        }
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const updatePay = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const payUpdate = await Pay.findByIdAndUpdate(req.params.id, req.body, { new: true })
        if (req.body.state === 'Pago realizado') {
            const integrations = await Integrations.findOne({ tenantId }).lean()
            const domain = await Domain.findOne({ tenantId }).lean()
            if (integrations && integrations.apiToken && integrations.apiToken !== '' && integrations.apiPixelId && integrations.apiPixelId !== '') {
                const Content = bizSdk.Content
                const CustomData = bizSdk.CustomData
                const EventRequest = bizSdk.EventRequest
                const UserData = bizSdk.UserData
                const ServerEvent = bizSdk.ServerEvent
                const access_token = integrations.apiToken
                const pixel_id = integrations.apiPixelId
                const api = bizSdk.FacebookAdsApi.init(access_token)
                let current_timestamp = Math.floor(new Date() / 1000)
                const userData = (new UserData())
                    .setFirstName(payUpdate.firstName)
                    .setLastName(payUpdate.lastName)
                    .setEmail(payUpdate.email)
                    .setPhone(payUpdate.phone && payUpdate.phone !== '' ? `56${payUpdate.phone}` : undefined)
                    .setClientIpAddress(req.connection.remoteAddress)
                    .setClientUserAgent(req.headers['user-agent'])
                    .setFbp(req.body.fbp)
                    .setFbc(req.body.fbc)
                const content = (new Content())
                    .setId(payUpdate.service && payUpdate.service !== '' ? payUpdate.service : payUpdate.call)
                    .setQuantity(1)
                    .setItemPrice(Number(payUpdate.price))
                const customData = (new CustomData())
                    .setContentName(payUpdate.service && payUpdate.service !== '' ? payUpdate.service : payUpdate.call)
                    .setContents([content])
                    .setCurrency('clp')
                    .setValue(Number(payUpdate.price))
                const serverEvent = (new ServerEvent())
                    .setEventId(req.body.eventId)
                    .setEventName('Purchase')
                    .setEventTime(current_timestamp)
                    .setUserData(userData)
                    .setCustomData(customData)
                    .setEventSourceUrl(`${domain.domain === 'upviser.cl' ? process.env.WEB_URL : `https://${domain.domain}`}${req.body.page}`)
                    .setActionSource('website')
                const eventsData = [serverEvent];
                const eventRequest = (new EventRequest(access_token, pixel_id))
                    .setEvents(eventsData)
                eventRequest.execute().then(
                    response => {
                        console.log('Response: ', response)
                    },
                    err => {
                        console.error('Error: ', err)
                    }
                )
            }
            const storeData = await StoreData.findOne({ tenantId }).lean()
            const style = await Style.findOne({ tenantId }).lean()
            const services = await Service.find({ tenantId }).lean()
            sendEmailBuyBrevo({ tenantId, pay: payUpdate, storeData: storeData, style: style, services: services, call: payUpdate.call })
        }
        return res.json(payUpdate)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}