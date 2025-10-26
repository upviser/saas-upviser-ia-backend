import Calendar from '../models/Calendar.js'
import Meeting from '../models/Meeting.js'
import { sendEmailBrevo } from '../utils/sendEmailBrevo.js'
import Client from '../models/Client.js'
import axios from 'axios'
import ClientData from '../models/ClientData.js'
import moment from 'moment-timezone'
import StoreData from '../models/StoreData.js'
import bizSdk from 'facebook-nodejs-business-sdk'
import Zoom from '../models/Zoom.js'
import { isTokenExpired } from '../utils/zoom.js'
import Integrations from '../models/Integrations.js'
import Style from '../models/Style.js'
import Domain from '../models/Domain.js'
import qs from 'qs'
import { OAuth2Client } from 'google-auth-library'

const oauth2Client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
});

export const editCalendar = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const calendar = await Calendar.findOne({ name: req.body.name }).lean()
        if (calendar === null) {
            const newCalendar = new Calendar({...req.body, tenantId})
            const newCalendarSave = await newCalendar.save()
            return res.json(newCalendarSave)
        } else {
            const calendarEdit = await Calendar.findByIdAndUpdate(req.body._id, req.body, { new: true })
            return res.json(calendarEdit)
        }
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getCalendar = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const calendar = await Calendar.find({ tenantId })
        if (!calendar) {
            return res.status(404).json({ message: "No tiene calendarios creados" });
        }
        return res.json(calendar)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getOneCalendar = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const calendar = await Calendar.findById(req.params.id)
        return res.json(calendar)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const deleteCalendar = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const deleteCalendar = await Calendar.findByIdAndDelete(req.params.id)
        return res.json(deleteCalendar)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const CreateMeeting = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        if (req.body.type === 'Llamada por Zoom') {
            const integrations = await Integrations.findOne({ tenantId }).lean()
            const domain = await Domain.findOne({ tenantId }).lean()
            let token
            if (isTokenExpired(integrations.zoomCreateToken, integrations.zoomExpiresIn)) {
                const response = await axios.post('https://zoom.us/oauth/token', qs.stringify({
                    grant_type: 'refresh_token',
                    refresh_token: integrations.zoomRefreshToken
                }), {
                    headers: {
                        'Authorization': `Basic ${Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString('base64')}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                })
                token = response.data.access_token
                await Integrations.findByIdAndUpdate(integrations._id, { zoomToken: token, zoomRefreshToken: response.data.refresh_token, zoomExpiresIn: response.data.expires_in, zoomCreateToken: new Date() }, { new: true })
            } else {
                token = integrations.zoomToken
            }
            const meetingData = {
                topic: req.body.call,
                type: 2,
                start_time: moment.tz(req.body.date, 'America/Santiago').format(),
                duration: req.body.duration
            }
            const meetingResponse = await axios.post(`https://api.zoom.us/v2/users/me/meetings`, meetingData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            }).catch(error => console.log(error))
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
                    .setId(req.body.service)
                    .setQuantity(1)
                    .setItemPrice(req.body.price && req.body.price !== '' ? Number(req.body.price) : undefined)
                const customData = (new CustomData())
                    .setContentName(req.body.meeting)
                    .setContents([content])
                    .setCurrency('clp')
                    .setValue(req.body.price && req.body.price !== '' ? Number(req.body.price) : undefined)
                const serverEvent = (new ServerEvent())
                    .setEventId(req.body.eventId)
                    .setEventName('Schedule')
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
            const newMeeting = new Meeting({ ...req.body, url: meetingResponse.data.start_url, tenantId})
            const newMeetingSave = await newMeeting.save()
            const client = await Client.findOne({ email: req.body.email })
            if (client) {
                await axios.post(`${process.env.API_URL}/clients`, req.body)
            } else {
                const newClient = new Client({...req.body, tenantId})
                await newClient.save()
            }
            res.json(newMeetingSave)
            const clientData = await ClientData.find({ tenantId }).lean()
            const storeData = await StoreData.find({ tenantId }).lean()
            const style = await Style.find({ tenantId }).lean()
            const date = moment.tz(req.body.date, 'America/Santiago')
            await sendEmailBrevo({ tenantId, subscribers: [{ name: req.body.firstName, email: req.body.email }], emailData: { affair: `¡Hola ${req.body.firstName}! Tu llamada ha sido agendada con exito`, title: 'Hemos agendado tu llamada exitosamente', paragraph: `¡Hola ${req.body.firstName}! Te queriamos informar que tu llamada con fecha ${date.date()}/${date.month() + 1}/${date.year()} a las ${date.hours()}:${date.minutes() >= 9 ? date.minutes() : `0${date.minutes()}`} ha sido agendada con exito, aqui te dejamos el acceso a la llamada en el siguiente boton, para cualquier consulta comunicate con nostros a traves de nuestro Whatsapp +56${storeData[0].phone}.`, buttonText: 'Ingresar a la llamada', url: meetingResponse.data.start_url }, clientData: clientData, storeData: storeData[0], style: style[0] })
        } else if (req.body.type === 'Llamada por Google Meet') {
            console.log('meet')
            const integrations = await Integrations.findOne({ tenantId }).lean()
            const domain = await Domain.findOne({ tenantId }).lean()
            const prueba = oauth2Client.setCredentials({
                access_token: integrations.googleToken,
                refresh_token: integrations.googleRefreshToken,
                expiry_date: integrations.googleExpired,
            })
            console.log(prueba)
            const currentTime = Date.now();
            if (integrations.googleExpired && integrations.googleExpired < currentTime) {
                console.log('token expirado')
                const newTokens = await oauth2Client.refreshAccessToken();
                console.log(newTokens)
                const updated = newTokens.credentials;
                console.log(updated)

                await Integrations.findByIdAndUpdate(integrations._id, {
                    googleToken: updated.access_token,
                    googleRefreshToken: updated.refresh_token || integrations.googleRefreshToken,
                    googleExpiryDate: updated.expiry_date,
                });

                const prueba2 = oauth2Client.setCredentials(updated);
                console.log(prueba2)
            }
            const response = await axios.post('https://meet.googleapis.com/v2/spaces', {
                    "space": {
                        "spaceType": "MEETING_SPACE"
                    },
                    requestId: `req-${Date.now()}`,
                }, {
                headers: {
                    'Authorization': `Bearer ${oauth2Client.credentials.access_token}`,
                },
            });
            console.log(response)
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
                    .setId(req.body.service)
                    .setQuantity(1)
                    .setItemPrice(req.body.price && req.body.price !== '' ? Number(req.body.price) : undefined)
                const customData = (new CustomData())
                    .setContentName(req.body.meeting)
                    .setContents([content])
                    .setCurrency('clp')
                    .setValue(req.body.price && req.body.price !== '' ? Number(req.body.price) : undefined)
                const serverEvent = (new ServerEvent())
                    .setEventId(req.body.eventId)
                    .setEventName('Schedule')
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
            const newMeeting = new Meeting({...req.body, url: response.data.meetingUri, tenantId})
            const newMeetingSave = await newMeeting.save()
            const client = await Client.findOne({ email: req.body.email })
            if (client) {
                await axios.post(`${process.env.API_URL}/clients`, req.body)
            } else {
                const newClient = new Client({...req.body, tenantId})
                await newClient.save()
            }
            res.json(newMeetingSave)
            const clientData = await ClientData.find({ tenantId }).lean()
            const storeData = await StoreData.find({ tenantId }).lean()
            const style = await Style.find({ tenantId }).lean()
            const date = moment.tz(req.body.date, 'America/Santiago')
            await sendEmailBrevo({ tenantId, subscribers: [{ name: req.body.firstName, email: req.body.email }], emailData: { affair: `¡Hola ${req.body.firstName}! Tu llamada ha sido agendada con exito`, title: 'Hemos agendado tu llamada exitosamente', paragraph: `¡Hola ${req.body.firstName}! Te queriamos informar que tu llamada con fecha ${date.date()}/${date.month() + 1}/${date.year()} a las ${date.hours()}:${date.minutes() >= 9 ? date.minutes() : `0${date.minutes()}`} ha sido agendada con exito, aqui te dejamos el acceso a la llamada en el siguiente boton, para cualquier consulta comunicate con nostros a traves de nuestro Whatsapp +56${storeData[0].phone}.`, buttonText: 'Ingresar a la llamada', url: response.data.meetingUri }, clientData: clientData, storeData: storeData[0], style: style[0] })
        } else {
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
                    .setFirstName(req.body.firstName)
                    .setLastName(req.body.lastName)
                    .setEmail(req.body.email)
                    .setPhone(req.body.phone && req.body.phone !== '' ? `56${req.body.phone}` : undefined)
                    .setClientIpAddress(req.connection.remoteAddress)
                    .setClientUserAgent(req.headers['user-agent'])
                    .setFbp(req.body.fbp)
                    .setFbc(req.body.fbc)
                const content = (new Content())
                    .setId(req.body.service)
                    .setQuantity(1)
                    .setItemPrice(req.body.price && req.body.price !== '' ? Number(req.body.price) : undefined)
                const customData = (new CustomData())
                    .setContentName(req.body.meeting)
                    .setContents([content])
                    .setCurrency('clp')
                    .setValue(req.body.price && req.body.price !== '' ? Number(req.body.price) : undefined)
                const serverEvent = (new ServerEvent())
                    .setEventId(req.body.eventId)
                    .setEventName('Schedule')
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
            const newMeeting = new Meeting({...req.body, tenantId})
            const newMeetingSave = await newMeeting.save()
            const client = await Client.findOne({ email: req.body.email })
            if (client) {
                await axios.post(`${process.env.API_URL}/clients`, req.body)
            } else {
                const newClient = new Client({...req.body, tenantId})
                await newClient.save()
            }
            res.json(newMeetingSave)
            const clientData = await ClientData.find({ tenantId }).lean()
            const storeData = await StoreData.find({ tenantId }).lean()
            const style = await Style.find({ tenantId }).lean()
            const date = moment.tz(req.body.date, 'America/Santiago')
            await sendEmailBrevo({ tenantId, subscribers: [{ name: req.body.firstName, email: req.body.email }], emailData: { affair: `¡Hola ${req.body.firstName}! Tu visita ha sido agendada con exito`, title: 'Hemos agendado tu visita exitosamente', paragraph: `¡Hola ${req.body.firstName}! Te queriamos informar que tu visita con fecha ${date.date()}/${date.month() + 1}/${date.year()} a las ${date.hours()}:${date.minutes() >= 9 ? date.minutes() : `0${date.minutes()}`} ha sido agendada con exito, la visita sera en ${req.body.type === 'Visita a domicilio' ? `${req.body.address}, ${req.body.city}, ${req.body.region}.` : `${storeData[0].address}, ${storeData[0].city}, ${storeData[0].region}.`} Para cualquier consulta comunicate con nosotros a través de nuestro Whatsapp.`, buttonText: 'Hablar por Whatsapp', url: `https://wa.me/+56${storeData[0].phone}` }, clientData: clientData, storeData: storeData[0], style: style[0] })
        }
    } catch (error) {
        console.log(error.response)
        return res.status(500).json({message: error.message})
    }
}

export const deleteMeeting = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const meetingDelete = await Meeting.findOneAndDelete(req.params.id)
        res.json(meetingDelete)
        if (meetingDelete.type === 'Llamada por Zoom') {
            const clientData = await ClientData.find({ tenantId }).lean()
            const storeData = await StoreData.find({ tenantId }).lean()
            const style = await Style.find({ tenantId }).lean()
            await sendEmailBrevo({ subscribers: [{ name: meetingDelete.firstName, email: meetingDelete.email }], emailData: { affair: `Hola ${meetingDelete.firstName}, tu llamada ha sido cancelada`, title: 'Lamentablemente tu llamada ha sido cancelada', paragraph: `Hola ${meetingDelete.firstName}, te queriamos avisar que tu llamada con nosotros ha sido cancelada, para cualquier consulta comunicate con nosotrosa través de nuestro Whatsapp.`, buttonText: 'Hablar por Whatsapp', url: `https://wa.me/+569${storeData[0].phone}` }, clientData: clientData, storeData: storeData[0], style: style[0] })
        } else {
            const clientData = await ClientData.find({ tenantId }).lean()
            const storeData = await StoreData.find({ tenantId }).lean()
            const style = await Style.find({ tenantId }).lean()
            await sendEmailBrevo({ tenantId, subscribers: [{ name: meetingDelete.firstName, email: meetingDelete.email }], emailData: { affair: `Hola ${meetingDelete.firstName}, tu visita ha sido cancelada`, title: 'Lamentablemente tu visita ha sido cancelada', paragraph: `Hola ${meetingDelete.firstName}, te queriamos avisar que tu visita con nosotros ha sido cancelada, para cualquier consulta comunicate con nosotros a través de nuestro Whatsapp.`, buttonText: 'Hablar por Whatsapp', url: `https://wa.me/+569${storeData[0].phone}` }, clientData: clientData, storeData: storeData[0], style: style[0] })
        }
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getMeetings = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const meetings = await Meeting.find({ tenantId })
        return res.json(meetings)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getMeeting = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const meeting = await Meeting.findById(req.params.id)
        return res.json(meeting)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getMeetingsEmail = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const meetings = await Meeting.find({ tenantId, email: req.params.email })
        return res.json(meetings)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}