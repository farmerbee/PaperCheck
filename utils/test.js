const { readDocx , readDoc} = require('./file');
const searchThread = require('./crawl');
const splitContents = require('./splitContents');


const paths = ['/home/lighthouse/PaperCheck/uploads/182.150.122.5/何宇辰_3200604002_工学1班_AI在智慧医疗行业调查报告.docx'];

(async () => {
	let start = Date.now();
	const results = [];
	for (let i = 0; i < paths.length; i++) {
		let path = paths[i];
		let start = Date.now();
		let contents = await readDocx(path);
		let frags = splitContents(contents);
		contents = null;
		const res = await searchThread(frags, 15);
		frags = null;
		results.push(res);
		console.log(res);
		console.log(`time used ${(Date.now() - start) / 1000} seconds`);
	}

	console.log(results);
	console.log(`time used ${(Date.now() - start) / 1000} seconds`);
})()
