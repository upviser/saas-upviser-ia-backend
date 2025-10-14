import { MercadoPagoConfig, Preference } from "mercadopago"
import Paym from '../models/Payment.js'
import Domain from '../models/Domain.js'

export const createOrder = async (req, res) => {
  const tenantId = req.headers['x-tenant-id']
  const paymentData = await Paym.findOne({ tenantId }).lean()
  const domain = await Domain.findOne({ tenantId }).lean()
  const client = new MercadoPagoConfig({ accessToken: paymentData.mercadoPago.accessToken });
  const preference = new Preference(client);

  try {
    const result = await preference.create({
      body: {
        items: req.body,
        back_urls: {
          success: `${domain.domain === 'upviser.cl' ? process.env.WEB_URL : `https://${domain.domain}`}/procesando-pago`,
          pending: `${domain.domain === 'upviser.cl' ? process.env.WEB_URL : `https://${domain.domain}`}/procesando-pago`,
          failure: `${domain.domain === 'upviser.cl' ? process.env.WEB_URL : `https://${domain.domain}`}/procesando-pago`,
        },
        auto_return: 'approved'
      }
    }).catch(console.log)

    res.json(result)
  } catch (error) {
    return res.status(500).json({ message: "Something goes wrong" })
  }
}

export const receiveWebhook = async (req, res) => {
  try {
    const tenantId = req.headers['x-tenant-id']
    return res.json({
      Payment: req.query.payment_id,
      Status: req.query.status,
      MerchantOrder: req.query.merchant_order_id
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Something goes wrong" })
  }
}