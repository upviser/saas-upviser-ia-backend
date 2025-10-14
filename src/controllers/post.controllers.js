import Post from '../models/Post.js'

export const CreatePost = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const newPost = new Post({...req.body, tenantId})
        await newPost.save()
        return res.send(newPost)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getPosts = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const posts = await Post.find({ tenantId }).lean()
        if (!posts) return res.sendStatus(204)
        return res.send(posts)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const getPost = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const post = await Post.findById(req.params.id)
        if (!post) return res.sendStatus(204)
        return res.send(post)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const updatePost = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const postUpdate = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true })
        if (!postUpdate) return res.sendStatus(204)
        return res.send(postUpdate)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export const deletePost = async (req, res) => {
    try {
        const tenantId = req.headers['x-tenant-id']
        const postDelete = await Post.findByIdAndRemove(req.params.id)
        return res.json(postDelete)
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}