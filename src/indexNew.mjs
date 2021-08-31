import axios from 'axios'
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
    const {mblog: {text, original_pic}, scheme} = item

    const news = generate(text,scheme,original_pic)

    axios.post(reportWxUrl, news)
}
