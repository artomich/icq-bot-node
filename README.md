<h1>icq-bot-node</h1>
<blockquote>Node.js module for creating bots with ICQ New BotAPI</blockquote>
<ul>
  <li><a href='#installation'>Installation</a></li>
  <li>
    <a href='#life'>Life</a>
    <ul>
      <li><a href='#creating'>Creating</a></li>
      <li><a href='#methods-and-properties'>Methods and properties</a></li>
    </ul>
  </li>
  <li>
    <a href='#waiting'>Waiting</a>
    <ul>
      <li><a href='#creating1'>Creating</a></li>
      <li><a href='#methods-and-properties-1'>Methods and properties</a></li>
    </ul>
  </li>
  <li><a href='#action'>Action</a></li>
  <li><a href='#conclusion'>Conclusion</a></li>
</ul>
<p>So, recommend you to see <a href='https://icq.com/botapi'>ICQ New BotAPI documentation</a> before working with this module. There you'll see facilities of API, which realized here. Any additional features didn't add <b>intend</b>...</p>
<h2>Installation</h2>
<pre><code>npm i icq-bot-node</code></pre>
<p>Some dependencies will be installed with icq-bot-node. Mainly, <b>node-fetch</b> and <b>form-data</b> for queries</p>
<h2>Life</h2>
<h3>Creating</h3>
<p>Bot object is <b>ICQLife class</b> here</p>
<pre>
  <code>
const {ICQLife} = require('icq-bot-node');
const TOKEN = '000.000000000.000000000:00000000'; //dont't forget about bot token, which you must get from ICQ New special service
//
const bot = new ICQLife(TOKEN);
  </code>
</pre>
<p>ICQLife constructor gets only one argument - secret bot token. At once it runs <b>checking</b> - you'll see in console this yellow-font message:</p>
<pre><code>Checking and finding information about this bot (<i>/there will be token/</i>)...</code></pre>
<p>If checking will be succesfull, console write green-font (what is surprisingly, german) message. Else, it wil be red-font message with error description, like:</p>
<pre><code>Bot checking error: Error response from ICQ. Description: invalid token. Token: (<i>/there will be your invalid token/</i>)</code></pre>
<p>Checking is asynchronously, so you can use two event-prototypes of ICQLife class: <b>onCheckSuccess</b> and <b>onCheckFail</b>:</p>
<pre>
  <code>
const {ICQLife} = require('icq-bot-node');
const TOKEN = '000.000000000.000000000:00000000';
//
const bot = new ICQLife(TOKEN);
bot.onCheckSuccess = (bot) => {
  console.log(bot.me);  //you'll know about property <b>me</b> further
};
bot.onCheckFail = (bot) => {
  console.log(bot.me);
};
  </code>
</pre>
<blockquote>You can create several ICQLife with one token. They will be work in parallel</blockquote>
<h3>Methods and properties</h3>
<p>ICQLife class give these properties and methods:</p>
<pre>
  <code>
<p>
(ICQLife).token   //bot secret token <b>(only for reading; string)</b>
</p>
<p>
(ICQLife).me   //bot information <b>(only for reading; form after checking; object). You can see the object, which stores in this property <a href='https://icq.com/botapi/#/self/get_self_get'>there</a></b>
</p>
<p>
(ICQLife).store   //special user store <b>(writable, is empty default; object)</b>
</p>
<p>
(ICQLife).waitings   //bound waitings (you'll know about <b>ICQWaiting</b> in the appropriate section) <b>(only for reading, is empty default; array)</b>
</p>
<p>
(ICQLife).listen()    //run event-listening of bot. It's asynchronously function. Special ICQLife event <b>onlisten</b> exists for beginning of listening detecting
</p>
<p>
(ICQLife).stopListen()    //pause event-listening of bot. It's asynchronously function. Special ICQLife event <b>onStopListen</b> exist for stopping of listening detecting
</p>
<p>
(ICQLife).bindWaitings(<i>/waitings array/</i>)   //bind one or more ICQWaiting classes to the bot (you'll know about <b>ICQWaiting</b> in the appropriate section). It's synchronously function, returned object with property <b>waitingsLength</b>, contained a number of bound waitings
</p>
<p>
(ICQLife).unbindWaitings(<i>/waiting index or nothing/</i>)   //unbind one or all ICQWaiting classes out of bot. Unbind all bound waitings on call without argument. It's synchronously function, returned object with property <b>waitingsLength</b>, contained a number of bound waitings
</p>
  </code>
