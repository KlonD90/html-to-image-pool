const HtmlImagePool = require('../index');
const fs = require('fs');
const util = require('util');
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);
// const textHtml = (i) => `<html><body><span style="font-size: 14px;">Hello World${i}</span></body></html>`;
const textHtml = (i) => `
<section style="" class="mz-feature-item mz-feature-item_size-medium mz-feature-item_type-digit">
    <section class="mz-feature-item__content">
        <div class="mz-feature-item__content__inner">
            <header class="mz-feature-item__header">
                ${i}
            </header>
            <p class="mz-feature-item__announce">
                рубля и 34 копейки составил, по версии дознания, ущерб из-за надписи «Нет фан-зоне» на указателе к ЧМ-2018 возле МГУ
            </p>
            <span class="mz-feature-item__source">
                Источник: материалы уголовного дела о вандализме
            </span>
            <span class="mz-feature-item__info mz-content-meta-info">
                <span class="mz-content-meta-info__item">
                    Цифра&nbsp;
                </span>
                <span class="mz-content-meta-info__item">
                    4 июня 2018, 15:42
                </span>
            </span>
        </div>
    </section>
    <div class="mz-feature-item__overlay">
    </div>
    <a href="/number/2018/06/04/msumoney" class="mz-feature-item__link"></a>
</section>
`
const pool = new HtmlImagePool({size: 8});

(async function(){
    let style;
    try {
        style = await readFile('./tests/style.html', {encoding: 'utf8'})
    } catch (e) {
        console.error(e)
    }
    let arr = [];
    for (let i=0; i<100; i++)
    {
        arr.push(i);
    }
    console.time('generate_screenshots');;
    await Promise.all(arr.map(
        async (num) => {
            console.log('i', num);
            const buffer = await pool.generateFromHtml({html: style + textHtml(num), fullPage: true});
            // console.log(buffer);
            await writeFile(`./testImages/test${num}.png`, buffer);
            console.log('written num', num);
        }
    ));
    console.timeEnd('generate_screenshots');
    console.log('writed');
})();