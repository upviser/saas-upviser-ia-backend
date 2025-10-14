import axios from 'axios'
import Integrations from '../models/Integrations.js'
import crypto from 'crypto'
import Tenant from '../models/Tenant.js'

export const createToken = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const integrations = await Integrations.findOne({ tenantId }).lean()
        const response = await axios.post('https://zoom.us/oauth/token', qs.stringify({
            grant_type: 'refresh_token',
            refresh_token: integrations.zoomRefreshToken
        }), {
            headers: {
                'Authorization': `Basic ${Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString('base64')}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
        await Integrations.findByIdAndUpdate(integrations._id, { zoomToken: response.data.access_token, zoomRefreshToken: response.data.refresh_token, zoomExpiresIn: response.data.expires_in, zoomCreateToken: new Date() })
        return res.json(response.data)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const redirectZoom = async (req, res) => {
    const state = req.query.state
    const tenant = await Tenant.findOne({ zoomState: state }).lean()
    if (tenant) {
        const authUrl = `https://zoom.us/oauth/authorize?response_type=code`
            + `&client_id=${process.env.ZOOM_CLIENT_ID}`
            + `&redirect_uri=${encodeURIComponent(process.env.ZOOM_REDIRECT_URI)}`
            + `&state=${state}`
        res.redirect(authUrl);
    }
    
}

export const removeZoom = async (req, res) => {
    const tenantId = req.headers['x-tenant-id']
    try {
        const integrations = await Integrations.findOne({ tenantId }).lean()
        const params = new URLSearchParams()
        params.append('token', integrations.zoomToken)
        await axios.post('https://zoom.us/oauth/revoke', params, 
            {
                headers: {
                    'Authorization': `Basic ${Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString('base64')}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        )
        await Integrations.findByIdAndUpdate(integrations._id, { zoomAccountId: '', zoomToken: '', zoomRefreshToken: '', zoomCreateToken: '', zoomExpiresIn: '' }, { new: true })
        return res.json({ success: 'OK' })
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}