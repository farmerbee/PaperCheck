const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const getDir = require('../utils/path');
const { checkIp, insert } = require('../utils/sql');

//首页路由
router.get('/', async (req, res, next) => {
    reqIp = req.ip.split(':').pop();
    // 请求IP访问过，则查询数据库
    if (await checkIp(reqIp)) {
        // res.redirect('/index');
    } else {
        await insert({ ip: `${reqIp}` });
        let targetDir = `${getDir('uploads')}/${reqIp}`;
        try {
            fs.accessSync(targetDir);
        } catch (error) {
            fs.mkdirSync(targetDir);
        }
    }

    res.sendFile(path.join(__dirname, '..', 'views', 'ai.html'))
})

exports.router = router;