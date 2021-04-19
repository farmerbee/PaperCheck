const expres = require('express');
const router = expres.Router();

const getDir = require('../utils/path');

const {fileInfo} = require('./upload');

router.post('/', (req, res, next) => {
    const number = req.body.number,
        reqIp = req.ip.split(':').pop(),
        fileNum = fileInfo[reqIp].number,
        files = fileInfo[reqIp].files;

    /* TODO:query the database */
   
    let results = [];
    for(let i=0; i<fileNum; i++){
        const fileName = files[i];
        let filePath = `${getDir('uploads')}/${reqIp}/${fileName}`;
         
    }
    
})


exports.router = router;