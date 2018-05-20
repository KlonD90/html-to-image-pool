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
            });
        }
        this.browser = null;
        this.initPromise = null;
    }

    async init(){
        const browser = await puppeteer.launch();
        this.browser = browser;
        this.process();
    }

    getFreeNodes(){
        return this.pool.filter(x => x.status === 'free');
    }

    getWaitTasks(){
        return this.tasks.filter(x => x.status === 'wait');
    }

    async initNode(node){
        this.browser
    }

    async process(){
        if (this.browser != null)
        {

        }
        const freeNodes = this.getFreeNodes();
        const waitTasks = this.getWaitTasks();
        let workingNodes = [];

        for (let i=0; i<freeNodes.length && i<waitTasks.length; i++)
        {
            let curNode = freeNodes[i];
            if (!curNode.inited)
            {
                await this.initNode(curNode);
            }
            let curTask = waitTasks[i];
            curNode.status = 'pending';
            curNode.task = curTask;
            curTask.status = 'pending';
            workingNodes.push(curNode);
        }
        workingNodes.map(
            node => {

            }
        )
    }

    async processTask(task){
        if (!curNode.inited)
        {

        }
    }

    generateFromHtml
}