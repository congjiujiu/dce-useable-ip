const fs = require('fs');
const path = require('path');
const axios = require('axios');
const colors = require('colors');

function main() {
    fs.readFile(`${__dirname}/ips`, {
        flag: 'r+',
        encoding: 'utf8'
    }, (err, data) => {
        if(err) {
            console.error(err);
            return;
        }
        let ips = data.trim();
        if (!ips) {
            console.log('空文件');
        }
    
        ips = splitIps(ips);
        ips = getData(ips);
    
        getAll(ips);
    });
}

function splitIps(data) {
    return data.split(/\n|\r/);
}

function orgnizeAddress(ip) {
    return `http://${ip}/dce/license/check`;
}

function getData(ips) {
    const promises = ips.map(ip => {
        return axios.get(orgnizeAddress(ip), {
            timeout: 3000,
        })
        .then(res => {
            return {
                status: res.status,
                ip,
            }
        })
        .catch(err => {
            return {
                status: 403,
                ip,
            }
        });
    });

    return promises;
}

function getUsable(ips) {
    return ips.filter(ip => ip.status === 200);
}

function getIpFromRes(ips) {
    return ips.map(ip => ip.ip);
}

function getAll(ips) {
    Promise.all(ips).then(res => {
        let usableIps = getUsable(res);
        usableIps = getIpFromRes(usableIps);

        showGoodIps(usableIps);
    }).catch(err => {
        console.log(err);
    });
}

function showGoodIps(ips) {
    if (!ips.length) {
        console.log('没有可用节点，去找后端同学谈谈心吧！'.red);
    }
    ips.forEach(ip => {
        console.log(`${ip} 可用`.green);
    });
}

main();