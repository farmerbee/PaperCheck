const { wordsMath, sentenceMath } = require('./wordMath');
const concurrentRun = require('./concurrent');
const puppeteer = require('puppeteer');
const fs = require('fs').promises;

// 检索关键字，返回包含原始长度和最大匹配长度的数组
async function clickSearch(keyword, browser, times = 0) {
    if (times > 1) {
        return;
    }
    // browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.setDefaultTimeout(0);
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36 Edg/89.0.774.57');
    //屏蔽css,js,png文件的请求
    await page.setRequestInterception(true);
    page.on('request', req => {
        const reqUrl = req.url();
        if (reqUrl.endsWith('.css') || reqUrl.endsWith('.png') || reqUrl.endsWith('.js')) {
            req.abort();
        } else {
            req.continue();
        }
    })

    let result = [];
    HOME = 'https://www.baidu.com';
    // 模拟在首页点击搜索关键字
    try {
        await page.goto(HOME);
        await page.type('#kw', keyword, {
            delay: 100
        });
        // await page.waitForTimeout(100);
        await Promise.all([
            page.waitForNavigation(),
            //待定
            // page.waitForSelector('#container'),
            page.click('#su', {
                delay: 100
            })
        ])
        // await page.waitForTimeout(Math.random() * 100);
        // await Promise.all([page.goto(HOME + '/s?wd=' + keyword),
        // page.waitForNavigation()]);

        // await page.screenshot({
        //     path: `${Math.random()}.png`
        // })

        // console.clear();
        // Symbol = Math.random() > 0.5 ? '*.*' : '-.-';
        // console.log(Symbol);
        // 解析返回的网页
        result = await page.$eval('body', function (document) {
            // 百度检索无结果，则返回为空数组
            const noContent = document.querySelector('.content_none');
            if (noContent) {
                return [''];
            }
            // 响应页为检索结果的条目
            // 不包含广告推广
            const allResults = document.querySelectorAll('.result');

            const items = Array.prototype.map.call(allResults, node => {
                const type = resultType(node);
                if (type == 'blog') {
                    const sumNode = node.querySelector('.blog-summary-break-all__3Lxe3');
                    return finalResolve(sumNode);
                } else if (type == 'normal') {
                    const contentNode = node.querySelector('.c-abstract');
                    return finalResolve(contentNode);
                } else {
                    return '';
                }
            }).slice(0, 5);

            // 返回匹配结果
            return items;

            // 检查节点的类型
            function resultType(node) {
                const tpl = node.getAttribute('tpl');
                if (tpl == 'open_source_software_blog') {  // blog node
                    return 'blog';
                } else if (tpl == 'se_com_default') {  // normal node
                    return 'normal';
                } else {
                    // other主要可能的信息为贴吧内容，根据论文性质，默认其与贴吧内容无关
                    return 'other';
                }

            }


            // 解析快照节点
            // 返回节点快照的内容，不包含标题
            function finalResolve(node) {
                if (node) {
                    return node.innerText;
                } else {
                    return '';
                }
            }
        });


        // await fs.writeFile('result.txt', 'key:'+keyword+'\tvalues:'+result+'\n\n', {
        //     flag: 'a'
        // });
        // console.log(keyword, result)
        console.clear();
        console.log('*');

        await page.close();

    } catch (error) {
        // console.log(error);
    }

    if (result.length == 0 && times == 0) {
        return await clickSearch(keyword, browser, times + 1);
    }
    console.log(result);


    let matchCount = wordsMath(keyword, result);

    return [keyword.length, matchCount];

}


//对关键字序列进行检索，返回重复度number值，精确到小数点后两位
async function searchThread(keyList, concurrency) {
    console.log(keyList.length);
    const proxy = await get_proxy('http://localhost:5555/random');
	console.log(proxy);
    let browser = null;

    if (proxy) {
        browser = await puppeteer.launch({
            args: [
                `--proxy-server=${proxy}`
            ]
        });
    } else {
        browser = await puppeteer.launch();
    }

    // const browser = await puppeteer.launch();
    let res = await concurrentRun(clickSearch, concurrency, keyList, browser);
    await browser.close();
    return  sentenceMath(parseFloat(res));
}


//获取代理IP
const axios = require('axios');
// async function get_proxy(proxy_server) {

//     res = await axios.get(proxy_server);

//     return res.data;
// }

async function get_proxy(proxy_server) {
    let ctn = 3;
    let res = null;
    while (ctn > 0) {
        try {
            res = await axios.get(proxy_server);
            let [host, port] = res.data.split(':');
            try {
                let res2 = await axios.get('https://www.baidu.com', {
                    proxy: {
                        host: host,
                        port: port
                    },
                    timeout: 5000
                })

                if (res2.status == 200) {
                    break;
                }
            } catch (e) {

            }

        }
        catch {

        }
        ctn--;
    }
    if (res)
        return res.data;
    else
        return res;
}

// (async () => {

//     console.log(await get_proxy('http://localhost:5555/random'));
// })()

module.exports = searchThread;
