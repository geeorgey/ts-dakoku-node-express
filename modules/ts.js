"use strict";

let auth = require("./slack-salesforce-auth"),
    force = require("./force"),
    VERIFICATION_TOKEN = process.env.VERIFICATION_TOKEN,
    SF_LOGIN_URL = process.env.SF_LOGIN_URL,
    SF_CLIENT_ID = process.env.SF_CLIENT_ID,
    SF_CLIENT_SECRET = process.env.SF_CLIENT_SECRET,
    request = require('request'),
    mappingsRefresh = {};
const logger = require('heroku-logger');

exports.execute = (req, res) => {

    if (req.body.token != VERIFICATION_TOKEN) {
        console.log("Invalid token");
        res.send("Invalid token");
        return;
    }

    let slackUserId = req.body.user_id;

    var params = {};
    params.method = 'GET';

    auth.getOAuthObject(slackUserId).then((oauthObj) => getButtons(oauthObj,params,req,res,slackUserId));
};


function getButtons(oauthObj,params,req,res,slackUserId){
    return new Promise(resolve => {
    //ログインセッションがない場合はoauthObjは空
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
                //ユーザがmongodbに存在する場合はこちら
                // error は空

                // slack-salesforce-auth.js より
                // exports.oauthCallback 部分を利用
                // refresh tokenを使ってaccess tokenを取得する
                // https://developer.salesforce.com/docs/atlas.ja-jp.api_rest.meta/api_rest/intro_understanding_refresh_token_oauth.htm
                let optionsRefresh = {
                    url: `${SF_LOGIN_URL}/services/oauth2/token`,
                    qs: {
                        grant_type: "refresh_token",
                        client_id: SF_CLIENT_ID,
                        client_secret: SF_CLIENT_SECRET,
                        refresh_token: oauthObj.refresh_token,
                    }
                };
                //Refreshtokenを使ってAccessTokenを取得し、ボタンを表示する処理
                getNewAccessToken(optionsRefresh,slackUserId).then((oauthObj) => getButtons(oauthObj,params,req,res,slackUserId));
            }
        });
        resolve(oauthObj);
    });    
}
exports.getButtons = getButtons;

//RefreshTokenを使って新しいAccess tokenを取得する
function getNewAccessToken(optionsRefresh,slackUserId){
    return new Promise(resolve => {
        request.post(optionsRefresh, function (errorRefresh, responseRefresh, bodyRefresh) {
            if (errorRefresh) {
                console.log(errorRefresh);
            }        
            mappingsRefresh[slackUserId] = JSON.parse(bodyRefresh);
            auth.sfUser.findByIdAndUpdate(slackUserId,{access_token: mappingsRefresh[slackUserId].access_token},{
                upsert: true,
                new: true,
            }, (err, sfuser) => {
                console.log(err, sfuser);
                resolve(sfuser._doc);
            });
        });
    });
}