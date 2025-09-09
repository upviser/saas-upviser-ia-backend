import Domain from '../models/Domain.js';
import axios from 'axios';
import dns from 'dns/promises';

const VERCEL_API = 'https://api.vercel.com';
const TOKEN = process.env.VERCEL_API_TOKEN;
const PROJECT = process.env.VERCEL_PROJECT_ID;
const HEADERS = {
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
};

function isApex(domain) {
  // Asume que si no hay subdominio (ej. solo example.com), es apex
  return domain.split('.').length === 2;
}

export const editDomain = async (req, res) => {
  const domain = req.body.domain;

  try {
    // Actualizar o crear registro en DB
    const domainEdit = await Domain.findOneAndUpdate({}, { domain }, { new: true });
    if (!domainEdit) {
      await new Domain({ domain }).save();
    }

    // Agregar dominio al proyecto Vercel
    const addResp = await axios.post(
      `${VERCEL_API}/v10/projects/${PROJECT}/domains`,
      { name: domain },
      { headers: HEADERS }
    );
    const domainInfo = addResp.data;

    // Obtener detalles para ver el estado de verificación
    const getResp = await axios.get(
      `${VERCEL_API}/v10/projects/${PROJECT}/domains/${domain}`,
      { headers: HEADERS }
    );
    const details = getResp.data;

    // Obtener configuración recomendada
    const configResp = await axios.get(
      `${VERCEL_API}/v6/domains/${domain}/config`,
      { headers: HEADERS, params: { projectIdOrName: PROJECT } }
    );
    const config = configResp.data;

    // Determinar registros DNS
    let dnsRecord = null;
    if (config.recommendedIPv4 && config.recommendedIPv4.length > 0) {
      dnsRecord = { type: 'A', value: config.recommendedIPv4[0].value[0] };
    } else if (config.recommendedCNAME && config.recommendedCNAME.length > 0) {
      dnsRecord = { type: 'CNAME', value: config.recommendedCNAME[0].value };
    } else if (isApex(domain)) {
      dnsRecord = { type: 'A', value: '76.76.21.21' };
    } else {
      dnsRecord = { type: 'CNAME', value: 'cname.vercel-dns.com' };
    }

    return res.json({
      ok: true,
      domain,
      verified: domainInfo.verified,
      dnsRecord,
      note: details.verified
        ? 'Dominio verificado. Configuración completada.'
        : 'Dominio agregado, pendiente de DNS. Usa el registro recomendado para configurarlo.',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

export const getDomain = async (req, res) => {
    try {
        const domain = await Domain.findOne().lean()
        return res.json(domain)
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}