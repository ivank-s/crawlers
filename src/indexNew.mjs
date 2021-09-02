import axios from 'axios'
import moment from 'moment'
import  Crawler from './util/crawler.js'
const reportWxUrl = 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=b206b0d0-198f-46e9-9ff5-d767ccd59fa3'
const reportedIds = []

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

      return containerid
}

export const fetchUserWeiBoIds = async(containerid) => {
    const res = await crawler.queue({
        uri: weiboInfo + containerid,
        preRequest: options => log('开始抓取list'),
    })
    const cards = JSON.parse(res.body).data.cards
    cards.forEach(item => {
        const {card_type, mblog: {id}} = item
        if (card_type === 9) {
            if (!reportedIds.includes(id)){
                reportMsg(item)
                reportedIds.push(id)
            }
        }
    })
    log('抓取结束')
}

const generate = (item) => {
    const {mblog: {text, original_pic, created_at}, scheme} = item
    const time = created_at && moment(created_at).format('YYYY-MM-DD hh:mm:ss')
    return original_pic ? {
        "msgtype": "news",
        "news": {
            "articles": [
                {
                    "title": time,
                    description: text,
                    url: scheme,
                    picurl: original_pic
                }
            ]
        }
    } : {
        "msgtype": "markdown",
        "markdown": {
            "content": `${text}\n >发布时间: ${time}\n >[原文链接](${scheme})`
        }
    }
}

const reportMsg = item => {
    const news = generate(item)

    axios.post(reportWxUrl, news)
}


