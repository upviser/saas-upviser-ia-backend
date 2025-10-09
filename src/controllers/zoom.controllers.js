import axios from 'axios'
import Integrations from '../models/Integrations.js'
import crypto from 'crypto'

export const createToken = async (req, res) => {
    try {
        const integrations = await Integrations.findOne().lean()
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
    const clientApi = req.query.api
    const state = crypto.randomBytes(16).toString('hex')
    await axios.post(`${process.env.MAIN_API_URL}/user`, { api: clientApi, zoomState: state })
    const authUrl = `https://zoom.us/oauth/authorize?response_type=code`
        + `&client_id=${process.env.ZOOM_CLIENT_ID}`
        + `&redirect_uri=${encodeURIComponent(process.env.ZOOM_REDIRECT_URI)}`
        + `&state=${state}`
    res.redirect(authUrl);
}