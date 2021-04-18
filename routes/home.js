const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// const { viewPath } = require('../utils/path');
const getDir = require('../utils/path');

const ipList = new Set();
let reqIp = '';

router.get('/', (req, res, next) => {
    reqIp = req.ip.split(':').pop();
    if (ipList.has(reqIp)) {
        res.redirect('/index');
    } else {
        ipList.add(reqIp);
        let targetDir = `${getDir('uploads')}/${reqIp}`;
        try {
            fs.accessSync(targetDir);
        } catch (error) {
            fs.mkdirSync(targetDir);
        }
        // res.sendFile(path.join(getDir('views'), 'ai.html'));
        res.sendFile(path.join(__dirname, '..', 'views', 'ai.html'))
    }

})

// module.exports = router;
exports.router = router;
exports.ipList = ipList;
exports.reqIp = reqIp;