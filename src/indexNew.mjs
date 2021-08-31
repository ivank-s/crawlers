// const axios = require('axios')
import axios from 'axios'
import  Crawler from './util/crawler.js'
// const { ToadScheduler, SimpleIntervalJob, Task } = require('toad-scheduler')
const reportWxUrl = 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=b206b0d0-198f-46e9-9ff5-d767ccd59fa3'
const reportedIds = []

// const WEIBO_ID = '1984416767'
const WEIBO_ID = '7668921710'
const weiboInfo = 'https://m.weibo.cn/api/container/getIndex?type=uid&containerid='
const  crawler = new Crawler('weibo')
const {log} = console

export const fetchUserContainerId = async (weiboId) => {
    const res = await crawler.queue({
        uri: `https://m.weibo.cn/api/container/getIndex?type=uid&value=${weiboId}`,
        preRequest: options => log('开始抓取containerId'),
      })

      const tabs = JSON.parse(res.body).data.tabsInfo.tabs || []
      const { containerid } = tabs.filter(({ tab_type }) => tab_type === 'weibo')[0] || {}

      console.log('containerid', containerid)
      return containerid
}

export const fetchUserWeiBoIds = async(containerid) => {
    const res = await crawler.queue({
        uri: weiboInfo + containerid,
        preRequest: options => log('开始抓取list'),
    })
    const cards = JSON.parse(res.body).data.cards

    console.log('cards', cards.length)
    console.log('reportedIds', reportedIds)
    cards.forEach(item => {
        const {card_type, mblog: {id}} = item
        console.log('card_type', card_type)
        if (card_type === 9) {
            if (!reportedIds.includes(id)){
                reportMsg(item)
                reportedIds.push(id)
            }
        }
    })

    // return cards.filter(({ card_type }) => card_type === 9).map(item => item.mblog.id)

}

const generate = (description, url, picurl) => {
    return {
        "msgtype": "news",
        "news": {
            "articles" : [
                {
                    "title" : "通知",
                    description,
                    url,
                    picurl
                }
            ]
        }
    }
}

const reportMsg = item => {
    console.log('item', item)
    const {mblog: {text, original_pic}, scheme} = item

    const news = generate(text,scheme,original_pic)

    axios.post(reportWxUrl, news)
}

const start = async () => {
    const containerId = await fetchUserContainerId(WEIBO_ID)
    // const weiboIds = await fetchUserWeiBoIds(containerId)
    await fetchUserWeiBoIds(containerId)
    log(containerId)
}

start()
