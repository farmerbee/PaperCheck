const { readFile } = require('./file');
const searchThread = require('./crawl');
const splitContents = require('./splitContents');


// 根据文件路径爬取，并将对比结果返回
async function checkFile(path, times = 0, local = false, pre = 0) {
	let contents = await readFile(path);
	let frags = splitContents(contents);

	/****** */
	let matchDegree = 0;
	try {
		matchDegree = await searchThread(frags, 10, local);
	} catch {
	}

	/****** */
	// let matchDegree = await searchThread(frags, 10, local);
	console.log('match:  ', matchDegree)
	//重复率等于0时不记次数复检
	if (parseInt(matchDegree) == 0) {
		matchDegree = await checkFile(path, times, local, matchDegree);
	}
	// 重复率小于15%时复检
	else if (parseInt(matchDegree) < 15) {
		//三次都小于15时，使用最后两次的最大值
		if (times > 1)
			return pre > matchDegree ? pre : matchDegree;
		//第三次复检时用本地IP
		if (times == 1)
			local = true
		matchDegree = await checkFile(path, times + 1, local, matchDegree);
	}

	let secondRes = await searchThread(frags, 10, false);
	//let secondRes = await checkFile(path);
	return parseFloat(matchDegree) > parseFloat(secondRes) ? matchDegree : secondRes;
	//return matchDegree;
}

// (async function () {
// 	start = Date.now();
// 	console.log(await checkFile('/root/PaperCheck/uploads/222.18.126.67/何宇辰_3200604002_工学1班_AI在智慧医疗行业调查报告 - Copy - Copy (36) - Copy.docx'));
// 	console.log(`\ntime used ${(Date.now() - start) / 1000} seconds`)
// })()


module.exports = checkFile;
