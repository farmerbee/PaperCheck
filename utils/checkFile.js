const { readFile} = require('./file');
const searchThread = require('./crawl');
const splitContents = require('./splitContents');


const path = '/home/lighthouse/PaperCheck/uploads/文成江_3200607036_电信1班_AI在目标检测行业调查报告(1).doc';

async function checkFile(path){
	let contents = await readFile(path);
	let frags = splitContents(contents);
	let matchDegree = await searchThread(frags);

	return [path, matchDegree];
}

// (async () => {
// 	const fs = require('fs').promises;
// 	res = await checkFile(path);
// 	await fs.writeFlie('result.txt',`${path}:${res}\n`)
// 	console.log(res);
// })()

module.exports = checkFile;
