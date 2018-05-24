const HtmlImagePool = require('../index');
const fs = require('fs');
const util = require('util');
const writeFile = util.promisify(fs.writeFile);
const textHtml = (i) => `<html><body><span style="font-size: 14px;">Hello World${i}</span></body></html>`;
const pool = new HtmlImagePool({size: 1});

(async function(){
    let arr = [];
    for (let i=0; i<100; i++)
    {
        arr.push(i);
    }
    console.time('generate_screenshots');
    await Promise.all(arr.map(
        async (num) => {
            console.log('i', num);
            const buffer = await pool.generateFromHtml({html: textHtml(num), fullPage: true});
            console.log(buffer);
            await writeFile(`./testImages/test${num}.png`, buffer);
            console.log('written num', num);
        }
    ));
    console.timeEnd('generate_screenshots');
    console.log('writed');
})();