const express = require('express')
const xss = require('xss')
//const path = require('path')
const BookmarksService = require('./bookmarks-service.js')

const bookmarksRouter = express.Router()
const jsonParser = express.json()

module.exports = bookmarksRouter