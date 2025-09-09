import { Vercel } from '@vercel/sdk';

export const editDomain = async (req, res) => {
    const vercel = new Vercel({
        bearerToken: process.env.VERCEL_API_TOKEN,
    });

  try {
    // Add main domain
    const mainDomainResponse = await vercel.projects.addProjectDomain({
      idOrName: process.env.VERCEL_PROJECT_ID,
      requestBody: {
        name: req.body.domain,
      },
    });

    console.log(`Main domain added: ${mainDomainResponse.name}`);

    //const checkConfiguration = await vercel.domains.getDomainConfig({
    //  domain: req.body.domain,
    //});

    return res.json(mainDomainResponse)
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