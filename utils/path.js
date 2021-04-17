const path= require('path');

const getDir = (dirname) => path.join(require.main.path,'..', dirname);
// console.log(getDir('views'))
module.exports = getDir;