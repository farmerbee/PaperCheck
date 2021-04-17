// 流水线并行执行异步任务
async function concurrentRun(fn, max=5,interableArg, ...args) {
    if (!interableArg.length) return;

    const replyList = []; 
    const count = interableArg.length; 

    // 任务执行程序
    const schedule = async (index) => {
        return new Promise(async (resolve) => {
            const firstArg = interableArg[index];
            // 迭代结束
            if(!firstArg){
                
                return resolve();
            }
            const reply = await fn(firstArg, ...args);

            // 执行当前异步任务
            // const reply = await subTask();
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

    return replyList;
}

module.exports = concurrentRun;