import { Vercel } from '@vercel/sdk';
import Domain from '../models/Domain.js'
import axios from 'axios'

export const editDomain = async (req, res) => {
    const vercel = new Vercel({
        bearerToken: process.env.VERCEL_API_TOKEN,
    });

  try {
    const mainDomainResponse = await vercel.projects.addProjectDomain({
      idOrName: process.env.VERCEL_PROJECT_ID,
      requestBody: {
        name: req.body.domain,
      },
    })

    const brevoDomain = await axios.post(
      "https://api.brevo.com/v3/senders/domains",
      { name: req.body.domain },
      { headers: { "api-key": process.env.BREVO_API } }
    );

    await axios.post(
      "https://api.brevo.com/v3/senders",
      {
        name: req.body.name,
        email: `${req.body.email}@${req.body.domain}`,
      },
      { headers: { "api-key": process.env.BREVO_API } }
    );

    if (mainDomainResponse.verified) {
      const domainUpdate = await Domain.findOneAndUpdate({}, { domain: req.body.domain, name: req.body.name, email: req.body.email, dkim1: { type: brevoDomain.data.dns_records.dkim1Record.type, value: brevoDomain.data.dns_records.dkim1Record.value, hostname: brevoDomain.data.dns_records.dkim1Record.host_name }, dkim2: { type: brevoDomain.data.dns_records.dkim2Record.type, value: brevoDomain.data.dns_records.dkim2Record.value, hostname: brevoDomain.data.dns_records.dkim2Record.host_name }, brevo: { type: brevoDomain.data.dns_records.brevo_code.type, value: brevoDomain.data.dns_records.brevo_code.value, hostname: brevoDomain.data.dns_records.brevo_code.host_name }, dmarc: { type: brevoDomain.data.dns_records.dmarc_record.type, value: brevoDomain.data.dns_records.dmarc_record.value, hostname: brevoDomain.data.dns_records.dmarc_record.host_name } }, { new: true })

      if (!domainUpdate) {
          const newDomain = new Domain({ domain: req.body.domain, name: req.body.name, email: req.body.email, dkim1: { type: brevoDomain.data.dns_records.dkim1Record.type, value: brevoDomain.data.dns_records.dkim1Record.value, hostname: brevoDomain.data.dns_records.dkim1Record.host_name }, dkim2: { type: brevoDomain.data.dns_records.dkim2Record.type, value: brevoDomain.data.dns_records.dkim2Record.value, hostname: brevoDomain.data.dns_records.dkim2Record.host_name }, brevo: { type: brevoDomain.data.dns_records.brevo_code.type, value: brevoDomain.data.dns_records.brevo_code.value, hostname: brevoDomain.data.dns_records.brevo_code.host_name }, dmarc: { type: brevoDomain.data.dns_records.dmarc_record.type, value: brevoDomain.data.dns_records.dmarc_record.value, hostname: brevoDomain.data.dns_records.dmarc_record.host_name } })
          await newDomain.save()
      }
    }

    return res.json({ domain: req.body.domain, name: req.body.name, email: req.body.email, dkim1: { type: brevoDomain.data.dns_records.dkim1Record.type, value: brevoDomain.data.dns_records.dkim1Record.value, hostname: brevoDomain.data.dns_records.dkim1Record.host_name }, dkim2: { type: brevoDomain.data.dns_records.dkim2Record.type, value: brevoDomain.data.dns_records.dkim2Record.value, hostname: brevoDomain.data.dns_records.dkim2Record.host_name }, brevo: { type: brevoDomain.data.dns_records.brevo_code.type, value: brevoDomain.data.dns_records.brevo_code.value, hostname: brevoDomain.data.dns_records.brevo_code.host_name }, dmarc: { type: brevoDomain.data.dns_records.dmarc_record.type, value: brevoDomain.data.dns_records.dmarc_record.value, hostname: brevoDomain.data.dns_records.dmarc_record.host_name } })
  } catch (error) {
    console.error(
      error instanceof Error ? `Error: ${error.message}` : String(error),
    );
  }
}

export const getDomain = async (req, res) => {
    try {
        const domain = await Domain.findOne().lean()
        return res.json(domain)
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}