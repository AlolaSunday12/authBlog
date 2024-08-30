const express = require('express');
const router = express.Router();
const Blog = require('../models/blog');
//const profileRoutes = require('../routes/blogRoutes');
//const User = require( '../models/user' );

const authCheck = (req, res, next) => {
    if (!req.isAuthenticated() || !req.user) {
        return res.redirect('/auth/login') ;
    }
    next();
};

router.post('/create', authCheck, async (req, res) => {
    const {title, description} = req.body;

    try {
        const newBlog = await Blog.create({
            title,
            description
        })
        res.json({newBlog})
    } catch (err) {
        console.error(err)
        return res.status(500).send('Internal server error');
    }
});

router.get('/allBlogs', async (req, res) => {
    
    try {
        const blogs = await Blog.find()

    if (!blogs || !blogs.length === 0) {
        return res.status(404).send('No blogs found')
    }
    return res.status(200).send({blogs});
            
    } catch (err) {
        console.error(err)
        return res.status(500).send('Internal server error');
    }
});

router.get('/blog/:id', authCheck, async (req, res) => {
    const {id} = req.params;

    try {
        const blog = await Blog.findById(id);

        if (!blog) {
            return res.status(404).send('No blog found')
        }
        return res.status(200).send({blog});
    } catch (err) {
        console.error(err);
        return res.status(500).send('Internal server error');
    }
});

router.put('/update/:id', authCheck, async (req, res) => {
    const {id} = req.params;
    const { title, description } = req.body;

    try {
        const blog = await Blog.findByIdAndUpdate(id, 
            { title, description }, // Update with the new title and description
            { new: true } // Option to return the updated document
    );

        if (!blog) {
            return res.status(404).send('No blog found')
        }
        return res.status(200).send({blog});
    } catch (err) {
        console.error(err);
        return res.status(500).send('Internal server error');
    }
});

router.delete('/delete/:id', authCheck, async (req, res) => {
    const {id} = req.params;

    try {
        const blog = await Blog.findByIdAndDelete(id);

        if (!blog) {
            return res.status(404).send('No blog found');
        }
        return res.status(200).send({blog});
    } catch (err) {
        console.error(err)
        return res.status(500).send('')
    }
});

module.exports = router;