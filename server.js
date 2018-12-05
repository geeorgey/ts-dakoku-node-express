"use strict";

let express = require('express'),
    bodyParser = require('body-parser'),
    auth = require('./modules/slack-salesforce-auth'),
    contact = require('./modules/contact'),
    account = require('./modules/account'),
    opportunity = require('./modules/opportunity'),
    _case = require('./modules/case'),
    whoami = require('./modules/whoami'),
    ts = require('./modules/ts'),
    receive = require('./modules/receive'),
    actions = require('./modules/actions'),
    app = express();
var http = require('http').Server(app);


app.enable('trust proxy');

app.set('port', process.env.PORT || 5000);

// public folder for images, css,...
app.use('/', express.static(__dirname + '/www')); // serving company logos after successful authentication

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({extended: true}));
// view engine ejs
app.set('view engine', 'ejs');
// routes
require('./routes')(app);

app.post('/actions', actions.handle);
app.post('/pipeline', opportunity.execute);
app.post('/contact', contact.execute);
app.post('/account', account.execute);
app.post('/case', _case.execute);
app.post('/whoami', whoami.execute);
app.post('/ts', ts.execute);//チームスピリット打刻用エンドポイント
app.post('/slack/receive', receive.execute);// アクション等の受け皿用エンドポイント
app.post('/login', auth.loginLink);
app.post('/logout', auth.logout);
app.get('/login/:slackUserId', auth.oauthLogin);
app.get('/oauthcallback', auth.oauthCallback);

//botkit の読み込み
require('./botkit')

//START ===================================================
http.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});


