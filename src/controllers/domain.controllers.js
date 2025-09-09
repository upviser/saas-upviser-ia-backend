import { Vercel } from '@vercel/sdk';
import Domain from '../models/Domain.js'

export const editDomain = async (req, res) => {
    const vercel = new Vercel({
        bearerToken: process.env.VERCEL_API_TOKEN,
    });

  try {
    const domain = req.body.domain

    const domainUpdate = await Domain.findOneAndUpdate({}, { domain: req.body.domain }, { new: true })

    if (!domainUpdate) {
        const newDomain = new Domain({ domain: req.body.domain })
        await newDomain.dave()
    }

    const mainDomainResponse = await vercel.projects.addProjectDomain({
      idOrName: process.env.VERCEL_PROJECT_ID,
      requestBody: {
        name: req.body.domain,
      },
    })

    const config = await vercel.domains.getDomainConfig({ domain })

    return res.json({
        ok: true,
        domain,
        verified: mainDomainResponse.verified,
        misconfigured: config.misconfigured,
        recommendedIPv4: config.recommendedIPv4,
        recommendedCNAME: config.recommendedCNAME,
    })
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