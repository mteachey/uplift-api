//import multer from ‘multer’;
const multer = require('multer');

const DatauriParser = require('datauri/parser');

const path = require('path');

//tells multer to save file to memory first since might not have admin privledges in Heroku to write to remote computer
const storage = multer.memoryStorage();

//set the storage option .single('image') specifis the field name multer should go to when it's looking for the file
const multerUploads = multer({ storage }).single('image');

//const buffer = new DatauriParser();

module.exports = multerUploads;