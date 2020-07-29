const express = require('express')
const xss = require('xss')
const path = require('path')
const PostsService = require('./posts-service.js')

const postsRouter = express.Router()
const jsonParser = express.json()

const serializedPost = post =>({
    post_id:post.post_id,
    user_id:post.user_id,
    title:xss(post.title),
    link:xss(post.link),
    by:xss(post.by),
    content:xss(post.content),
    post_type:post.post_type,
    username:xss(post.username),
    date_created:post.date_created,
    bookmark_content:xss(post.bookmark_content),
    bookmark_id:post.bookmark_id,
    image_path:xss(post.image_path)
})

const serializedPostForPost = post =>({
    id:post.id,
    user_id:post.user_id,
    title:xss(post.title),
    link:xss(post.link),
    by:xss(post.by),
    content:xss(post.content),
    post_type:post.post_type,
    date_created:post.date_created,
    image_path:xss(post.image_path)
})

postsRouter
    .route('/')
    .get((req, res, next)=>{
       
        const {userid, userconnection, userbookmark}=req.query;

        if(!userid && !userconnection && !userbookmark){
            PostsService.getAllPosts(
                req.app.get('db'),
            )
            .then(posts=>{
                res.json(posts.map(serializedPost))
            })
            .catch(next)
        }
        if(userid){
            PostsService.getPostsByUserId(
                req.app.get('db'),
                userid
            )
            .then(posts=>{
                if(posts.length===0){
                    return res.status(404).json({
                        error: {message: `Posts with that username or id do not exsit`}
                    })
                }
                
                res.json(posts.map(serializedPost)) 
            })
            .catch(next)
        }
        if(userconnection){
            PostsService.getConnectionPosts(
                req.app.get('db'),
                userconnection
            )
            .then(posts=>{
                if(posts.length===0){
                    return res.status(404).json({
                        error: {message: `Posts with that username or id do not exist`}
                    })
                }
                res.json(posts) 
            })
            .catch(next)
        }
        if(userbookmark){
            PostsService.getBookmarkPosts(
                req.app.get('db'),
                userbookmark
            )
            .then(posts=>{
                if(posts.length===0){
                    return res.status(404).json({
                        error: {message: `That username or id does not exist`}
                    })
                }
                res.json(posts) 
            })
            .catch(next)
        }
    })
    .post(jsonParser, (req, res, next)=>{
        const { user_id, title, link, by,content, post_type, image_path } = req.body
        const newPost = { user_id, title, link,by,content, post_type, image_path }

        const validPostTypes = [`reflection`, `music`,`event`,`book`,`podcast`]
    
            if(!user_id){
                return res.status(400).json({
                    error: { message : `Missing user_id in request body` }
                })
            }
            if(!post_type){
                return res.status(400).json({
                    error: { message : `Missing post_type in request body` }
                })
            }

            if(validPostTypes.indexOf(post_type)===-1){
                return res.status(400).json({
                    error: { message : `Post type must be either reflection, music, event ,book, or podcast` }
                })
            }

            //check for required content depending on post_type
            if(!image_path){
                if(post_type==='event'&&(!title || !content || !link)){
                    return res.status(400).json({
                        error: { message : `Event post type must be include a title, content and link` }
                    })
                }
                if(post_type==='music'&&(!title || !by || !link)){
                    return res.status(400).json({
                        error: { message : `Music post type must be include a title, by and link` }
                    })
                }
                if(post_type==='podcast'&&(!title || !content || !link)){
                    return res.status(400).json({
                        error: { message : `Podcast post type must be include a title, content and link` }
                    })
                }
                if(post_type==='book'&&(!title || !by )){
                    return res.status(400).json({
                        error: { message : `Book post type must be include a title and by` }
                    })
                }
                if(post_type==='reflection' && !content){
                    return res.status(400).json({
                        error: { message : `Reflection post type must be include a content` }
                    })
                }
            }

            PostsService.insertNewPost(
                req.app.get('db'),
                newPost
            )
            .then(post=>{
                console.log(post)
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl + `/${post.id}`))
                    .json(serializedPostForPost(post))
            })
            .catch(next) 
    })
postsRouter
    .route(`/:post_id`)
    .all((req, res, next)=>{
        PostsService.getPostByPostId(
            req.app.get('db'),
            req.params.post_id
        )
        .then(post=>{
            if(!post){
                return res.status(404).json({
                    error: {message: `Post doesn't exist` }
                })
            }
            res.post = post
            next()
        })
        .catch(next)       
    })
    .get((req, res, next)=>{
        res.json(serializedPost(res.post))
    })
    .delete((req, res, next)=>{
        PostsService.deletePost(
            req.app.get('db'),
            req.params.post_id
        )
        .then(()=>{
            res.status(204).end()
        })
        .catch(next)
    })
    

module.exports = postsRouter