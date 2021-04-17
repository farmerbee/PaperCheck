const { readFile} = require('./file');
const searchThread = require('./crawl');
const splitContents = require('./splitContents');


const path = '/home/lighthouse/PaperCheck/uploads/182.150.122.5/3200604001-史奎锐-嵌入式系统论文.docx';

// (async () => {
// 	let start = Date.now();
// 	const results = [];
// 	for (let i = 0; i < paths.length; i++) {
// 		let path = paths[i];
// 		let start = Date.now();
// 		let contents = await readDoc(path);
// 		let frags = splitContents(contents);
// 		contents = null;
// 		const res = await searchThread(frags, 15);
// 		frags = null;
// 		results.push(res);
// 		console.log(res);
// 		console.log(`time used ${(Date.now() - start) / 1000} seconds`);
// 	}

// 	console.log(results);
// 	console.log(`time used ${(Date.now() - start) / 1000} seconds`);
// })()

async function checkFile(path){
	let contents = await readFile(path);
	let frags = splitContents(contents);
	let matchDegree = await searchThread(frags);

	return matchDegree;
}

(async () => {
	res = await checkFile(path);
	console.log(res);
})()