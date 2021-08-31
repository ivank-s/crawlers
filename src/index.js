var Crawler = require('crawler')
const { ToadScheduler, SimpleIntervalJob, Task } = require('toad-scheduler')

const scheduler = new ToadScheduler()

const weiboInfo = 'https://m.weibo.cn/api/container/getIndex?type=uid&value=2048344461&containerid='
const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36',
    'Content-Type': 'application/x-www-form-urlencoded',
    'Connection': 'close',
    'Accept-Language': 'zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3'
}

const c = new Crawler({
    headers,
    maxConnections: 1,
    rateLimit: 1000,
    jQuery: false,
    callback: function (error, res, done) {
        if (error) {
            console.log(error)
        } else {
            const { $ } = res
            console.log($)
        }
        done()
    }
})

let weiboIds = []
let containerId = undefined

c.queue([{
    uri: 'https://m.weibo.cn/api/container/getIndex?type=uid&value=1984416767',
    callback: function (error, res, done) {
        if (error) {
            console.log(error)
        } else {
            const tabs = JSON.parse(res.body)?.data?.tabsInfo?.tabs || []

            const { containerid } = tabs.filter(({ tab_type }) => tab_type === 'weibo')[0] || {}
            console.log(containerid)
            containerId = containerid
            done()

            const task = new Task('simple task', () => {
                c.queue([{
                    uri: weiboInfo + containerid,
                    callback: function (error, res, done) {
                        if (error) {
                            console.log(error)
                        } else {
                            const weiboCards = JSON.parse(res.body)?.data?.cards
                            const cardsIds = weiboCards.filter(({ card_type }) => card_type === 9).map(item => item?.mblog?.id)
                            weiboIds = [...cardsIds]
                            console.log(weiboIds)
                            done()
                        }
                    }
                }])
            })
            const job = new SimpleIntervalJob({ seconds: 10, }, task)

            scheduler.addSimpleIntervalJob(job)
        }
        done()
    }
}])