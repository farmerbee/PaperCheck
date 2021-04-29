const { wordsMath, sentenceMath } = require('./wordMath');
const concurrentRun = require('./concurrent');
const puppeteer = require('puppeteer');
const fs = require('fs').promises;

// 检索关键字，返回包含原始长度和最大匹配长度的数组
async function clickSearch(keyword, browser, times = 0) {
    if (times > 1) {
        return [0, 0];
    }
    const page = await browser.newPage();
    page.setDefaultTimeout(40000);
    //page.setDefaultTimeout(0);
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.72 Safari/537.36 Edg/90.0.818.42');
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
        await Promise.all([
            page.waitForNavigation(),
            page.click('#su', {
                delay: 100
            })
        ])


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



        await page.close();

    } catch (error) {
        try {
            await page.close();
        } catch (err) { }
    }

    // 若上次返回为空，则再请求一次
    if (result.length == 0 && times == 0) {
        return await clickSearch(keyword, browser, times + 1);
    }
    //console.log(result);


    let matchCount = wordsMath(keyword, result);

    return [keyword.length, matchCount];

}


//对关键字序列进行检索，返回重复度number值，精确到小数点后两位
async function searchThread(keyList, concurrency, local = false) {
    console.log(keyList.length);
    let browser = null,
        proxy = null;
    if (!local) {
        proxy = await getProxy(PROXY_SERVER, 15);
        // 第一次获取代理失败，则再尝试第二次
        if (!proxy) {
            proxy = await getProxy(PROXY_SERVER, 15);
        }
    }

    console.log(proxy);
    //请求到可用IP，则使用代理，没有则用本地IP
    if (proxy) {
        browser = await puppeteer.launch({
            executablePath: '/snap/bin/chromium',
            args: [
                `--proxy-server=${proxy}`,
                '--no-sandbox',
                "--disabled-setupid-sandbox"
            ],
            ignoreDefaultArgs: [
                '--disable-extensions'
            ]
        });
    } else {
        browser = await puppeteer.launch({
            executablePath: '/snap/bin/chromium',
            args: [
                '--no-sandbox',
                "--disabled-setupid-sandbox"
            ],
            ignoreDefaultArgs: [
                '--disable-extensions'
            ]
        });
    }

    let res = await concurrentRun(clickSearch, concurrency, keyList, browser);
    await browser.close();
    return parseFloat(sentenceMath(res));
}


//获取代理IP,并验证可用性
const axios = require('axios');
const needle = require('needle');

async function get_proxy(proxy_server) {
    let ctn = 10;
    let res = null;
    while (ctn > 0) {
        try {
            res = await axios.get(proxy_server);
            let [host, port] = res.data.split(':');
            // console.log(host, port)
            try {
                let res2 = await needle('get', 'https://www.baidu.com', {
                    proxy: res.data,
                    //设置5秒超时
                    response_timeout: 5000,
                    read_timeout: 5000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.72 Safari/537.36 Edg/90.0.818.42'
                    }
                }),
                    res3 = await needle('get', 'https://www.baidu.com/s?wd=nodejs', {
                        proxy: res.data,
                        //设置5秒超时
                        response_timeout: 8000,
                        read_timeout: 8000,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.72 Safari/537.36 Edg/90.0.818.42'
                        }
                    })

                if (res2.statusCode == 200 && res3.statusCode == 200) {
                    console.log('ok')
                    break;
                }
            } catch (e) {
                // console.log('res2', e);

                res = null;
            }

        }
        catch (err) {
            // console.log('res', err)
            res = null;
        }
        ctn--;
    }
    if (res)
        return res.data;
    else
        return res;
}


async function getProxy(proxyServer, num = 10) {
    const proxies = [];
    for (let i = 0; i < num; i++) {
        let res = await axios.get(proxyServer);
        if (res.data) {
            proxies.push(res.data);
        }
    }

    const tasks = [];

    for (p of proxies) {
        const options = {
            proxy: p,
            //设置5秒超时
            response_timeout: 5000,
            read_timeout: 5000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.72 Safari/537.36 Edg/90.0.818.42'
            }
        }
        tasks.push(new Promise((resolve, reject) => {
            needle.get('https://www.baidu.com', options, (err, res) => {
                // if (err || res.statusCode != 200) {
                if (err || res.statusCode >= 400) {
                    reject(null);
                }

                needle.get('https://www.baidu.com/s?wd=nodejs', options, (err, res) => {
                    // if (err || res.statusCode != 200) {
                    if (err || res.statusCode >= 400) {
                        reject(null);
                    }

                    resolve(p);
                })
            })
        }));
    }

    try {
        let result = await Promise.any(tasks);
        return result;
    } catch (err) {
        // console.log(err);
        return null;
    }
}





module.exports = searchThread;
