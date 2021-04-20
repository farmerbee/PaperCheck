const path= require('path');


// 获得工作主目录中的二级目录
const getDir = (dirname) => path.join(require.main.path,'..', dirname);
module.exports = getDir;