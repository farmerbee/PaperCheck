const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const getDir = require('../utils/path');
const { getIpInfo, insert, getFiles } = require('../utils/sql');

//首页路由
router.get('/', async (req, res, next) => {
    reqIp = req.ip.split(':').pop();
    // 请求IP访问过并且已经上传过文件
    const ipStatus = await getIpInfo(reqIp),
        fileStatus = await getFiles(reqIp);
    if (ipStatus && fileStatus[0]) {
        // IP下文件正在在处理
        if (ipStatus.checking == 1 || fileStatus[0].checked == 1) {
            res.sendFile(path.join(__dirname, '..', 'views' , 'user.html'));
        }
        // 该IP上传处理过文件，但现在并没有检索该IP
        else {
            res.sendFile(path.join(__dirname, '..', 'views', 'ai.html'));
        }

    }
    // IP初次登陆,ip入库，并且创建响应的文件夹
    else if (!ipStatus) {
        await insert({ ip: `${reqIp}` });
        let targetDir = `${getDir('uploads')}/${reqIp}`;
        try {
            fs.accessSync(targetDir);
        } catch (error) {
            fs.mkdirSync(targetDir);
        }
        res.sendFile(path.join(__dirname, '..', 'views', 'ai.html'))
    }
    // IP访问过，但没有上传过文件
	else{
        res.sendFile(path.join(__dirname, '..', 'views', 'ai.html'))
	}
})

exports.router = router;
