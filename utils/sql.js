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
// const connect = promisify(connection.connect);
// const end = promisify(connection.end);
// const query = promisify(connection.query);

// const query = async function (qString) {
//     return new Promise((resolve, reject) => {
//        connection.connect(err => {
//            if(err){
//                connection.end();
//             reject(err);
//            }
//             else{
//                 connection.query(qString, (err, res)=>{
//                     if(err){
//                         connection.end();
//                         reject(err);
//                     }else{
//                         connection.end();
//                         resolve(res);
//                     }
//                 })
//             }
//        }) 
//     })
// }


// 查看进程是否在运行
async function checkUsability() {
    const connection = await mysql.createConnection(sqlOptions);
    await connection.connect();
    let qString = 'select * from status';
    let status = await connection.query(qString);
    await connection.end();
    return status[0][0].checking;
}

async function setUsing() {
    const connection = await mysql.createConnection(sqlOptions);
    await connection.connect();
    let qString = 'update status set checking=1';
    await connection.query(qString);
    await connection.end();

}

async function insertFile(fileName, ip) {
    const connection = await mysql.createConnection(sqlOptions);
    await connection.connect();
    const qString = `insert into documents values ("${fileName}",0,0,"${ip}" )`;
    let status = await connection.query(qString);
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

async function checkFile(fileName, ip) {
    const connection = await mysql.createConnection(sqlOptions);
    let exist = false;
    await connection.connect();
    const qString = `select title from documents where ip="${ip}"`;
    let [files, _] = await connection.query(qString);
    await connection.end();
    files.forEach(file =>{
        if(file.title == fileName)
            exist = true;
    })
    return exist;
}


// console.log(insertFile('xxx'));
// module.exports = checkDatabase;

(async () => {
    // console.log(await checkUsability())
    // console.log(await setUsing());
    // await insertFile('fdff', '11.11.11.11');
    // console.log(await checkIp(null))
    // console.log(await checkIp('11.11.11.11'))
    // console.log(await checkFile('fdff', '11.11.11.11'))
})()