import Session from '../models/Session.js'
import Checkout from '../models/Checkout.js'
import Pay from '../models/Pay.js'
import Page from '../models/Page.js'
import Lead from '../models/Lead.js'
import Client from '../models/Client.js'
import Meeting from '../models/Meeting.js'
import ViewContent from '../models/ViewContent.js'
import AddCart from '../models/AddCart.js'
import Sell from '../models/Sell.js'
import Information from '../models/Information.js'

export const getStadistics = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const pages = await Page.find({ tenantId })
        const sessions = await Session.find({ tenantId })
        const viewContents = await ViewContent.find({ tenantId })
        const addCarts = await AddCart.find({ tenantId })
        const leads = await Lead.find({ tenantId })
        const meetings = await Meeting.find({ tenantId })
        const informations = await Information.find({ tenantId })
        const checkouts = await Checkout.find({ tenantId })
        const pays = await Pay.find({ tenantId, state: 'Pago realizado' })
        const sells = await Sell.find({ tenantId, state: 'Pago realizado' })
        const clients = await Client.find({ tenantId })
        return res.json({ pages, sessions, viewContents, addCarts, leads, meetings, informations, checkouts, pays, sells, clients })
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getStadisticsFiltered = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const {dateInitial, dateLast} = req.body
        const dateInitialFormat = new Date(dateInitial)
        const dateLastFormat = new Date(dateLast)
        const pages = await Page.find({ tenantId, createdAt: { $gte: dateInitialFormat, $lte: dateLastFormat } })
        const sessions = await Session.find({ tenantId, createdAt: { $gte: dateInitialFormat, $lte: dateLastFormat } })
        const viewContents = await ViewContent.find({ tenantId, createdAt: { $gte: dateInitialFormat, $lte: dateLastFormat } })
        const addCarts = await AddCart.find({ tenantId, createdAt: { $gte: dateInitialFormat, $lte: dateLastFormat } })
        const leads = await Lead.find({ tenantId, createdAt: { $gte: dateInitialFormat, $lte: dateLastFormat } })
        const meetings = await Meeting.find({ tenantId, createdAt: { $gte: dateInitialFormat, $lte: dateLastFormat } })
        const informations = await Information.find({ tenantId, createdAt: { $gte: dateInitialFormat, $lte: dateLastFormat } })
        const checkouts = await Checkout.find({ tenantId, createdAt: { $gte: dateInitialFormat, $lte: dateLastFormat } })
        const pays = await Pay.find({ tenantId, state: 'Pago realizado', createdAt: { $gte: dateInitialFormat, $lte: dateLastFormat } })
        const sells = await Sell.find({ tenantId, state: 'Pago realizado', createdAt: { $gte: dateInitialFormat, $lte: dateLastFormat } })
        const clients = await Client.find({ tenantId, createdAt: { $gte: dateInitialFormat, $lte: dateLastFormat } })
        return res.json({ pages, sessions, viewContents, addCarts, leads, meetings, informations, checkouts, pays, sells, clients })
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}