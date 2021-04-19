const expres = require('express');
const router = expres.Router();
const fs = require('fs').promises;

const getDir = require('../utils/path');
const checkFile = require('../utils/checkFile');

const {fileInfo} = require('./upload');

router.post('/', async (req, res, next) => {
    const number = req.body.number,
        reqIp = req.ip.split(':').pop(),
        fileNum = fileInfo[reqIp].number,
        files = fileInfo[reqIp].files;

    /* TODO:query the database */
    
    const start = Date.now();
    let results = [];
    for(let i=0; i<fileNum; i++){
        const fileName = files[i];
        let filePath = `${getDir('uploads')}/${reqIp}/${fileName}`;
        results.push(await checkFile(filePath)); 
    }

    // console.log(results);
    await fs.writeFile('result.txt',`${(Date.now()-start)/1000} seconds used: ${results} \n`, {flag: 'a'});
    
})


exports.router = router;