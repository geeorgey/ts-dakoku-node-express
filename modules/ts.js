"use strict";

let auth = require("./slack-salesforce-auth"),
    force = require("./force"),
    VERIFICATION_TOKEN = process.env.VERIFICATION_TOKEN;
const logger = require('heroku-logger');

exports.execute = (req, res) => {

    if (req.body.token != VERIFICATION_TOKEN) {
        console.log("Invalid token");
        res.send("Invalid token");
        return;
    }

    let slackUserId = req.body.user_id,
        oauthObj = auth.getOAuthObject(slackUserId);

    var params = {};
    params.method = 'GET';

    force.apexrest(oauthObj,'Dakoku',params) //apexrest を GETで叩くと @HttpGetメソッドが呼び出される https://github.com/ngs/ts-dakoku/blob/8582bff49165692f7a4a0979b20bf62449662c88/apex/src/classes/TSTimeTableAPIController.cls#L17
        .then(data => {
            let timetable = JSON.parse(data);
            let attachments = [];
            let fields = [];
            let actions = [];
            let texts = '';
            texts += ":alarm_clock: チームスピリット打刻メニュー\n";

            logger.info('[info]', { 'timetable:::': timetable });
            logger.info('[info]', { 'timetable.timeTable[0]:::': timetable.timeTable[0] });
            logger.info('[info]', { 'timetable.timeTable[0].from:::': timetable.timeTable[0].from });
            logger.info('[info]', { 'timetable:::': timetable.isHoliday });
            if(timetable.isHoliday == false){//休暇設定になってない場合はこちら
                var from = 0;
                var to = 0;
                if(timetable.timeTable == undefined || !timetable.timeTable[0].from){
                    logger.info('[info]', { '出勤': '表示' });
                    from = 1;
                    actions.push({name: "attend",value: "attend",text: "出勤",type: "button",style: "primary"});
                }
                if(timetable.timeTable == undefined || !timetable.timeTable[0].to){
                    logger.info('[info]', { '退勤': '表示' });
                    to = 1;
                    actions.push({name: "leave",value: "leave",text: "退勤",type: "button",style: "primary"});
                }
                if(from == 0 && to == 0){
                    texts += '本日の打刻は完了しています。変更する場合は<' + process.env.SF_LOGIN_URL + '/lightning/n/teamspirit__AtkWorkTimeTab|こちらから修正してください>';
                }else{
                    actions.push({name: "cancel",value: "cancel",text: "キャンセル",type: "button"});
                    attachments.push({callback_id: "ts1",attachment_type: "default",actions: actions});    
                }
            }else{ //休暇申請がされている場合はすでに申請済みの件を表示して終了
                texts += '休暇申請がされています。変更する場合は<' + process.env.SF_LOGIN_URL + '/lightning/n/teamspirit__AtkWorkTimeTab|こちらから修正してください>';
            }

            res.json({text: texts, attachments: attachments});            
        })
        .catch(error => {
            if (error.code == 401) {
                res.send(`Salesforceにログインしてからこちらをクリックしてください / Visit this URL to login to Salesforce: https://${req.hostname}/login/` + slackUserId);
            } else {
                res.send("An error as occurred");
            }
        });
};