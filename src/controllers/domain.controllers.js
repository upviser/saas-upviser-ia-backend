import Domain from '../models/Domain.js'
import axios from 'axios'

const VERCEL_API = 'https://api.vercel.com';
const TOKEN = process.env.VERCEL_API_TOKEN;
const PROJECT = process.env.VERCEL_PROJECT_ID; // o nombre
const HEADERS = {
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
};

export const editDomain = async (req, res) => {
    try {
        const domainEdit = await Domain.findOneAndUpdate({}, { domain: req.body.domain }, { new: true })
        if (!domainEdit) {
            const newDomain = new Domain({ domain: req.body.domain })
            await newDomain.save()
            return res.status(201).json(newDomain)
        }
        const addResp = await axios.post(
            `${VERCEL_API}/v10/projects/${PROJECT}/domains`,
            { name: req.body.domain },
            { headers: HEADERS }
        );

        const domainInfo = addResp.data;

        // Obtener detalles
        const getResp = await axios.get(
            `${VERCEL_API}/v10/projects/${PROJECT}/domains/${req.body.domain}`,
            { headers: HEADERS }
        );

        const details = getResp.data;

        return res.json({
            ok: true,
            domain: domainInfo.name,
            verified: domainInfo.verified,
            verification: details.verification,
            instructions: details.verified
                ? 'Dominio verificado. Configuración completada.'
                : (details.verification?.[0]?.type === 'CNAME'
                    ? `Añade un registro CNAME: ${details.verification[0].value}`
                    : details.verification?.[0]?.type === 'A'
                    ? `Añade un registro A apuntando a ${details.verification[0].value}`
                    : 'Sigue el desafío de verificación.'),
        });
    } catch {
        return res.status(500).json({ message: error.message })
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