</pre>
<blockquote>Every function of this module returns an object. If it isn't any information for returning, the function can return an empty object. If any error happens, function necessarily returns an object with property <b>error</b>. Also, a red-font message with error description is written in the console.</blockquote>
<pre>
<code>
  const result = bot.bindWaitings(waiting1, waiting2);  //there is error - waiting isn't combined in array
  if (result.hasOwnProperty('error')) {
    console.log('Erorr');
  } else bot.listen();
</code>
</pre>
<h2>Waiting</h2>
<h3>Creating</h3>
<p>Bot begins listening for events with <b>listen()</b>. But work with gotten events <b>ICQWaiting class</b></p>
<pre>
<code>
  const {ICQLife, ICQWaiting} = require('icq-bot-node');
  const TOKEN = '000.000000000.000000000:00000000';
  //
  const waiting = new ICQWaiting('newMessage');
  const bot = new ICQLife(TOKEN);
  bot.onCheckSuccess = (bot) => {
    bot.bindWaitings([waiting]);
    bot.listen();
  };
</code>
</pre>
<p>ICQWaiting constructor gets one argument - waiting type. It matches event types in ICQ New BotAPI documentation (<a href='https://icq.com/botapi/#/events/get_events_get'>there</a>). Here is a list of these types:</p>
<pre>
  <code>
  'newMessage'
  'pinnedMessage'
  'unpinnedMessage'
  'newChatMembers'
  'leftChatMembers'
  'callbackQuery'
  </code>
</pre>
<p>After binding with bot waitings are available in ICQLife property array <b>waitings</b> by index, given in order of binding:</p>
<pre>
<code>
  const waiting1 = new ICQWaiting('newMessage');
  const waiting2 = new ICQWaiting('editedMessage');
  const waiting3 = new ICQWaiting('deletedMessage');
  //
  let checking = bot.bindWaitings([waiting1, waiting2, waiting3]);
  if (!checking.hasOwnProperty('error')) {
    console.log(bot.waitings[0].type);  //'newMessage'
    console.log(bot.waitings[1].type);  //'editedMessage'
    console.log(bot.waitings[2].type);  //'deletedMessage'
  };
</code>
</pre>
<h3>Methods and properties</h3>
<p>ICQWaiting class give these properties and methods:</p>
<pre>
  <code>
<p>
(ICQWaiting).type   //type of waiting <b>(only for reading; string)</b>
</p>
<p>
(ICQWaiting).myBot   //bot information <b>(only for reading; form after binding waiting with any ICQLife; object). You can see the object, which stores in this property <a href='https://icq.com/botapi/#/self/get_self_get'>there</a></b>
</p>
<p>
(ICQWaiting).actions   //bound actions (you'll know about <b>ICQAction</b> in the appropriate section) <b>(only for reading, 
is empty default; array)</b>
</p>
<p>
(ICQWaiting).conditions   //special conditions, which waiting uses for detecting right event source. It is an <b>object</b>, consisted of three <b>writable and default empty array properties:

chats (you can push id of chats, then this waiting will ignore all events, gotten from other chats)
ignoreChats (you can push id of chats, then this waiting will ignore all events, gotten from this chats)
typeChats (you can push type of chats, then this waiting will ignore all events, gotten from chats of other type. There are three chat types: <i>private, group and channel</i>)</b>

When all properties of <b>conditions</b> empty, waiting reacts to all gotten events
</p>
<p>
(ICQWaiting).stop()    //pause waiting. It won't react to gotten events after this method call
</p>
<p>
(ICQWaiting).run()    //run waiting, which was paused
</p>
<p>
(ICQWaiting).bindActions(<i>/actions array/</i>)   //bind one or more ICQAction classes to waiting (you'll know about <b>ICQAction</b> in appropriate section). It's synchronously function, returned object with property <b>actionsLength</b>, contained a number of bound actions
</p>
<p>
(ICQWaiting).unbindActions(<i>/action index or nothing/</i>)   //unbind one or more ICQAction classes out of waiting (you'll know about <b>ICQAction</b> in appropriate section). Unbind all bound actions on call without argument. It's synchronously function, returned object with property <b>actionsLength</b>, contained a number of bound actions
</p>
  </code>
