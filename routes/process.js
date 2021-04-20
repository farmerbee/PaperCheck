const expres = require('express');
const router = expres.Router();
const fs = require('fs').promises;

const getDir = require('../utils/path');
const checkFile = require('../utils/checkFile');
const { fileExist, checkIp, checkUsability, setUsing, insert, fileChecked, insertMatchInfo} = require('../utils/sql');

const { fileInfo } = require('./upload');

router.post('/', async (req, res, next) => {
    const usable = await checkUsability();
    if (usable) {
        await setUsing();
        const number = req.body.number,
            reqIp = req.ip.split(':').pop(),
            fileNum = fileInfo[reqIp].number,
            files = fileInfo[reqIp].files;

        /* TODO:query the database */

        const start = Date.now();
        for (let i = 0; i < fileNum; i++) {
            //checkFile
            const fileName = files[i];
            if(!await fileExist()){
                await insert({
                    fileName:fileName,
                    ip: reqIp 
                })
            }else if(await fileChecked()){
                continue;
            }
            let filePath = `${getDir('uploads')}/${reqIp}/${fileName}`;
            res = await checkFile(filePath);
            await insertMatchInfo({
                fileNum: fileName,
                ip: reqIp,
                ratio: res
            })
            // await fs.writeFile('result.txt', `\n${(Date.now() - start) / 1000} seconds used: ${res} \n`, { flag: 'a' });
            // results.push(res);
        }

        console.log(`time used: ${(Date.now()-start)/1000} seconds`)
    }

})


exports.router = router;