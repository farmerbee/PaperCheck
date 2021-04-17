const {readDocx} = require('./file');
const searchThread = require('./crawl');
const splitContents = require('./splitContents');

const path = '/home/lighthouse/aiserver/entry/uploads/182.150.122.5/大数据的5大核心技术 - Copy (4).docx';

(async () => {
   let start = Date.now(); 
   let contents = await readDocx(path);
   let frags = splitContents(contents);
   contents = null;
   const res = await searchThread(frags); 
   frags = null;
   console.log(res);
   console.log(`time used ${(Date.now()-start)/1000} seconds`);
})()