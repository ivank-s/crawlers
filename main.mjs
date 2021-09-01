import {fetchUserContainerId, fetchUserWeiBoIds} from './src/indexNew.mjs'
import {WEIBO_ID, DURATION} from './src/config.mjs'
import { ToadScheduler, SimpleIntervalJob, Task } from 'toad-scheduler'

const scheduler = new ToadScheduler()

const containerId = await fetchUserContainerId(WEIBO_ID)

const t = () => {
    fetchUserWeiBoIds(containerId)
}

const task = new Task('weibo', t)

const job = new SimpleIntervalJob({ seconds: DURATION }, task)

scheduler.addSimpleIntervalJob(job)

