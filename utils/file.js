const fileType = require('file-type');
const path = require('path');
const mammoth = require('mammoth')
const fs = require('fs').promises;
const WordExtractor = require('word-extractor');

const extractor = new WordExtractor();

// 获取目标文件的类型，仅检测是否时doc,docx文件
// 返回文件类型字符串Promise
const getFileType = async function (pathName) {
    const stats = await fs.stat(pathName);
    if (await stats.isDirectory()) {
        return 'unsupported-type';
    }
    const typeResult = await fileType.fromFile(pathName);
    const type = typeResult ? typeResult.ext : '';
    if (type == 'docx') {
        return 'docx';
    } else if (type == 'cfb') {
        return 'doc';
    } else {
        return 'unsupported-type';
    }
}


//  读取文件夹，返回包含所有word文件绝对路径的数组Promise
const readDir = async function (dirPath) {
    let files = await fs.readdir(dirPath);
    let wordFiles = [];

    // 将每个文件转换为绝对路径
    files = files.map(file => {
        return path.resolve(dirPath, file);
    });

    // 筛选支持的word文件
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileType = await getFileType(file);
        if (fileType == 'doc' || fileType == 'docx') {
            wordFiles.push(file);
        }
    }

    return wordFiles;
}


// 读取DOC文件，返回文档内容字符串Promise
const readDoc = async function (pathName) {
    const doc = extractor.extract(pathName);

    return (await doc).getBody();
}



// 读取DOCX文档，返回文档内容Promise
const readDocx = async function (pathName) {
    const rawData = await mammoth.extractRawText({ path: pathName });

    return rawData.value;
}




// 根据文件类型读取文档内容，返回字符串
async function readFile(pathName){
    let fileType = await getFileType(pathName);
    let contents = '';
    if(fileType == 'docx'){
        contents = await readDocx(pathName);
    }else if(fileType == 'doc'){
        contents = await readDoc(pathName);
    }

    return contents;
}



// exports.fileType = fileType;
// exports.readDoc = readDoc;
// exports.readDocx = readDocx;
exports.readDir = readDir;
exports.readFile = readFile;






