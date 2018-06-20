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
    }

    async createBrowser () {
        let browser;
        try {
            browser = await puppeteer.launch()
            return browser
        } catch(e) {
            console.error(e)
        }
    }

    get freeNodes() {
        return this.pool.filter(x => x.status === 'free');
    }

    get waitTasks() {
        return this.tasks.filter(x => x.status === 'wait');
    }

    initNode(node){
        node.initPromise = new Promise(async (resolve, reject) => {
            try {
                const browser = await this.createBrowser();
                node.page = await browser.newPage();
                await node.page.setViewport({width: 810, height: 250})
                node.inited = true;
                resolve();
            } catch(e) {
                reject(e);
            }
        });
        return node.initPromise;
    }

    async checkNodeInit (curNode) {
        if (curNode.inited) return
        curNode.initPromise
            ? await curNode.initPromise
            : await this.initNode(curNode);
    }

    async assignTaskToNode(task) {
        let curNode = this.freeNodes[0];
        let curTask = task;
        curNode.status = 'pending';
        curNode.task = task;
        curTask.status = 'pending';
        this.tasks = this.tasks.filter(x => x !== task);
        await this.processTask(curNode);
        curNode.task = null;
        curNode.status = 'free';
    }

    async process() {
        if (!this.waitTasks.length) return;
        if (this.freeNodes.length) {
            await this.assignTaskToNode(this.waitTasks[0]);
            this.process();
        }
    }

    async processTask(node) {
        await this.checkNodeInit(node);
        if (node.page === null) return;

        const task = node.task;
        try {
            await node.page.setContent(task.html);
            const buffer = await node.page.screenshot(task.screenshotOptions);
            // const content = await node.page.content();
            // console.log('Content:', content)
            task.resolve(buffer);
        } catch(e){
            task.reject(e);
        }
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