import Design from '../models/Design.js'
import Funnel from '../models/Funnel.js'
import ClientTag from '../models/ClientTag.js'
import ClientData from '../models/ClientData.js'
import Service from '../models/Service.js'
import Style from '../models/Style.js'
import Domain from '../models/Domain.js'
import ChatTag from '../models/ChatTag.js'
import Tenant from '../models/Tenant.js'
import axios from 'axios'

export const createDesign = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const design = await Design.findOne({ tenantId }).lean()
        if (design) {
            const designUpdate = await Design.findByIdAndUpdate(design._id, req.body, { new: true })
            return res.send(designUpdate)
        } else {
            const newDesign = new Design({...req.body, tenantId})
            const newDesignSave = await newDesign.save()
            return res.send(newDesignSave)
        }
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getDesign = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const design = await Design.findOne({ tenantId }).lean()
        if (design === null) {
            return res.send([])
        }
        return res.send(design)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const updateDesign = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const updateDesign = await Design.findByIdAndUpdate(req.params.id, req.body, { new: true })
        return res.json(updateDesign)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const editPage = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const { _id, updatedAt, createdAt, ...updatedData } = req.body;

        // Encuentra la página que necesitas actualizar
        const pageToUpdate = await Design.findOne({ _id: req.params.id, "pages._id": _id });

        if (!pageToUpdate) {
            return res.status(404).json({ message: "Page not found" });
        }

        // Encuentra la página específica dentro del array de pages
        const page = pageToUpdate.pages.id(_id);

        // Actualiza manualmente los campos que necesitas
        Object.assign(page, updatedData);
        page.updatedAt = new Date(); // Actualiza la fecha

        // Guarda el documento actualizado
        await pageToUpdate.save();

        return res.json(pageToUpdate);
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getPagesAndFunnels = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const design = await Design.findOne({ tenantId }).lean();
        const pages = design.pages.filter(page => page.slug !== '').filter(page => page.slug !== 'contacto').filter(page => page.slug !== 'tienda');
        const funnels = await Funnel.find({ tenantId }).lean();
        const services = await Service.find({ tenantId }).lean()

        // Aplanar los steps de los funnels y unirlos con pages
        const allSteps = funnels.map(funnel => funnel.steps.filter(step => step.slug !== '')).flat();
        const allStepsServices = services.map(service => service.steps.filter(step => step.slug && step.slug !== '')).flat()
        const result = [...pages, ...allSteps, ...allStepsServices];

        return res.json(result)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getPagesFunnels = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const design = await Design.find({ tenantId }).lean()
        if (design[0].pages.find(page => page.slug === req.params.id)) {
            const page = design[0].pages.find(page => page.slug === req.params.id)
            return res.json(page)
        } else {
            const funnels = await Funnel.find({ tenantId }).lean()
            if (funnels.find(funnel => funnel.steps.find(step => req.params.id === step.slug))) {
                const step = funnels.find(funnel => funnel.steps.find(step => req.params.id === step.slug)).steps.find(step => step.slug === req.params.id)
                return res.json(step)
            } else {
                const services = await Service.find({ tenantId }).lean()
                if (services.map(service => service.steps.find(step => req.params.id === step.slug))) {
                    const step = services.find(service => service.steps.find(step => req.params.id === step.slug)).steps.find(step => step.slug === req.params.id)
                    return res.json(step)
                }
            }
        }
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const createDefaultPages = async (req, res) => {
    try {
        const tenant = await Tenant.findOne({ tenantId: req.body.tenantId }).lean()

        const newDesign = new Design({
            tenantId: req.body.tenantId,
          header: {
            topStrip: '',
            logo: 'Logo'
          },
          pages: [
            {
              page: 'Inicio',
              slug: '',
              header: true,
              metaTitle: 'Inicio',
              design: [
                { content: 'Carrusel', info: { banner: [{ title: 'Lorem ipsum', description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit.', button: 'Lorem ipsum', buttonLink: '', image: 'https://upviser-website.b-cdn.net/8189.jpg' }], textColor: '#111111' } },
                { content: 'Suscripción', info: { title: 'Suscribete a nuestra lista' } }
              ]
            },
            {
              page: 'Tienda',
              slug: 'tienda',
              header: true,
              metaTitle: '',
              design: [
                { content: 'Bloque 3', info: { title: 'Tienda' } },
                { content: 'Categorias 2', info: { products: '' } },
                { content: 'Productos' }
              ]
            },
            {
              page: 'Blog',
              slug: 'blog',
              header: true
            },
            {
              page: 'Contacto',
              slug: 'contacto',
              header: true,
              metaTitle: 'Contacto',
              design: [
                { content: 'Contacto', info: { title: 'Contacto', description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Consequatur tempora ipsam nesciunt impedit explicabo, alias similique illum neque voluptas nemo eos distinctio vero. Veritatis iste et porro inventore tempore commodi?', titleForm: 'Llena el siguiente formulario' } },
                { content: 'Suscripción', info: { title: 'Suscribete a nuestra lista' } }
              ]
            }
          ],
          footer: { bgColor: '#111111', textColor: '#ffffff' },
          cartPage: { bgColor: '#ffffff', textColor: '#111111', detailsColor: '#ffffff' },
          checkoutPage: { bgColor: '#ffffff', textColor: '#111111', detailsColor: '#ffffff' },
          productPage: [{ reviews: true, design: [{ content: 'Carrusel productos' }, { content: 'Suscripción' }] }],
          categoryPage: [{ design: [{ content: 'Bloque 6' }, { content: 'Categorias 2' }, { content: 'Productos' }, { content: 'Suscripción' }] }]
        })
        const newDesignSave = await newDesign.save()
        const newTag = new ClientTag({ tenantId: req.body.tenantId, tag: 'suscriptores' })
        await newTag.save()
        const newTag2 = new ClientTag({ tenantId: req.body.tenantId, tag: 'clientes' })
        await newTag2.save()
        const newTag3 = new ClientTag({ tenantId: req.body.tenantId, tag: 'formulario-contacto' })
        await newTag3.save()
        const newTag4 = new ClientTag({ tenantId: req.body.tenantId, tag: 'desuscrito' })
        await newTag4.save()
        const newDataFirstName = new ClientData({ tenantId: req.body.tenantId, name: 'Nombre', data: 'firstName' })
        await newDataFirstName.save()
        const newDataLastName = new ClientData({ tenantId: req.body.tenantId, name: 'Apellido', data: 'lastName' })
        await newDataLastName.save()
        const newDataEmail = new ClientData({ tenantId: req.body.tenantId, name: 'Email', data: 'email' })
        await newDataEmail.save()
        const newDataPhone = new ClientData({ tenantId: req.body.tenantId, name: 'Teléfono', data: 'phone' })
        await newDataPhone.save()
        const newStyle = new Style({ tenantId: req.body.tenantId, design: 'Ninguno', form: 'Cuadradas', primary: '#2167e5', button: '#ffffff' })
        await newStyle.save()
        await axios.post(
            "https://api.brevo.com/v3/senders",
            {
                name: tenant.domain.replace('.upviser.cl', ''),
                email: `${tenant.domain.replace('.upviser.cl', '')}@emails.upviser.cl`,
            },
            { headers: { "api-key": process.env.BREVO_API } }
        );
        const newDomain = new Domain({ tenantId: req.body.tenantId, domain: tenant.domain, name: tenant.domain.replace('.upviser.cl', ''), email: `contacto@${tenant.domain}` })
        await newDomain.save()
        const newChatTag1 = new ChatTag({ tenantId: req.body.tenantId, tag: 'Compra', color: '#00CE1B' })
        await newChatTag1.save()
        const newChatTag2 = new ChatTag({ tenantId: req.body.tenantId, tag: 'Agente IA', color: '#003CFF' })
        await newChatTag2.save()
        const newChatTag3 = new ChatTag({ tenantId: req.body.tenantId, tag: 'Productos', color: '#8000FF' })
        await newChatTag3.save()
        const newChatTag4 = new ChatTag({ tenantId: req.body.tenantId, tag: 'Transferido', color: '#FF6200' })
        await newChatTag4.save()
        return res.json(newDesignSave)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const createStyle = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const style = await Style.findOne({ tenantId }).lean()
        if (style) {
            const updateStyle = await Style.findByIdAndUpdate(style._id, req.body, { new: true })
            return res.json(updateStyle)
        } else {
            const newStyle = new Style(req.body)
            const newStyleSave = await newStyle.save()
            return res.json(newStyleSave)
        }
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getStyle = async (req, res) => {
    const tenantId = req.headers['x-tenant-id']
    try {
        const style = await Style.findOne({ tenantId }).lean()
        return res.json(style)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}