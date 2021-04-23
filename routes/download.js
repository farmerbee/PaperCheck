const express = require('express');
const router = express.Router();
const fs = require('fs');

const xlsx = require('node-xlsx');

const { getFiles } = require('../utils/sql');

router.get('/', async (req, res, next) => {
    const reqIp = req.ip.split(':').pop();
    const datas = await getFiles(reqIp);
    if (datas.length == 0) {
        res.status(250).send('null');
    } else {
        const dataLen = datas.length,
            results = [['序号', '文件名', '重复率']];
        for (let i = 0; i < dataLen; i++) {
            const data = datas[i];
            results.push([`${i + 1}`, data.title, data.ratio]);
        }

        const options = { '!cols': [{ wch: 6 }, { wch: 80 }, {wch: 10}] };

        const buffer = xlsx.build([{ name: '查重结果', data: results }], options)
        // buffer = Buffer.from(results.toString()); 
        // res.setHeader('Content-Language', 'zh-CN');
        fs.writeFile('result.xlsx', buffer, (err) => {
            if (!err) {
                // res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=utf-8')
                res.download('result.xlsx', '查重结果.xlsx', (err) => {
                    if (err) {
                        console.log('download result error', err);
                    }
                })
            } else {
                console.log('write result error');
            }
        })
        // res.status(200).send(buffer);
    }
})


module.exports = router;