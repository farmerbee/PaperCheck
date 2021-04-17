

// 分割文档文本，返回文档片段组成字符串数组
// const splitContents = function (contents, delimiters=/[,|.|;|，|。|；.*?]/) {
const splitContents = function(contents, delimiters=/[;|；|。.*?]/){
    const referList = ['参考', '参考：', '参考:',
        '参考文献', '参考文献:', '参考文献：'
    ]
    const fragments = [];
    // 通过换行符分割文本
    const paragraphs = contents.split('\n').filter(para => para),
        pLen = paragraphs.length;

    for (let i = 0; i < pLen; i++) {
        let p = paragraphs[i];
        let frags = p.split(delimiters),
            fLen = frags.length;

        for (let i = 0; i < fLen; i++) {
            let frag = frags[i];
            // 参考文献不进行查重
            if (referList.includes(frag)) {
                return fragments;
            }
            // 剔除空串和长度在5及以下的串
            if (frag && frag.length > 5) {
                fragments.push(frag);
            }
        }
    }

    return fragments;

}



module.exports = splitContents;