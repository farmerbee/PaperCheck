const express = require('express');
const router = express.Router();
const fs = require('fs');

const xlsx = require('node-xlsx');

const { getFiles } = require('../utils/sql');


// 处理下载请求，本例生成xlsx文档然后发送
router.get('/', async (req, res, next) => {
    const reqIp = req.ip.split(':').pop();
    const datas = await getFiles(reqIp);
    if (datas.length == 0) {
        res.status(250).send('null');
    } else {
        const dataLen = datas.length,
            results = [['文件名', '重复率']];
        for (let i = 0; i < dataLen; i++) {
            const data = datas[i];
            results.push([data.title.split('.')[0], data.ratio]);
        }

        const options = { '!cols': [{ wch: 80 }, {wch: 10}] };

        const buffer = xlsx.build([{ name: '查重结果', data: results }], options)
        fs.writeFile('result.xlsx', buffer, (err) => {
            if (!err) {
                res.download('result.xlsx', 'result.xlsx', (err) => {
                    if (err) {
                        console.log('download result error', err);
                    }
                })
            } else {
                console.log('write result error');
            }
        })
    }
})


module.exports = router;