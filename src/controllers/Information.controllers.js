import Information from '../models/Information.js'
import bizSdk, { Content } from 'facebook-nodejs-business-sdk'
import Integrations from '../models/Integrations.js'
import Domain from '../models/Domain.js'

export const createInformation = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const { cart, fbp, fbc } = req.body
        const integrations = await Integrations.findOne({ tenantId }).lean()
        const domain = await Domain.findOne({ tenantId }).lean()
        const nuevoFinalizar = new Information(cart)
        const newInformation = await nuevoFinalizar.save()
        if (integrations && integrations.apiToken && integrations.apiToken !== '' && integrations.apiPixelId && integrations.apiPixelId !== '') {
            const CustomData = bizSdk.CustomData
            const EventRequest = bizSdk.EventRequest
            const UserData = bizSdk.UserData
            const ServerEvent = bizSdk.ServerEvent
            const access_token = integrations.apiToken
            const pixel_id = integrations.apiPixelId
            const api = bizSdk.FacebookAdsApi.init(access_token)
            let current_timestamp = new Date()
            const url = `${domain.domain === 'upviser.cl' ? process.env.WEB_URL : `https://${domain.domain}`}/finalizar-compra/`
            const userData = (new UserData())
                .setClientIpAddress(req.connection.remoteAddress)
                .setClientUserAgent(req.headers['user-agent'])
                .setFbp(fbp)
                .setFbc(fbc)
            let value
            if ( cart?.length ) {
                value = cart.reduce((prev, current) => prev + (current.price * current.quantity), 0)
            } else {
                value = cart.price * cart.quantity
            }
            let contents = []
            let ids = []
            cart.map(product => {
            const content = (new Content())
                .setId(product._id)
                .setQuantity(product.quantity)
                .setCategory(product.category.category)
                .setItemPrice(product.price)
                .setTitle(product.name)
            contents = contents.concat(content)
            ids = ids.concat(product._id)
            })
            const customData = (new CustomData())
                .setCurrency('clp')
                .setValue(value)
                .setContents(contents)
                .setContentIds(ids)
            const serverEvent = (new ServerEvent())
                .setEventId(newInformation._id.toString())
                .setEventName('InitiateCheckout')
                .setEventTime(current_timestamp)
                .setUserData(userData)
                .setCustomData(customData)
                .setEventSourceUrl(url)
                .setActionSource('website')
            const eventsData = [serverEvent]
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
        return res.json(newInformation)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getInformation = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const finalizar = await Information.find({ tenantId }).lean()
        res.send(finalizar)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}