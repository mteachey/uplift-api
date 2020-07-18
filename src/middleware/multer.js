//import multer from ‘multer’;
const multer = require('multer');

//const DatauriParser = require('datauri/parser');
//const Datauri = require('datauri');

//const path = require('path');

//tells multer to save file to memory first since might not have admin privledges in Heroku to write to remote computer
const storage = multer.memoryStorage();

//set the storage option .single('image') specifis the field name multer should go to when it's looking for the file
const multerUploads = multer({ storage }).single('image');

//const buffer = new DatauriParser();

//const dUri = new Datauri();
/**
* @description This function converts the buffer to data url
* @param {Object} req containing the field object
* @returns {String} The data url from the string buffer
*/
//const dataUri = req => dUri.format(path.extname(req.file.originalname).toString(), req.file.buffer);

const dataUri = req => {
    console.log(`this is the req.file.originalname`)
    console.log(req.file.originalname);
    return //req.file.originalname
}

//module.exports = {multerUploads, dataUri};
module.exports = {multerUploads, dataUri};