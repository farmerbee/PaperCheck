const mysql = require('mysql2/promise');
// const { promisify } = require('util');

// const connection = mysql.createConnection({
// });
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
async function setUsing() {
    const connection = await mysql.createConnection(sqlOptions);
    await connection.connect();
    let qString = 'update status set checking=1';
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
        qString = `insert into ips values ("${info.ip}")`;
    }
    let status = await connection.query(qString);
    await connection.end();
}


async function insertMatchInfo(opt) {
    const connection = await mysql.createConnection(sqlOptions);
    await connection.connect();
    let qString = `update documents set checked=1,ratio=${opt.ratio} where title="${opt.fileName}" and ip="${opt.ip}"`;
    await connection.query(qString);
    await connection.end();


}


// 检查IP是否已经存在
async function checkIp(ip) {
    const connection = await mysql.createConnection(sqlOptions);
    let exist = false;
    await connection.connect();
    const qString = `select ip from ips`;
    let [ips, _] = await connection.query(qString);
    ips.forEach(p => {
        if (ip == p.ip)
            exist = true;
    })
    await connection.end();
    return exist;
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

async function fileChecked(fileName, ip) {
    const connection = await mysql.createConnection(sqlOptions);
    await connection.connect();
    const qString = `select checked from documents where title="${fileName}" and ip="${ip}"`;
    const [res, _] = await connection.query(qString);
    await connection.end();
    return res[0].checked;
}



(async () => {
    await insertMatchInfo({
        fileName: 'fddffff',
        ratio: 22.22,
        ip: '12.12.12.12'
    })
    // console.log(await fileChecked('fddffff', '12.12.12.12'))
    // console.log(await checkUsability())
    // console.log(await setUsing());
    // await insertFile('fdff', '11.11.11.11');
    // console.log(await checkIp(null))
    // console.log(await checkIp('11.11.11.11'))
    // console.log(await checkFile('fdff', '11.11.11.11'))
    // await insert({ ip: '12.12.12.12', fileName: 'fddffff' });
})()

exports.setUsing = setUsing;
exports.fileExist = fileExist;
exports.checkIp = checkIp;
exports.checkUsability = checkUsability;
exports.insert = insert;
exports.fileChecked = fileChecked;
exports.insertMatchInfo = insertMatchInfo;