</pre>
<blockquote>Waiting copies in ICQLife property <b>waitings</b> and stores by his index there after binding to ICQLife. If you change original ICQWaiting class it doesn't affect on a bound copy. Also, changings of bound waitings are ignored by original ICQWaiting</blockquote>
<pre>
  <code>
  const waiting = new ICQWaiting('pinMessage');
  waiting.conditions.typeChats.push('private');
  //
  const bot = new ICQLife(TOKEN);
  bot.onCheckSuccess = () => {
    bot.bindWaitings([waiting]);
    bot.waitings[0].conditions.typeChats = [];
    console.log(bot.waitings[0].conditions.typeChats);    //[]
    console.log(waiting.conditions.typeChats);    //['private']
    //
    waitings.conditions.typeChats.push('channel');
    console.log(bot.waitings[0].conditions.typeChats);    //[]
    console.log(waiting.conditions.typeChats);    //['private', 'channel']
  };
  </code>
</pre>
<p>But waitings only wait for event getting and filter them. It is useless without bound actions</p>
<h2>Action</h2>
<p>Bot answers events with special <b>actions</b>. There are two types of it: user and built-in. User actions are simple <b>desired asynchronous</b> functions, bound with ICQWaiting. Built-in actions are calls of special method of <b>ICQAction object</b></p>
<pre>
<code>
  const {ICQLife, ICQWaiting, ICQAction} = require('icq-bot-node');
  const TOKEN = '000.000000000.000000000:00000000';
  //
  const action1 = async (bot, token, event, interResult) => {   //this is user action
    ICQAction.act({   //this is built-in action
      actionType: 'sendText',
      text: 'Hello, world!',
      chatId: 'artem'
    }, token);
    let chance = Math.round(Math.random());
    if (chance === 0) {
      return false;
    }
    else return true;
  };
  const action2 = async (bot, token, event, interResult) => {   //this is user action
    if (!interResult) {
      ICQAction.act({   //this is built-in action
        actionType: 'sendText',
        text: 'Unluck! I dont wont talk with you now...',
        chatId: 'artem'
      }, token);
      bot.waitings[0].conditions.chatsId = [];
      bot.waitings[0].conditions.ignoreChats.push('artem');
    };
    ICQAction.act({   //this is built-in action
      actionType: 'sendText',
      text: 'Luck! But you really play with fire...',
      chatId: 'artem'
    }, token);
  };
  //
  const waiting = new ICQWaiting('newMessage');
  waiting.conditions.chatsId.push('artem');
  waiting.bindActions([action1, action2]);
  //
  const bot = new ICQLife(TOKEN);
  bot.onCheckSuccess = (bot) => {
    bot.bindWaitings([waiting]);
    bot.listen();
  };
</code>
</pre>
<blockquote>User action get four arguments:</blockquote>
<p><b>first argument</b> is ICQLife class</p>
<p><b>second argument</b> is token of this bot</p>
<p><b>third argument</b> is object with information about gotten event. You can see examples of object, which you can meet in this argument <a href='https://icq.com/botapi/#/events/get_events_get'>there</a></p>
<p><b>four argument</b> is returned data of last done user action</p>
<blockquote>Built-in action activates with method <b>act()</b>, which has two arguments: <b>object with type of action and data for action</b> (you can see <a href='https://icq.com/botapi'>ICQ New BotAPI documentation</a> and know about properties need for action query)</b> and <b>token</b>. There is a list of action types:</blockquote>
<pre>
  <code>
  'sendText'
  'sendFile'
  'sendVoice'
  'editText'
  'deleteMessages'
  'sendActions'
  'getChatInfo' //name of this type differs from original - you can find information about it in documentation section '/chats/getInfo'
  'getFileInfo' //name of this type differs from original - you can find information about it in documentation section '/files/getInfo'
  'getAdmins'
  'getMembers'
  'getBlockedUsers'
  'getPendingUsers'
  'blockUser'
  'unclockUser'
  'resolvePending'
  'setTitle'
  'setAbout'
  'setRules'
  'pinMessage'
  'unpinMessage'
  'answerCallbackQuery'
  </code>
</pre>
<p>Set of properties, need for actions, equals to documentation, except <b>sendFile</b> and <b>sendVoice</b>. You can send uploaded file and write property 'fileId' or upload new file and send it. In the second case, you must write two properties instead of 'chatId': <b>'location'</b> (local path to file) and <b>'fileName'</b> (necessarily with format)</p>
<blockquote><b>ICQAction.act()</b> returns object, described in <a href='https://icq.com/botapi'>ICQ New BotAPI documentation</a></blockquote>
<h2>Conclusion</h2>
<p>You can write questions in <a href='https://github.com/artomich/icq-bot-node/issues'>issues</a> or send it to me: <a href='mailto:artomich.work.1@gmail.com'>artomich.work.1@gmail.com</a></p>
