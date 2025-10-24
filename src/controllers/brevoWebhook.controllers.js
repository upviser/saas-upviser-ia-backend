import { updateClientEmailStatusById } from '../utils/updateEmail.js'

export const getStatus = async (req, res) => {
    const tenantId = req.headers['x-tenant-id']
    const event = req.body.event;
    const email = req.body.email
    const emailId = req.body.tags[0]
    
    if (event === 'opened') {
        await updateClientEmailStatusById(email, emailId, 'opened');
    } else if (event === 'click') {
        await updateClientEmailStatusById(email, emailId, 'click');
    }

    res.status(200).send('Webhook received');
}