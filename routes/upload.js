const express = require('express');
const router = express.Router();


// 统计单个IP下接收到文件的数量
let fileNum = {};

router.post('/', (req, res, next) => {
    try {
        let reqIp = req.ip.split(':').pop();
        let num = fileNum[reqIp];
        if (num) {
            fileNum[reqIp] = num + 1;
        } else {
            fileNum[reqIp] = 1;
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
})


exports.router = router;
exports.fileNum = fileNum;