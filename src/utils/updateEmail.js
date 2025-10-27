import Client from '../models/Client.js'

export const updateClientEmailStatus = async (email, emailData, tenantId) => {
    await Client.findOneAndUpdate(
        { tenantId, email: email },
        { $push: { emails: emailData } }
    );
};

export const updateClientEmailStatusById = async (email, emailId, updateData) => {
    const client = await Client.findOne({ email, 'emails.id': emailId })
    let emailUpdate = client.emails.find(email => email.id === emailId)
    if (updateData === 'unique_opened') {
        emailUpdate.opened = true
    } else if (updateData === 'click') {
        emailUpdate.clicked = true
    }
    await client.save()
};