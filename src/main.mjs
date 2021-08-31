import {fetchUserContainerId, fetchUserWeiBoIds} from './indexNew.mjs'
import {WEIBO_ID} from './config.mjs'
// const {ToadScheduler, SimpleIntervalJob, Task} = require('toad-scheduler')
import { ToadScheduler, SimpleIntervalJob, Task } from 'toad-scheduler'

const scheduler = new ToadScheduler()

const containerId = await fetchUserContainerId(WEIBO_ID)

const t = () => {
    fetchUserWeiBoIds(containerId)
}

const task = new Task('weibo', t)

const job = new SimpleIntervalJob({ seconds: 10, }, task)

scheduler.addSimpleIntervalJob(job)

