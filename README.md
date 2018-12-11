詳細はこちら：https://geeorgey.com/archives/3569

# ts-dakoku-node-express
ベース： Slackforce https://github.com/ccoenraets/slackforce

# 実現されること
- slackのスラッシュコマンドからチームスピリットの打刻を行うことができる  
- スラッシュコマンドを使ったslackアプリの拡張性を考慮してあります。

# 環境
- node.js
- botkit
- express //webサーバ
- mongodb //slackの認証情報の保存

node.js上で動きます。私の環境ではheroku上で可動しています。

# チームスピリットの打刻用Apexについて
ngs/ts-dakoku をそのまま使わせてもらっています(ngsさんに感謝)  
https://github.com/ngs/ts-dakoku/tree/master/apex/src/classes  
こちらの２つのクラスを本番環境にデプロイして使ってください
- TSTimeTableAPIController.cls	
- TSTimeTableAPIControllerTest.cls	
設定等についてはこちらを参照：https://ja.ngs.io/2018/02/14/ts-dakoku/

# Salesforceで接続アプリケーションを作る
- アプリ名: 任意
- API Name: 任意
- Contact Email: 管理者のEmail
- OAuth 設定: チェックを入れてください
- コールバック URL: https://myapp.herokuapp.com/oauthcallback (これは後でherokuアプリを立ち上げたあとに書き換えます)
Selected OAuth Scopes: Full Access (full)
- 保存する

# herokuアプリを作る
heroku CLIをインストール  
$ heroku login  
// メアドとパス・二段階認証でログイン  
$ heroku create appName  
//appNameは任意  
//ここまでやるとアプリURLが発行されるので先程作ったSalesforceアプリのコールバックURL(https://myapp.herokuapp.com)部分を置き換えてください  
ここからはGUI。 https://dashboard.heroku.com にログインして先程作ったアプリの設定画面を開く  
Resources画面に行き、add-onにmLab MongoDBを追加  
Settings画面に行き、Reveal config varsボタンを押して環境変数を設定します

# slackアプリを作る
https://api.slack.com/apps  
Create new appする  
Basic Informationにある[Client ID][Client Secret][Verification Token]を以下で使います  
Interactive Componentsに移動してRequest URLに  
先程herokuで作ったアプリのURL/slack/receive を設定する

# スラッシュコマンドを作る
slackアプリのスラッシュコマンドページへ行き、Create New Commandを押す  
コマンド名： /ts  
Request URL: herokuアプリのURL/ts  
Short Description: チームスピリット打刻コマンド  

