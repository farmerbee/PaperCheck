const expres = require('express');
const router = expres.Router();
const fs = require('fs').promises;

const getDir = require('../utils/path');
const checkFile = require('../utils/checkFile');
const { fileExist, lockIp, checkUsability, setUsing, insert, fileChecked, insertMatchInfo } = require('../utils/sql');

const { fileInfo } = require('./upload');


// 爬取相关文件，并将返回对比结果存入数据库
router.post('/', async (req, res, next) => {
    // console.log(req.body);

    // res.status(200).send('done');
    const usable = await checkUsability();
    if (usable) {
        await setUsing(1);
        // const number = req.body.number,
        const reqIp = req.ip.split(':').pop(),
            fileNum = fileInfo[reqIp].number,
            files = fileInfo[reqIp].files;

        /* TODO:query the database */

        const start = Date.now();
        for (let i = 0; i < fileNum; i++) {
            try {
                await lockIp(reqIp, 1);
                const fileName = files[i];
                if (!await fileExist(fileName, reqIp)) {
                    await insert({
                        fileName: fileName,
                        ip: reqIp
                    })
                } else if (await fileChecked(fileName, reqIp)) {
                    continue;
                }
                console.log(fileName, i);
                let filePath = `${getDir('uploads')}/${reqIp}/${fileName}`;
                let result = await checkFile(filePath);
                await insertMatchInfo({
                    fileName: fileName,
                    ip: reqIp,
                    ratio: result
                })
                // await setUsing(0);
            } catch (err) {
                await lockIp(reqIp, 0);
                await setUsing(0);
                console.log(err);
            }
        }

        await lockIp(reqIp, 0);
        await setUsing(0);
        console.log(`time used: ${(Date.now() - start) / 1000} seconds`);

        res.status(200).send('done');
    } else {
        res.status(250).send('using');
    }

})


exports.router = router;