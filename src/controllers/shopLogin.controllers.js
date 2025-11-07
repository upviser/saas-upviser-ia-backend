import ShopLogin from '../models/ShopLogin.js'
import bcrypt from 'bcryptjs'

export const createAccount = async (req, res) => {
    try {
        const { name, email, password, type, permissions, plan, tenantId } = req.body
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        if (!regex.test(email)) return res.send({ message: 'El email no es valido' })
        if (password.length < 6) return res.send({ message: 'La contraseña tiene que tener minimo 6 caracteres' })
        const user = await ShopLogin.findOne({ email: email, tenantId })
        if (user) return res.send({ message: 'El email ya esta registrado' })
        const hashedPassword = await bcrypt.hash(password, 12)
        const newAccount = new ShopLogin({ ...req.body, password: hashedPassword })
        const accountSave = await newAccount.save()
        res.send({ name, email: accountSave.email, _id: accountSave._id, type, permissions, plan, tenantId })
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: error.message})
    }
}

export const getAccountData = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const accountData = await ShopLogin.findById(req.params.id).lean()
        if (!accountData) return res.sendStatus(404)
        return res.send(accountData)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getAccountDataPassword = async (req, res) => {
    try {
        const accountData = await ShopLogin.findOne({email: req.params.id}).select('+password').lean()
        if (!accountData) return res.sendStatus(404)
        return res.send(accountData)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const editAccountData = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        if (!regex.test(req.body.email)) return res.send({ message: 'El email no es valido' })
        if (req.body.password) {
            if (req.body.password.length < 6) return res.send({ message: 'La contraseña tiene que tener minimo 6 caracteres' })
            const hashedPassword = await bcrypt.hash(req.body.password, 12)
            const editAccountData = await ShopLogin.findByIdAndUpdate(req.body._id, { ...req.body, password: hashedPassword }, { new: true })
            return res.send(editAccountData)
        } else {
            const editAccountData = await ShopLogin.findByIdAndUpdate(req.body._id, req.body, { new: true })
            return res.send(editAccountData)
        }
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getAccounts = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const accounts = await ShopLogin.find({ tenantId }).lean()
        return res.send(accounts)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getAccountAdmin = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const account = await ShopLogin.findOne({ tenantId, type: "Administrador" }).lean()
        return res.send(account)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const editAccountAdmin = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const account = await ShopLogin.findOneAndUpdate({ tenantId, type: "Administrador" }, req.body, { new: true }).lean()
        return res.send(account)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const deleteAccount = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        await ShopLogin.findByIdAndRemove(req.params.id)
        return res.send({ success: 'OK' })
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}