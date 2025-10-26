import { OAuth2Client } from 'google-auth-library'
import Tenant from '../models/Tenant.js';
import Integrations from '../models/Integrations.js';

const oauth2Client = new OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
});

export const googleAuth = async (req, res) => {
    try {
        const scopes = [
            "https://www.googleapis.com/auth/meetings.space.created",
        ];

        const url = oauth2Client.generateAuthUrl({
            access_type: "offline",
            prompt: "consent",
            scope: scopes,
            state: req.body.state,
        });

        res.redirect(url);
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const googleAuthCallback = async (req, res) => {
    try {
        const { tokens } = await oauth2Client.getToken(req.query.code)

        const tenant = await Tenant.findOne({ googleState: req.query.state }).lean()

        if (tenant) {
            const tenantId = tenant.tenantId
            const integration = await Integrations.findOne({ tenantId }).lean()
            if (integration) {
                await Integrations.findByIdAndUpdate(integration._id, { googleToken: tokens.access_token, googleRefreshToken: tokens.refresh_token, googleExpird: tokens.expiry_date })
            } else {
                const newIntegration = new Integrations({ tenantId, googleToken: tokens.access_token, googleRefreshToken: tokens.refresh_token, googleExpird: tokens.expiry_date })
                await newIntegration.save()
            }
        }

        return res.redirect(`${process.env.ADMIN_URL}/google-oauth-success?status=ok`)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}