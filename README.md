This library is smart way to use a headless chrome for image generation with pooling mechanism inside for performance issues.

You need to know that is persistent in memory. So use a less pool size or another library if you don't have enough memory.

It's based on https://github.com/GoogleChrome/puppeteer

# Requirements

nodejs version >= 8

# Installation

`npm i -s html-to-image-pool`

or

`yarn add html-to-image-pool`

# API

##  ImageGenerationPool

Signature:

```
new ImageGenerationPool(options : {size: number})
```

Way of usage:

```
const ImageGenerationPool = require('html-to-image-pool');
const pool = new ImageGenerationPool({size: 25});
```

```
new ImageGenerationPool(options);
```

**Options:**  {*size*: count of pages inside of pool}

This pool implements next methods:

## ImageGenerationPool.generateFromHtml

Signature:

```
ImageGenerationPool.generateFromHtml({
    html: string,
    type: 'jpeg' | 'png',
    quality?: number,
    path?: string,
    clip?: {x: number, y: number, width: number, height: number}
}) : Promise<Buffer>
```

Params:

**html***: html that will be rendered.

**type**: type of generate image. Default is 'png'.

Other options more described here: https://github.com/GoogleChrome/puppeteer/blob/v1.4.0/docs/api.md#pagescreenshotoptions

Examples:

```
async function(){
    await pool.generateFromHtml({
        html: '<html><body><span style="font-size: 14px;">Hello World</span></body></html>'
    });
}
```

Some notes about resources like fonts or images. More convenient way to inject these items inline in HTML.


# Contributions

You are welcome.