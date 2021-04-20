var express = require('express');
var router = express.Router();
const path = require('path');
const checkFile = require('../utils/checkFile');
const { getRatio, fileExist, fileChecked } = require('../utils/sql');


const getDir = require('../utils/path');


// 根据请求文件的名字，轮询查询数据库
// 当目标文件已完成查重时，返回结果
router.get('/*', async function (req, res, next) {
  const reqIp = req.ip.split(':').pop();
  if (req.query.name) {
    let fileName = req.query.name;

    let recQuery = setInterval(async () => {
      if (await fileExist(fileName, reqIp)) {
        if (await fileChecked(fileName, reqIp)) {
          let ratio = await getRatio(fileName, reqIp);
          res.status(200).send(ratio.toString());
          clearInterval(recQuery);
        }
      }
    }, 10000);
  }

  // res.send(200)
  /* TODO */

});


module.exports = router;
