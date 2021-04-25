const EventEmitter = require('events');
class EmptyEmitter extends EventEmitter { }


// 流水线并行执行异步任务
//此处为clickSearch()函数定制了退出机制
async function concurrentRun(fn, max = 15, interableArg, ...args) {
    if (!interableArg.length) return;

    let replyList = [],
        // 监听空返回值到达阈值事件
        emptyEmitter = new EmptyEmitter();
    emptyEmitter.on('empty', () => {
        replyList = [[1, 0]];
    })
    let count = interableArg.length;
    //为clickSearch()定制的计数
    //当连续返回的空超过10个时退出
    let counter = 0;

    // 任务执行程序
    const schedule = async (index) => {
        return new Promise(async (resolve) => {
            const firstArg = interableArg[index];
            // 迭代结束

            if (!firstArg || counter >= 7) {
                // if (!firstArg) {
                if (counter >= 7) {
                    emptyEmitter.emit('empty');
                }
                return resolve();
            }
            const reply = await fn(firstArg, ...args);
            // process中也会调用此函数，其返回为undefined
            if (reply && reply[1] == 0)
                counter++;
            else
                counter--;

            // 执行当前异步任务
            replyList[index] = reply;

            // 执行完当前任务后，继续执行任务池的剩余任务
            await schedule(index + max);
            resolve();
        });
    };

    // 任务池执行程序
    const scheduleList = new Array(max)
        .fill(0)
        .map((_, index) => schedule(index));
    const r = await Promise.all(scheduleList);

    if (counter >= 7) {
        replyList = [[1, 0]]
    }

    return replyList;
}

module.exports = concurrentRun;