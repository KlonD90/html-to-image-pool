const puppeteer = require('puppeteer');
const assert = require('assert');


class ImageGenerationPool{
    constructor(options = {size: 10}) {
        assert.ok(options, 'should be options');
        assert.ok(options.size, 'options should have size');
        assert.ok(typeof options.size === 'number' && options.size > 0, 'size should be number and greater than zero');
        assert.ok(Number.isInteger(options.size), 'size should be integer');
        this.pool = [];
        this.tasks = [];
        for (let i=0; i<options.size; i++)
        {
            this.pool.push({
                status: 'free',
                inited: false,
                task: null,
                initPromise: null,
                page: null
            });
        }
        this.browser = null;
        this.initPromise = null;
    }

    init(){
        this.initPromise = new Promise((resolve, reject) => {
            puppeteer.launch()
                .then(browser => {
                    this.browser = browser;
                    resolve();
                })
                .catch(reject);
        });
        return this.initPromise;
    }

    getFreeNodes(){
        return this.pool.filter(x => x.status === 'free');
    }

    getWaitTasks(){
        return this.tasks.filter(x => x.status === 'wait');
    }

    initNode(node){
        node.initPromise = new Promise(async (resolve, reject) => {
            try {
                node.page = await this.browser.newPage();
                node.inited = true;
                resolve();
            } catch(e) {
                reject(e);
            }
        }) ;
        return node.initPromise;
    }

    async process(){
        if (this.browser === null)
        {
            if (this.initPromise)
            {
                await this.initPromise;
            }
            else
            {
                await this.init();
            }
        }
        const freeNodes = this.getFreeNodes();
        const waitTasks = this.getWaitTasks();
        let workingNodes = [];

        for (let i=0; i<freeNodes.length && i<waitTasks.length; i++)
        {
            let curNode = freeNodes[i];
            if (!curNode.inited)
            {
                if (curNode.initPromise)
                {
                    await curNode.initPromise;
                }
                else
                {
                    await this.initNode(curNode);
                }
            }
            let curTask = waitTasks[i];
            console.log('curTask', curTask);
            curNode.status = 'pending';
            curNode.task = curTask;
            curTask.status = 'pending';
            workingNodes.push(curNode);
        }
        console.log('workingNodes', workingNodes.length);
        if (workingNodes.length) {

            await Promise.all(workingNodes.map(
                async node => {
                    await this.processTask(node);
                    if (this.getWaitTasks().length) {
                        this.process();
                    }
                }
            ));
        }
    }

    async processTask(node){
        const task = node.task;
        console.log('task', task);
        try {
            await node.page.setContent(task.html);
            const buffer = await node.page.screenshot(task.screenshotOptions);
            const content = await node.page.content();
            console.log('content', content);
            console.log(buffer, task);
            task.resolve(buffer);
        } catch(e){
            task.reject(e);
        }
        this.tasks = this.tasks.filter(x => x !== task);
        node.task = null;
        node.status = 'free';
    }

    generateFromHtml(options){
        assert.ok(options.html, 'should be html');
        assert.ok(typeof options.html === 'string', 'html should be a string');
        const {html, ...screenshotOptions} = options;
        return new Promise((resolve, reject) => {
            this.tasks.push({
                html,
                screenshotOptions,
                resolve,
                reject,
                status: 'wait',
            });
            this.process();
        });
    }
}

module.exports = ImageGenerationPool;