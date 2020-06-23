const express = require('express')
const xss = require('xss')
const path = require('path')
const ConnectionsService = require('./connections-service.js')
const UsersService = require('../users/users-service.js')

const connectionsRouter = express.Router()
const jsonParser = express.json()

connectionsRouter
    .route('/')
    .get((req, res, next)=>{
        const { userid } = req.query;

        if(!userid){
            ConnectionsService.getAllConnections(
                req.app.get('db')    
            )
            .then(connections=>{
                res.json(connections)
            })
        }
        if(userid){
            ConnectionsService.getConnectionsByUserId(
                req.app.get('db'),
                userid   
            )
            .then(connections=>{
                if(connections.length===0){
                    return res.status(404).json({
                        error:{message:`That user has no connections`}
                    })
                }
                res.json(connections)
            })
            .catch(next)  
        }
    })
    .post(jsonParser,(req, res, next)=>{
        
        const { user_id, followee_id } = req.body
        const newConnection = { user_id, followee_id }

        if(!user_id || ! followee_id){
            return res.status(400).json({
                error: { message : `Missing user_id or followee_id in request body` }
            })
        }
        //check to make sure the user_id and followee_id exist before allowing to post
        UsersService.getUserByUserId(
            req.app.get('db'),
            user_id   
        )
        .then(user=>{
            if(!user){
                return res.status(404).json({
                    error: {message: `User with ${user_id} doesn't exist` }
                })
            }    
        })
        .then(
        UsersService.getUserByUserId(
            req.app.get('db'),
            followee_id   
        )
        .then(user=>{
            if(!user){
                return res.status(404).json({
                    error: {message: `User with ${followee_id} doesn't exist` }
                })
            }    
        }))
        .then(

        ConnectionsService.insertNewConnection(
            req.app.get('db'),
            newConnection
        )
        .then(connection=>{
            res
                .status(201)
                .location(path.posix.join(req.originalUrl + `/${connection.id}`))
                .json(connection)
        }))
        .catch(next)
    })
connectionsRouter
    .route(`/:connection_id`)
    .all((req, res, next)=>{
        ConnectionsService.getConnectionByConnectionId(
            req.app.get('db'),
            req.params.connection_id
        )
        .then(connection=>{
            if(!connection){
                return res.status(404).json({
                    error: {message: `Connection doesn't exist` }
                })
            }
            res.connection = connection
            next()
        })
        .catch(next)       
    })
    .get((req, res, next)=>{
        res.json(connection)
    })
    .delete((req, res, next)=>{
        ConnectionsService.deleteConnection(
            req.app.get('db'),
            req.params.connection_id
        )
        .then(()=>{
            res.status(204).end()
        })
        .catch(next)
    })

module.exports = connectionsRouter