const Diff = require('diff');

// 返回输入句子中重复数的最大值
function wordsMath(ori, candis){
    return candis.reduce((max, cur) => {
        return Math.max(_compare(ori, cur), max);
    }, 0);
}


// 比较两个字符串
function _compare(str1, str2){
    const res = Diff.diffChars(str1, str2);
    return res.reduce((accum, cur) => {
        if(cur.hasOwnProperty('added')){
            return accum;
        }

        return accum + cur.count;
    }, 0)
}


// 汇总匹配信息
function sentenceMath(matchPairs){
    let res = matchPairs.reduce((counter, cur) => {
        return [counter[0]+cur[0], counter[1]+ cur[1]];
    }, [0, 0])

    return  (res[1]/res[0]*100).toFixed(2);
}

exports.wordsMath = wordsMath;
exports.sentenceMath = sentenceMath;