# herokuの環境変数
- MONGODB_URI herokuのadd onで mLab MongoDB :: Mongodb をインストールすると自動的に入ります
- SF_CLIENT_ID //先程Salesforceで作ったアプリのID
- SF_CLIENT_SECRET //先程Salesforceで作ったアプリのsecret
- SF_LOGIN_URL //自分のSalesforceのURL。https://[任意の文字列].my.salesforce.com
- SF_USER_NAME //管理者のメアド
- SF_PASSWORD //管理者のパス
- SLACK_ID // Slackアプリの[Client ID]
- SLACK_REDIRECT // herokuで作成したアプリのURL
- SLACK_SECRET // Slackアプリの[Client Secret]
- VERIFICATION_TOKEN // slackアプリの[Verification Token]
以下についてはslackforceで設定されているものなのですが、VERIFICATION_TOKENと同じものです。追加するのが面倒な場合は、modules/**.js内部の変数名をVERIFICATION_TOKENに変更してしまうことで一つですみます
- SLACK_WHOAMI_TOKEN
- SLACK_ACCOUNT_TOKEN
- SLACK_CASE_TOKEN
- SLACK_CONTACT_TOKEN
- SLACK_OPPORTUNITY_TOKEN

#mongoDBについて
herokuダッシュボードよりResourcesタブを開き、mLab MongoDB :: Mongodbをクリックすると、mongo dbの管理画面が開きます  
sfusers という名前のCollectionsが必要になるので、Add collectionボタンを押して追加してください。  
その中にSalesforceのアクセストークンが保存されます

# 使い方
slackで /ts と打つとslashコマンドが起動します  
最初はSalesforceへのログイン認証が必要なので、表示されるURLをクリックしてログイン情報を登録します  
(注意：こちらのデータもmongodbに入れるべきなのですが未実装です)  
ログインしたら再度 /ts と打つと、出勤/退勤/キャンセルボタンが表示されますのでボタンを押して打刻してください

# botkitについて
botkit.jsでbotkitの基本的な機能の実装が可能です  
interactive_message_callbackについてはここで受けることが出来ません。  
エンドポイントは、 modules/receive.js で作成してあるのでそちらで定義してください

# server.jsについて
スラッシュコマンドを追加する場合はserver.jsに定義し、 mobules/ にファイルを設置しています。

# 以下はSlackforceのreadmeです

A simple Node.js application that acts as a Slash Command message broker between Slack and Salesforce.

Watch [this video](https://youtu.be/xB-1SsUoBHk) to see the application in action.
 
Read [this blog post](http://coenraets.org/blog/2016/01/slack-salesforce-integration-part-2/) for more details. 

Follow the instructions below to deploy your own instance of the application:

### Step 1: Create a Connected App

If you haven't already done so, follow the steps below to create a Salesforce connected app:

1. In Salesforce Setup, type **Apps** in the quick find box, and click the **Apps** link

1. In the **Connected Apps** section, click **New**, and define the Connected App as follows:

    - Connected App Name: MyConnectedApp (or any name you want)
    - API Name: MyConnectedApp
    - Contact Email: enter your email address
    - Enabled OAuth Settings: Checked
    - Callback URL: https://myapp.herokuapp.com/oauthcallback (You'll change this later)
    - Selected OAuth Scopes: Full Access (full)
    - Click **Save**

### Step 2: Deploy the Slash Commands

1. Make sure you are logged in to the [Heroku Dashboard](https://dashboard.heroku.com/)
1. Click the button below to deploy the Slash Commands on Heroku:

    [![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

1. Fill in the config variables as described.

    - For **SF_CLIENT_ID**, enter the Consumer Key of your Salesforce Connected App
    - For **SF_CLIENT_SECRET**, enter the Consumer Secret of your Salesforce Connected App
    - For **SF_USER_NAME**, enter the the username of your Salesforce integration user
    - For **SF_PASSWORD**, enter the the username of your Salesforce integration user
    - Leave **SLACK_ACCOUNT_TOKEN** blank for now.
    - Leave **SLACK_CONTACT_TOKEN** blank for now.
    - Leave **SLACK_OPPORTUNITY_TOKEN** blank for now.
    - Leave **SLACK_CASE_TOKEN** blank for now.
    - Leave **SLACK_WHOAMI_TOKEN** blank for now.

1. Once your app is deployed, go back to the Connected App in Salesforce, and change the OAuth callback URL: Use the URL of your actuall Heroku app, followd by /oauthcallback. For example: https://mynewapp.herokuapp.com/oauthcallback

### Step 3: Create the Slash Commands in Slack

1. In a browser, go to the custom integration page for your Slack team. For example ```https://YOUR_TEAM_NAME.slack.com/apps/manage/custom-integration```. Replace ```YOUR_TEAM_NAME``` with your actual team name.

1. Click **Slash Commands**, and click **Add Configuration**

1. In the **Choose a Command** input field, type **/pipeline** and click **Add Slash Command Integration**

1. In the **Integration Settings** section: 

    - Command: /pipeline
    - URL: the URL of the app you deployed on Heroku followed by /pipeline. For example: ```https://your-heroku-app.herokuapp.com/pipeline```
    - Method: POST
    - Copy the token, open another browser tab, login to the Heroku Dashboard, and set the Heroku **SLACK_OPPORTUNITY_TOKEN** config variable to the value of that token (**Setting>Reveal Config Vars**)
    - Customize Name: Salesforce Opportunities
    
    Click **Save Integration**.
    
1. Repeat these steps to create another Slash command called **/account**, calling ```https://your-heroku-app.herokuapp.com/account```. In the Heroku dashboard, set the **SLACK_ACCOUNT_TOKEN** config var to the value of the token that was generated in Slack.    

1. Repeat these steps to create another Slash command called **/contact**, calling ```https://your-heroku-app.herokuapp.com/contact```. In the Heroku dashboard, set the **SLACK_CONTACT_TOKEN** config var to the value of the token that was generated in Slack.    

1. Repeat these steps to create another Slash command called **/case**, calling ```https://your-heroku-app.herokuapp.com/case```. In the Heroku dashboard, set the **SLACK_CASE_TOKEN** config var to the value of the token that was generated in Slack.    

1. Repeat these steps to create another Slash command called **/whoami**, calling ```https://your-heroku-app.herokuapp.com/whoami```. In the Heroku dashboard, set the **SLACK_WHOAMI_TOKEN** config var to the value of the token that was generated in Slack.    
