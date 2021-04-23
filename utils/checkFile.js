const { readFile } = require('./file');
const searchThread = require('./crawl');
const splitContents = require('./splitContents');


// 根据文件路径爬取，并将对比结果返回
// 复检不超过两次 
async function checkFile(path, times = 0, local = false, pre=0) {
	// if (times = 2)
	// return checkFile(path, times+1, true, pre);
	// else if(times > 2)
	// return pre;
	let contents = await readFile(path);
	let frags = splitContents(contents);
	let matchDegree = await searchThread(frags, 10, local);
	console.log('match:  ', matchDegree)
	// 返回为0时，复检
	// if (parseInt(matchDegree) == 0) {
	if (parseInt(matchDegree) < 15) {
		//第二次复检时用本地IP
		if(times > 2)
			return pre;
		if (times == 2)
			local = true
		matchDegree = await checkFile(path, times + 1, local, matchDegree);
	}
	// 重复率小于15%时复检
	// if (parseInt(matchDegree) < 15)
	// matchDegree = await searchThread(frags, 10, local);
	// matchDegree = await checkFile(path, times + 1, local)
	return matchDegree;
}

// (async function () {
// 	start = Date.now();
// 	console.log(await checkFile('uploads/182.150.122.5/王奇_3200607051_2020级一班_人工智能在自动驾驶行业中的应用.doc'));
// 	console.log(`\ntime used ${(Date.now() - start) / 1000} seconds`)
// })()


module.exports = checkFile;
