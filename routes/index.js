var express = require('express');
var router = express.Router();
const path = require('path');
// const checkFile = require('../utils/checkFile');
const { getRatio, fileExist, fileChecked } = require('../utils/sql');


// const getDir = require('../utils/path');
const { getFiles } = require('../utils/sql');
const { readDir } = require('../utils/file');


// 根据请求文件的名字，轮询查询数据库
// 当目标文件已完成查重时，返回结果
router.get('/*', async function (req, res, next) {
  const reqIp = req.ip.split(':').pop();
  try {
    if (req.query.name) {
      let fileName = req.query.name;

      if (await fileExist(fileName, reqIp) && await fileChecked(fileName, reqIp)) {
        let ratio = await getRatio(fileName, reqIp);
        res.status(200).send(ratio.toString());
      } else {

        res.status(250).send('null');
      }

    } 
    // 当IP再次登陆时，响应查询IP下所有文件
    else if (req.query.files) {
      const files = await getFiles(reqIp),
        targetDir = path.join(__dirname, '..', 'uploads', reqIp);
      const docs = await readDir(targetDir),
        fileNum = docs.length;
      try {
        const resJson = {
          'number': fileNum,
          'files': []
        }
        Array.prototype.forEach.call(files, file => {
          if (file.checked) {
            resJson.files.push([file.title, file.ratio])
          }
        })
        res.status(200).json(resJson);
      } catch (err) {
        console.log(err);
      }
    }
  } catch (err) {
    console.log(err);
  }


});


module.exports = router;
