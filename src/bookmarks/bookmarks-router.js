const express = require('express')
const xss = require('xss')
const path = require('path')
const BookmarksService = require('./bookmarks-service.js')
const UsersService = require('../users/users-service.js')
const PostsService = require('../posts/posts-service.js')

const bookmarksRouter = express.Router()
const jsonParser = express.json()

bookmarksRouter
    .route('/')
    .get((req, res, next)=>{
        const { userid } = req.query;

        if(!userid){
            BookmarksService.getAllBookmarks(
                req.app.get('db')    
            )
            .then(bookmarks=>{
                res.json(bookmarks)
            })
            .catch(next)  
        }
        if(userid){
            BookmarksService.getBookmarksByUserId(
                req.app.get('db'),
                userid   
            )
            .then(bookmarks=>{
                if(bookmarks.length===0){
                    return res.status(404).json({
                        error:{message:`That user has no bookmarks`}
                    })
                }
                res.json(bookmarks)
            })
            .catch(next)  
        }
    })
    .post(jsonParser,(req, res, next)=>{
        
        const { user_id, post_id, content } = req.body
        const newBookmark = { user_id, post_id, content }

        if(!user_id || ! post_id ){
            return res.status(400).json({
                error: { message : `Missing user_id or post_id in request body` }
            })
        }
        //check to make sure the user_id and post_id exist before allowing to post
        UsersService.getUserByUserId(
            req.app.get('db'),
            user_id   
        )
        .then(user=>{
            if(!user){
                return res.status(404).json({
                    error: {message: `User with id ${user_id} doesn't exist` }
                })
            }    
        })
        
        PostsService.getPostByPostId(
            req.app.get('db'),
            post_id   
        )
        .then(post=>{
            if(!post){
                return res.status(404).json({
                    error: {message: `Post with id ${post_id} doesn't exist` }
                })
            }    
        })

        BookmarksService.insertNewBookmark(
            req.app.get('db'),
            newBookmark
        )
        .then(bookmark=>{
            res
                .status(201)
                .location(path.posix.join(req.originalUrl + `/${bookmark.id}`))
                .json(bookmark)
        })
        .catch(next)
    })
bookmarksRouter
    .route(`/:bookmark_id`)
    .all((req, res, next)=>{
        BookmarksService.getBookmarksByBookmarkId(
            req.app.get('db'),
            req.params.bookmark_id
        )
        .then(bookmark=>{
            if(!bookmark){
                return res.status(404).json({
                    error: {message: `Bookmark doesn't exist` }
                })
            }
            res.bookmark = bookmark
            next()
        })
        .catch(next)       
    })
    .get((req, res, next)=>{
        res.json(res.bookmark)
    })
    .delete((req, res)=>{
        BookmarksService.deleteBookmark(
            req.app.get('db'),
            req.params.bookmark_id
        )
        .then(()=>{
            res.status(204).end()
        })
    })

module.exports = bookmarksRouter