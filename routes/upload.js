const express = require('express');
const router = express.Router();


// 统计单个IP下接收到文件的数量
// 共享给其它路由
let fileInfo = {};

router.post('/', (req, res, next) => {
    // console.log('enter upload2');
    try {
        let reqIp = req.ip.split(':').pop(),
            fileName = req.files.values().next().value.originalname,
            reqObj = fileInfo[reqIp];

        if (reqObj) {
            reqObj.number += 1;
            reqObj.files.push(fileName);
        } else {
            reqObj = {
                number: 1,
                files: [fileName]
            }
            fileInfo[reqIp] = reqObj;
        }


        if (!req.files) {
            res.json({
                status: false,
                message: 'no file recieved'
            })
        }


        res.status(200);
        res.send('ok');
    } catch (err) {
        console.log(err);
    }

    // console.log(fileInfo);
})


exports.router = router;
exports.fileInfo = fileInfo;