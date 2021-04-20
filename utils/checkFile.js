const { readFile} = require('./file');
const searchThread = require('./crawl');
const splitContents = require('./splitContents');


// 根据文件路径爬取，并将对比结果返回
async function checkFile(path){
	let contents = await readFile(path);
	let frags = splitContents(contents);
	let matchDegree = await searchThread(frags);

	return matchDegree;
}


module.exports = checkFile;
