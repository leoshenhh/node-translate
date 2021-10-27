import {appid, appSecret} from "./private";

const https = require('https');
const querystring = require('querystring');
const md5 = require('md5');

const errorMap = {
    52001: '请求超时',
    52002: '系统错误',
    52003: '未授权用户',
    unknown: '服务器繁忙'
}

export const translate = (q) => {
    const salt = Math.floor(Math.random() * 10000000000)
    const sign = md5(appid + q + salt + appSecret)
    let from,to;
    if(/[a-zA-z]/.test(q[0])){
        from = 'en'
        to = 'zh'
    }else{
        from = 'zh'
        to = 'en'
    }

    const query: string = querystring.stringify({q, from, to, appid, salt, sign});

    const options = {
        hostname: 'api.fanyi.baidu.com',
        port: 443,
        path: '/api/trans/vip/translate?' + query,
        method: 'GET'
    };

    const request = https.request(options, (response) => {
        const chunks = []
        response.on('data', (chunk) => {
            chunks.push(chunk)
        });
        response.on('end', () => {
            const string = Buffer.concat(chunks).toString()
            type BaiduResult = {
                // 冒号前面加问号 表示 error_code 可能没有
                error_code?: string;
                error_msg?: string;
                from: string;
                to: string;
                trans_result: {
                    src: string;
                    dst: string;
                }[]
            }
            const obj: BaiduResult = JSON.parse(string)

            if(obj.error_code){
                if(obj.error_code in errorMap) {
                    console.error(errorMap[obj.error_code])
                }else{
                    console.log(obj.error_msg)
                }
                process.exit(2)
            }else{
                obj.trans_result.map(item =>{
                    console.log(item.dst)
                })
                process.exit(0)
            }
        })
    });

    request.on('error', (e) => {
        console.error(e)
    });
    request.end();
}
