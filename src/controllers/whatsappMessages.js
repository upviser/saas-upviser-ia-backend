import WhatsappChat from '../models/WhatsappChat.js'
import axios from "axios"
import Integration from '../models/Integrations.js'
import ShopLogin from '../models/ShopLogin.js'

export const getPhones = async (req, res) => {
    try {
        WhatsappChat.aggregate([
            {
                $sort: { phone: 1, createdAt: -1 } // ordenamos por phone y luego por fecha descendente
            },
            {
                $group: {
                    _id: '$phone',
                    lastMessage: { $first: '$$ROOT' } // el más reciente por phone
                }
            },
            {
                $replaceRoot: { newRoot: '$lastMessage' }
            },
            {
                $sort: { createdAt: -1 } // ordenamos todos los últimos mensajes por fecha
            },
            {
                $project: {
                    _id: 0,
                    phone: 1,
                    agent: 1,
                    view: 1,
                    createdAt: 1
                }
            }
        ]).exec((err, result) => {
            if (err) {
                return res.sendStatus(404);
            }
            return res.send(result);
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const getMessagesPhone = async (req, res) => {
    try {
        const messages = await WhatsappChat.find({phone: req.params.id}).lean()
        res.send(messages)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const newMessage = async (req, res) => {
    try {
        const integration = await Integration.findOne().lean()
        if (integration.whatsappToken && integration.whatsappToken !== '') {
            await axios.post(`https://graph.facebook.com/v16.0/${integration.idPhone}/messages`, {
                "messaging_product": "whatsapp",
                "to": req.body.phone,
                "type": "text",
                "text": {"body": req.body.response}
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${integration.whatsappToken}`
                }
            })
            const newMessage = new WhatsappChat({phone: req.body.phone, response: req.body.response, agent: req.body.agent, view: true})
            await newMessage.save()
            return res.send(newMessage)
        } else {
            return res.json({ message: 'No existe un token de app para Whatsapp' })
        }
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const viewMessage = async (req, res) => {
    try {
        const messages = await WhatsappChat.find({phone: req.params.id})
        const reverseMessages = messages.reverse()
        const ultimateMessage = reverseMessages[0]
        ultimateMessage.view = true
        const saveMessage = await WhatsappChat.findByIdAndUpdate(ultimateMessage._id, ultimateMessage, { new: true })
        res.send(saveMessage)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const whatsappToken = async (req, res) => {
  try {
    const { code, phone_number_id, waba_id } = req.body

    const tokenRes = await axios.get('https://graph.facebook.com/v20.0/oauth/access_token', {
      params: {
        client_id: process.env.FB_APP_ID,
        client_secret: process.env.FB_APP_SECRET,
        redirect_uri: process.env.FB_REDIRECT_URI,
        code,
      },
    });

    const { access_token } = tokenRes.data;

    await axios.post(`https://graph.facebook.com/v20.0/${waba_id}/subscribed_apps`, null, {
      params: { access_token },
    });

    const integrations = await Integration.findOne().lean();
    await Integration.findByIdAndUpdate(integrations._id, {
      whatsappToken: access_token,
      idPhone: phone_number_id,
    }, { new: true });

    const shopLogin = await ShopLogin.findOne({ type: 'Administrador' }).lean()
    await axios.post(`${process.env.MAIN_API_URL}/user`, { email: shopLogin.email, api: process.env.NEXT_PUBLIC_API_URL, idPhone: phone_number_id })

    res.status(200).json({ success: 'OK' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};