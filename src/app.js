require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const logger = require('./logger')
const { NODE_ENV } = require('./config')
const usersRouter = require('./users/users-router.js')
const postsRouter = require('./posts/posts-router.js')
const connectionsRouter = require('./connections/connections-router.js')
const bookmarksRouter = require('./bookmarks/bookmarks-router.js')

//new code
const {resolve} = require('path');
const {uploader, cloudinaryConfig} = require('./config/cloudinaryConfig.js')
const {multerUploads, dataUri} = require('./middleware/multer.js');
//const multerUploads = require('./middleware/multer.js');
const { urlencoded, json } = require('body-parser');

const app = express()

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())

//new code
app.use(json())


//validate API_Token
/*app.use(function validateBearerToken(req, res, next){
    const apiToken = process.env.API_TOKEN
    const authToken = req.get('Authorization')

    if(!authToken || authToken.split(' ')[1] !== apiToken){
       logger.error(`Unauthorized request to path: ${req.path}`);
        return res.status(401).json({ error: 'Unauthorized request'})
    }
    next()
})*/

app.use('/api/users',usersRouter)
app.use('/api/posts',postsRouter)
app.use('/api/connections',connectionsRouter)
app.use('/api/bookmarks',bookmarksRouter)


app.get('/',(req,res)=>{
    res.send('Hello, world!')
})

app.use('/api/upload', cloudinaryConfig);

//app.get('/api/upload', (req, res) => res.sendFile(resolve(__dirname, '../public/index.html')));

app.post('/api/upload', multerUploads, (req, res) => {
    res.send('That worked')
    if(req.file) {
        //const file = dataUri(req).content;
        const file = dataUri(req);
        console.log('this is the rs=es.file object')
        console.log(req.file)
        console.log(`this is the file from the app`)
       // console.log(file);
      /* return uploader.upload(file).then((result) => {
            const image = result.url;
            return res.status(200).json({
                messge: 'Your image has been uploded successfully to cloudinary',
                data: {
                image
                }
            })
        })
        .catch((err) => res.status(400).json({
            messge: 'someting went wrong while processing your request',
                data: {
                err
                }
        }))*/
    }//end of if 
});

app.use(function errorHandler(error, req, res, next){
    let response
    if(NODE_ENV === 'production'){
        response = {error :{message:'server error'}}
    }
    else{
        console.error(error)
        response = { message: error.message, error}
    }
    res.status(500).json(response)
})

module.exports = app