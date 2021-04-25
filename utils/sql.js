const mysql = require('mysql2/promise');

const sqlOptions = {
    host: 'localhost',
    user: 'ai',
    password: '110',
    database: 'ai'
}



// 查看进程是否在运行
async function checkUsability() {
    const connection = await mysql.createConnection(sqlOptions);
    await connection.connect();
    let qString = 'select * from status';
    let status = await connection.query(qString);
    await connection.end();
    return !status[0][0].checking;
}


// 设置进程占用状态
async function setUsing(usable) {
    const connection = await mysql.createConnection(sqlOptions);
    await connection.connect();
    let qString = `update status set checking=${usable}`;
    await connection.query(qString);
    await connection.end();

}


// 插入数据:ip,文件
async function insert(info) {
    const connection = await mysql.createConnection(sqlOptions);
    await connection.connect();
    let qString = null;
    if (info.fileName && info.ip) {
        qString = `insert into documents values ("${info.fileName}",0,0,"${info.ip}" )`;
    } else if (!info.fileName && info.ip) {
        qString = `insert into  ips (ip) values ("${info.ip}")`;
    }
    let status = await connection.query(qString);
    await connection.end();
}

// 插入重复率信息
async function insertMatchInfo(opt) {
    const connection = await mysql.createConnection(sqlOptions);
    await connection.connect();
    let qString = `update documents set checked=1,ratio=${opt.ratio} where title="${opt.fileName}" and ip="${opt.ip}"`;
    await connection.query(qString);
    await connection.end();


}


// 获取IP信息：ip,checking(是否已经处理),返回对象
async function getIpInfo(ip) {
    const connection = await mysql.createConnection(sqlOptions);
    let exist = false;
    await connection.connect();
    const qString = `select ip,checking from ips where ip="${ip}"`;
    let [ips, _] = await connection.query(qString);
    // ips.forEach(p => {
    //     if (ip == p.ip)
    //         exist = true;
    // })
    await connection.end();
    return ips[0];
}


// 查看文件在数据库中是否存在
async function fileExist(fileName, ip) {
    const connection = await mysql.createConnection(sqlOptions);
    let exist = false;
    await connection.connect();
    const qString = `select title from documents where ip="${ip}"`;
    let [files, _] = await connection.query(qString);
    await connection.end();
    files.forEach(file => {
        if (file.title == fileName)
            exist = true;
    })
    return exist;
}


// 检查相关文件是否已被处理
async function fileChecked(fileName, ip) {
    const connection = await mysql.createConnection(sqlOptions);
    await connection.connect();
    const qString = `select checked from documents where title="${fileName}" and ip="${ip}"`;
    const [res, _] = await connection.query(qString);
    await connection.end();
    return res[0].checked;
}


// 检索相关文件的重复率
async function getRatio(fileName, ip) {
    const connection = await mysql.createConnection(sqlOptions);
    await connection.connect();
    let qString = `select ratio from documents where title="${fileName}" and ip="${ip}"`;
    let [res, _] = await connection.query(qString);
    await connection.end();
    return res[0].ratio;
}

// 获取指定IP下所有文件的所有信息数组,
async function getFiles(ip) {
    const connection = await mysql.createConnection(sqlOptions);
    await connection.connect();
    let qString = `select title, ratio, checked from documents where ip="${ip}"`;
    const [res, _] = await connection.query(qString);
    await connection.end();
    return res;

}


async function lockIp(ip, lock=1) {
    const connection = await mysql.createConnection(sqlOptions);
    await connection.connect();
    let qString = `update ips set checking=${lock} where ip="${ip}"`;
    await connection.query(qString);
    await connection.end();


}




exports.lockIp = lockIp;
exports.getFiles = getFiles;
exports.setUsing = setUsing;
exports.fileExist = fileExist;
exports.getIpInfo = getIpInfo;
exports.checkUsability = checkUsability;
exports.insert = insert;
exports.fileChecked = fileChecked;
exports.insertMatchInfo = insertMatchInfo;
exports.getRatio = getRatio;