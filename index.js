/*
 * iñq-bot-node
 * https://github.com/artomich/iñq-bot-node
 *
 * Copyright (c) 2020 artomich
 * Licensed under the Apache, 2.0 licenses.
 */
//
//
//
//Hello! I recommend you learn ICQ New BotAPI documentation before using this module. All data for Actions and Waitings, which use here, copied from there.
//
//
//
'use strict';

const success_console_font = '\x1b[32m%s\x1b[0m';
const wait_console_font = '\x1b[33m%s\x1b[0m';
const error_console_font = '\x1b[31m%s\x1b[0m';
//
//this list of waiting types copies event types, descibing in ICQ New BotAPI documentation
const waitingTypes = [
  'newMessage',
  'editedMessage',
  'deletedMessage',
  'pinnedMessage',
  'unpinnedMessage',
  'newChatMembers',
  'leftChatMembers',
  'callbackQuery'
];
//
//this list of action types copies queries, descibing in ICQ New BotAPI documentation (except "/self/get" and "/events/get" - this queries use in this module automatically)
const actionTypes = [
  'sendText',
  'sendFile',
  'sendVoice',
  'editText',
  'deleteMessages',
  'sendActions',
  'getChatInfo',  //in original ICQ New BotAPI documentation it is query "/chats/getInfo"
  'getFileInfo',  //in original ICQ New BotAPI documentation it is query "/files/getInfo"
  'getAdmins',
  'getMembers',
  'getBlockedUsers',
  'blockUser',
  'resolvePending',
  'getPendingUsers',
  'unblockUser',
  'setTitle',
  'setAbout',
  'setRules',
  'pinMessage',
  'unpinMessage',
  'answerCallbackQuery'
];
//
const _ICQConnect = {
  baseway: 'https://api.icq.net/bot/v1',
  fetch: require('node-fetch'),
  FormData: require('form-data'),
  fs: require('fs'),
  //
  getQuery: async (token, path, parameters=[])=>{
    try {
      let body = '';
      for (const parameter in parameters) body += `&${parameter}=${encodeURIComponent(parameters[parameter])}`;
      return _ICQConnect.fetch(`${_ICQConnect.baseway}${path}?token=${token}${body}`)
      .then(response=>{
        if (response.ok) {
          return response.json()
        } else return {error: `Connection error: ${response.status}`};
      }).then(result=>{
        if (!result.ok) {
          return {error: `Error response from ICQ. Description: ${result.description}`};
        } else return result;
      });
    }
    catch(e) {
      console.error(error_console_font, e.message);
      return {error: e.message};
    };
  },
  postQuery: async (token, path, parameters=null)=>{
    try {
      let form = new _ICQConnect.FormData();
      form.append('token', token);
      for (const parameter in parameters) {
        if (parameter !== 'location' && parameter !== 'fileName') form.append(parameter, parameters[parameter]);
      };
      if (!_ICQConnect.fs.existsSync(parameters.location)) throw new Error('Trying to send unexisting file');
      form.append('file', _ICQConnect.fs.createReadStream(parameters.location), parameters.fileName);
      return _ICQConnect.fetch(`${_ICQConnect.baseway}${path}`, {
        method: 'post',
        body: form
      })
      .then(response=>{
        if (response.ok) {
          return response.json()
        } else {
          return {error: `Connection error: ${response.status}`};
        };
      })
      .then(result=>{
        if (!result.ok) {
          return {error: `Error response from ICQ. Description: ${result.description}`};
        } else return result;
      });
    }
    catch(e) {
      console.error(error_console_font, e.message);
      return {error: e.message};
    };
  }
}
//
const ICQAction = {
  act: async (data=null, token=null)=>{
    try {
      if (typeof data !== 'object' || !data.hasOwnProperty('actionType')) throw new Error('Incorrect additional data of act in action');
      if (!actionTypes.includes(data.actionType)) throw new Error('Incorrect action type');
      if (typeof token !== 'string') throw new Error('Incorrect token in act of action');
      if (actionTypes.indexOf(data.actionType) === -1) throw new Error('Incorrect type of action');
      let result = await ICQAction._do(token, data);
      return result;
    }
    catch(e) {
      console.error(error_console_font, e.message);
      return {error: e.message};
    };
  },
  _do: async (token, data)=>{
    try {
      let parameters = {};
      let path = '';
      switch(data.actionType) {
        case 'sendText':
          if (!data.hasOwnProperty('chatId') || !data.hasOwnProperty('text')) throw new Error('Incomplete set of parameters in action (sendText)');
          if (typeof data.chatId !== 'string' || typeof data.text !== 'string') throw new Error('Incorrect action parameters in action (sendText)');
          parameters.chatId = data.chatId;
          parameters.text = data.text;
          if (data.hasOwnProperty('inlineKeyboardMarkup')) {
            if (typeof data.inlineKeyboardMarkup !== 'object') throw new Error('Incorrect action parameters in action (sendText)');
            parameters.inlineKeyboardMarkup = JSON.stringify(data.inlineKeyboardMarkup);
            console.log(parameters.inlineKeyboardMarkup);
          };
          if (data.hasOwnProperty('replyMsgId')) {
            if (typeof data.replyMsgId !== 'object' || !data.replyMsgId.hasOwnProperty('length')) throw new Error('Incorrect action parameters in action (sendText)');
            parameters.replyMsgId = data.replyMsgId;
          }
          else {
            if (data.hasOwnProperty('forwardChatId') && data.hasOwnProperty('forwardMsgId')) {
              if (typeof data.forwardMsgId !== 'object' || typeof data.forwardChatId !== 'string') throw new Error('Incorrect action parameters in action (sendText)');
              parameters.forwardMsgId = JSON.stringify(data.forwardMsgId);
              parameters.forwardChatId = data.forwardChatId;
            };
          };
          path = '/messages/sendText';
        break;
        case 'sendFile':
          if (!data.hasOwnProperty('chatId')) throw new Error('Incomplete set of parameters in action (sendFile)');
          if (typeof data.chatId !== 'string') throw new Error('Incorrect action parameters in action (sendFile)');
          parameters.chatId = data.chatId;
          if (data.hasOwnProperty('fileId')) {
            if (typeof data.fileId === 'string') {
              parameters.fileId = data.fileId;
            } else throw new Error('Incorrect action parameters in action (sendFile)');
          }
          else {
            if (data.hasOwnProperty('location') && data.hasOwnProperty('fileName')) {
              if (typeof data.location === 'string' && typeof data.fileName === 'string') {
                parameters.location = data.location;
                parameters.fileName = data.fileName;
              } else throw new Error('Incorrect action parameters in action (sendFile)');
            } else throw new Error('Incomplete set of parameters in action (sendFile)');
          };
          if (data.hasOwnProperty('inlineKeyboardMarkup')) {
            if (typeof data.inlineKeyboardMarkup !== 'object') throw new Error('Incorrect action parameters in action (sendFile)');
            parameters.inlineKeyboardMarkup = JSON.stringify(data.inlineKeyboardMarkup);
          };
          if (data.hasOwnProperty('caption')) {
            if (typeof data.caption !== 'string') throw new Error('Incorrect action parameters in action (sendFile)');
            parameters.caption = data.caption;
          };
          if (data.hasOwnProperty('replyMsgId')) {
            if (typeof data.replyMsgId !== 'object') throw new Error('Incorrect action parameters in action (sendFile)');
            parameters.replyMsgId = data.replyMsgId;
          }
          else {
            if (data.hasOwnProperty('forwardChatId') && data.hasOwnProperty('forwardMsgId')) {
              if (typeof data.forwardMsgId !== 'object' || typeof data.forwardChatId !== 'string') throw new Error('Incorrect action parameters in action (sendFile)');
              parameters.forwardMsgId = JSON.stringify(data.forwardMsgId);
              parameters.forwardChatId = data.forwardChatId;
            };
          };
          path = '/messages/sendFile';
          if (data.hasOwnProperty('location')) return await _ICQConnect.postQuery(token, path, parameters);
        break;
        case 'sendVoice':
          if (!data.hasOwnProperty('chatId')) throw new Error('Incomplete set of parameters in action (sendVoice)');
          if (typeof data.chatId !== 'string') throw new Error('Incorrect action parameters in action (sendVoice)');
          parameters.chatId = data.chatId;
          if (data.hasOwnProperty('fileId')) {
            if (typeof data.fileId === 'string') {
              parameters.fileId = data.fileId;
            } else throw new Error('Incorrect action parameters in action (sendVoice)');
          }
          else {
            if (data.hasOwnProperty('location') && data.hasOwnProperty('fileName')) {
              if (typeof data.location === 'string' && typeof data.fileName === 'string') {
                parameters.location = data.location;
                parameters.fileName = data.fileName;
              } else throw new Error('Incorrect action parameters in action (sendVoice)');
            } else throw new Error('Incomplete set of parameters in action (sendVoice)');
          };
          if (data.hasOwnProperty('inlineKeyboardMarkup')) {
            if (typeof data.inlineKeyboardMarkup !== 'object') throw new Error('Incorrect action parameters in action (sendVoice)');
            parameters.inlineKeyboardMarkup = JSON.stringify(data.inlineKeyboardMarkup);
          };
          if (data.hasOwnProperty('replyMsgId')) {
            if (typeof data.replyMsgId !== 'object') throw new Error('Incorrect action parameters in action (sendVoice)');
            parameters.replyMsgId = data.replyMsgId;
          }
          else {
            if (data.hasOwnProperty('forwardChatId') && data.hasOwnProperty('forwardMsgId')) {
              if (typeof data.forwardMsgId !== 'object' || typeof data.forwardChatId !== 'string') throw new Error('Incorrect action parameters in action (sendVoice)');
              parameters.forwardMsgId = JSON.stringify(data.forwardMsgId);
              parameters.forwardChatId = data.forwardChatId;
            };
          };
          path = '/messages/sendVoice';
          if (data.hasOwnProperty('location')) return await _ICQConnect.postQuery(token, path, parameters);
        break;
        case 'editText':
          if (!data.hasOwnProperty('chatId') || !data.hasOwnProperty('text') || !data.hasOwnProperty('msgId')) throw new Error('Incomplete set of parameters in action (editText)');
          if (typeof data.chatId !== 'string' || typeof data.text !== 'string' || typeof msgId.length !== 'number' || typeof data.msgId !== 'object') throw new Error('Incorrect action parameters in action (editText)');
          parameters.chatId = data.chatId;
          parameters.text = data.text;
          parameters.msgId = data.msgId;
          if (data.hasOwnProperty('inlineKeyboardMarkup')) {
            if (typeof data.inlineKeyboardMarkup !== 'object') throw new Error('Incorrect action parameters in action (editText)');
            parameters.inlineKeyboardMarkup = JSON.stringify(data.inlineKeyboardMarkup);
          };
          path = '/messages/editText';
        break;
        case 'deleteMessages':
          if (!data.hasOwnProperty('chatId') || !data.hasOwnProperty('msgId')) throw new Error('Incomplete set of parameters in action (deleteMessages)');
          if (typeof data.chatId !== 'string' || typeof data.msgId !== 'object' || !data.msgId.hasOwnProperty('length')) throw new Error('Incorrect action parameters in action (deleteMessages)');
          parameters.chatId = data.chatId;
          parameters.msgId = data.msgId;
          path = '/messages/deleteMessages';
        break;
        case 'sendActions':
          if (!data.hasOwnProperty('chatId') || !data.hasOwnProperty('actions')) throw new Error('Incomplete set of parameters in action (sendActions)');
          if (typeof data.chatId !== 'string' || typeof data.actions !== 'object' || !data.actions.hasOwnProperty('length')) throw new Error('Incorrect action parameters in action (sendActions)');
          parameters.chatId = data.chatId;
          parameters.actions = data.actions;
          path = '/chats/sendActions';
        break;
        case 'getChatInfo':
          if (!data.hasOwnProperty('chatId')) throw new Error('Incomplete set of parameters in action (getChatInfo)');
          if (typeof data.chatId !== 'string' || data.chatId.length === 0) throw new Error('Incorrect action parameters in action (getChatInfo)');
          parameters.chatId = data.chatId;
          path = '/chats/getInfo';
        break;
        case 'getAdmins':
          if (!data.hasOwnProperty('chatId')) throw new Error('Incomplete set of parameters in action (getAdmins)');
          if (typeof data.chatId !== 'string') throw new Error('Incorrect action parameters in action (getAdmins)');
          parameters.chatId = data.chatId;
          path = '/chats/getAdmins';
        break;
        case 'getMembers':
          if (!data.hasOwnProperty('chatId')) throw new Error('Incomplete set of parameters in action (getMembers)');
          if (typeof data.chatId !== 'string') throw new Error('Incorrect action parameters in action (getMembers)');
          parameters.chatId = data.chatId;
          path = '/chats/getMembers';
        break;
        case 'getBlockedUsers':
          if (!data.hasOwnProperty('chatId')) throw new Error('Incomplete set of parameters in action (getBlockedUsers)');
          if (typeof data.chatId !== 'string') throw new Error('Incorrect action parameters in action (getBlockedUsers)');
          parameters.chatId = data.chatId;
          path = '/chats/getBlockedUsers';
        break;
        case 'getPendingUsers':
          if (!data.hasOwnProperty('chatId')) throw new Error('Incomplete set of parameters in action (getPendingUsers)');
          if (typeof data.chatId !== 'string') throw new Error('Incorrect action parameters in action (getPendingUsers)');
          parameters.chatId = data.chatId;
          path = '/chats/getPendingUsers';
        break;
        case 'blockUser':
          if (!data.hasOwnProperty('chatId') || !data.hasOwnProperty('userId')) throw new Error('Incomplete set of parameters in action (blockUser)');
          if (typeof data.chatId !== 'string' || typeof data.userId !== 'string') throw new Error('Incorrect action parameters in action (blockUser)');
          parameters.chatId = data.chatId;
          parameters.userId = data.userId;
          if (data.hasOwnProperty('delLastMessages')) {
            if (typeof data.delLastMessages === 'boolean') parameters.delLastMessages = data.delLastMessages;
          };
          path = '/chats/blockUser';
        break;
        case 'resolvePending':
          if (!data.hasOwnProperty('chatId') || !data.hasOwnProperty('userId') || (!data.hasOwnProperty('userId') && !data.hasOwnProperty('everyone'))) throw new Error('Incomplete set of parameters in action (resolvePending)');
          if (typeof data.chatId !== 'string' || typeof data.approve !== 'boolean') throw new Error('Incorrect action parameters in action (resolvePending)');
          parameters.chatId = data.chatId;
          parameters.approve = data.approve;
          if (data.hasOwnProperty('userId')) {
            if (typeof data.userId !== 'string') throw new Error('Incorrect action parameters in action (resolvePending)');
            parameters.userId = data.userId;
          }
          else {
            if (typeof data.everyone !== 'boolean') throw new Error('Incorrect action parameters in action (resolvePending)');
            parameters.everyone = data.everyone;
          };
          path = '/chats/resolvePending';
        break;
        case 'unblockUser':
          if (!data.hasOwnProperty('chatId') || !data.hasOwnProperty('approve')) throw new Error('Incomplete set of parameters in action (unblockUser)');
          if (typeof data.chatId !== 'string'|| typeof data.userId !== 'string') throw new Error('Incorrect action parameters in action (unblockUser)');
          parameters.chatId = data.chatId;
          parameters.userId = data.userId;
          path = '/chats/unblockUser';
        break;
        case 'setTitle':
          if (!data.hasOwnProperty('chatId') || !data.hasOwnProperty('title')) throw new Error('Incomplete set of parameters in action (setTitle)');
          if (typeof data.chatId !== 'string' || typeof data.title !== 'string') throw new Error('Incorrect action parameters in action (setTitle)');
          parameters.chatId = data.chatId;
          parameters.title = data.title;
          path = '/chats/setTitle';
        break;
        case 'setAbout':
          if (!data.hasOwnProperty('chatId') || !data.hasOwnProperty('about')) throw new Error('Incomplete set of parameters in action (setAbout)');
          if (typeof data.chatId !== 'string' || typeof data.about !== 'string') throw new Error('Incorrect action parameters in action (setAbout)');
          parameters.chatId = data.chatId;
          parameters.about = data.about;
          path = '/chats/setAbout';
        break;
        case 'setRules':
          if (!data.hasOwnProperty('chatId') || !data.hasOwnProperty('rules')) throw new Error('Incomplete set of parameters in action (setRules)');
          if (typeof data.chatId !== 'string' || data.chatId.length === 0 || typeof data.rules !== 'string' || data.rules.length === 0) throw new Error('Incorrect action parameters in action (setRules)');
          parameters.chatId = data.chatId;
          parameters.rules = data.rules;
          path = '/chats/setRules';
        break;
        case 'pinMessage':
          if (!data.hasOwnProperty('chatId') || !data.hasOwnProperty('msgId')) throw new Error('Incomplete set of parameters in action (pinMessage)');
          if (typeof data.chatId !== 'string' || typeof data.msgId !== 'string') throw new Error('Incorrect action parameters in action (pinMessage)');
          parameters.chatId = data.chatId;
          parameters.msgId = data.msgId;
          path = '/chats/pinMessage';
        break;
        case 'unpinMessage':
          if (!data.hasOwnProperty('chatId') || !data.hasOwnProperty('msgId')) throw new Error('Incomplete set of parameters in action (unpinMessage)');
          if (typeof data.chatId !== 'string' || typeof data.msgId !== 'string') throw new Error('Incorrect action parameters');
          parameters.chatId = data.chatId;
          parameters.msgId = data.msgId;
          path = '/chats/unpinMessage';
        break;
        case 'getFileInfo':
          if (!data.hasOwnProperty('fileId')) throw new Error('Incomplete set of parameters in action (getFileInfo)');
          if (typeof data.fileId !== 'string') throw new Error('Incorrect action parameters in action (getFileInfo)');
          parameters.fileId = data.fileId;
          path = '/files/getInfo';
        break;
        case 'answerCallbackQuery':
          if (!data.hasOwnProperty('queryId')) throw new Error('Incomplete set of parameters in action (answerCallbackQuery)');
          if (typeof data.queryId !== 'string') throw new Error('Incorrect action parameters in action (answerCallbackQuery)');
          parameters.queryId = data.queryId;
          if (data.hasOwnProperty('text')) {
            if (typeof data.text !== 'string') throw new Error('Incorrect action parameters in action (answerCallbackQuery)');
            parameters.text = data.text;
          };
          if (data.hasOwnProperty('showAlert')) {
            if (typeof data.showAlert !== 'boolean') throw new Error('Incorrect action parameters in action (answerCallbackQuery)');
            parameters.showAlert = data.showAlert;
          };
          if (data.hasOwnProperty('url')) {
            if (typeof data.url !== 'string') throw new Error('Incorrect action parameters in action (answerCallbackQuery)');
            parameters.url = data.url;
          };
          path = '/messages/answerCallbackQuery';
        break;
      };
      return await _ICQConnect.getQuery(token, path, parameters);
    }
    catch(e) {
      console.error(error_console_font, e.message);
      return {error: e.message};
    };
  },
}
//
class ICQWaiting {
  constructor(type) {
    try {
      if (typeof type !== 'string' || !waitingTypes.includes(type)) throw new Error('Incorrect type of waiting');
      this.type = type;
      this._isPaused = false;
      this.actions = [];
      this.conditions = {
        chats: [],
        ignoreChats: [],
        typeChats: []
      };
      this.myBot = null
    }
    catch(e) {
      console.error(error_console_font, e.message);
      return {error: e.message};
    };
  }
  //
  async _begin(event) {
    try {
      if (this.myBot === null) throw new Error('Trying to explote unbinded waiting');
      if (!this.myBot._isLiving) throw new Error('Listening is stopped (or isnt begun)');
      let interResult = null;
      if (event.type === this.type) {
        for (const action of this.actions) {
          if (this._isPaused || !this.myBot._isLiving) {
            console.log(wait_console_font, `Waiting was paused or bot was died in completing. Token: ${this.token}. Type: ${this.type}`);
            return {error: 'pausing'};
          };
          interResult = await action(this.myBot, this.token, event, interResult);
        };
      };
      return {};
    }
    catch(e) {
      console.error(error_console_font, e.message);
      return {error: e.message};
    }
  }
  bindActions(actions) {
    try {
      if (typeof actions !== 'object' || !actions.hasOwnProperty('length')) throw new Error('Incorrect actions array in bindActions() of waiting');
      for (const action of actions) {
        if (typeof action !== 'function') throw new Error('Incorrect action in actions array in bindActions() of waiting');
        this.actions.push(action);
      };
      return {actionsNumber: this.actions.length};
    }
    catch(e) {
      console.error(error_console_font, e.message);
      return {error: e.message};
    };
  }
  unbindActions(action=null) {
    try {
      if (typeof action !== 'number' && action !== null) throw new Error('Incorrect index of action in unbindActions() in waiting');
      if (action === null) {
        this.actions = [];
        return {actionsNumber: 0};
      };
      this.actions.splice(action, 1);
      return {actionsNumber: this.actions.length};
    }
    catch(e) {
      console.error(error_console_font, e.message);
      return {error: e.message};
    };
  }
  async run() {
    this._isPaused = false;
    return {};
  }
  async stop() {
    this._isPaused = true;
    return {};
  }
}
//
class ICQLife {
  constructor(token) {
    this.token = token;
    this._isLiving = true;
    this._lastEventId = 0;
    this.me = {};
    this.store = {};
    this.waitings = [];
    this._check();
  }
  //
  async _check() {
    console.log(wait_console_font, `\nChecking and finding information about this bot (${this.token})...`);
    let response = await _ICQConnect.getQuery(this.token, '/self/get');
    this.me = response;
    if (response.hasOwnProperty('error')) {
      console.error(error_console_font, `Bot checking error: ${response.error}. Token: ${this.token}\n`);
      this.onCheckFail(this);
      this.stopListen();
      return false;
    };
    delete response.ok;
    console.log(success_console_font, `Alles gut! Token: ${this.token}`);
    this.onCheckSuccess(this);
    return true;
  }
  _listen() {
    try {
      if (!this._isLiving) throw new Error('Listening is stopped (or isnt begun)');
      _ICQConnect.getQuery(this.token, '/events/get', {lastEventId: this._lastEventId, pollTime: 10000000}).then(response=>{
        if (response.hasOwnProperty('error')) throw new Error('Some problems with ICQserver connection');
        if (response.events.length === 0) {
          this._listen();
          return {};
        };
        let lastEvent = response.events[response.events.length-1];
        if (lastEvent.eventId > this._lastEventId) {
          this._lastEventId = lastEvent.eventId;
          for (const waiting of this.waitings) {
            if (waiting.conditions.chats.length === 0) {
              if (waiting.conditions.typeChats.length === 0) {
                if (waiting.conditions.ignoreChats.length === 0) {
                  if (!waiting._isPaused) waiting._begin(lastEvent);
                  continue;
                }
                else {
                  if (waiting.conditions.ignoreChats.indexOf(lastEvent.payload.chat.chatId) === -1 && !waiting._isPaused) waiting._begin(lastEvent);
                  continue;
                };
              }
              else {
                if (waiting.conditions.typeChats.indexOf(lastEvent.payload.chat.type) !== -1) {
                  if (waiting.conditions.ignoreChats.length === 0) {
                    if (!waiting._isPaused) waiting._begin(lastEvent);
                    continue;
                  }
                  else {
                    if (waiting.conditions.ignoreChats.indexOf(lastEvent.payload.chat.chatId) === -1 && !waiting._isPaused) waiting._begin(lastEvent);
                    continue;
                  };
                }
                else continue;
              };
            }
            else {
              if (waiting.conditions.chats.indexOf(lastEvent.payload.chat.chatId) !== -1) {
                if (!waiting._isPaused) waiting._begin(lastEvent);
                continue;
              };
            };
          };
        };
        this._listen();
      });
      return {};
    }
    catch(e) {
      console.error(error_console_font, e.message);
      return {error: e.message};
    };
  }
  async listen() {
    try {
      if (!this._isLiving) throw new Error('Trying to explote died bot');
      this.onlisten(this);
      this._listen();
      return {};
    }
    catch(e) {
      console.error(error_console_font, e.message);
      return {error: e.message};
    };
  }
  async stopListen() {
    this._isLiving = false;
    this.onStopListen(this);
    return {};
  }
  bindWaitings(waitings=null) {
    try {
      if (!this._isLiving) throw new Error('Trying to explote died bot');
      if (typeof waitings !== 'object' || !waitings.hasOwnProperty('length')) throw new Error('Incorrect waitings array in bindWaitings()');
      if (waitings.length === 0) throw new Error('Incorrect waitings array in bindWaitings()');
      for (const waiting of waitings) {
        if (!waiting instanceof ICQWaiting) throw new Error('Trying to bind not a waiting');
        if (!waiting.hasOwnProperty('type')) throw new Error('Trying to bind incorrect waiting');
        let copiedWaiting = new ICQWaiting(waiting.type);
        copiedWaiting.token = this.token;
        copiedWaiting.actions = waiting.actions;
        copiedWaiting.conditions = waiting.conditions;
        copiedWaiting.myBot = this;
        this.waitings.push(copiedWaiting);
      };
      return {waitingsNumber: this.waitings.length};
    }
    catch(e) {
      console.error(error_console_font, e.message);
      return {error: e.message}
    }
  }
  unbindWaitings(waiting=null) {
    try {
      if (typeof waiting !== 'number' && waiting !== null) throw new Error('Incorrect index of action in unbindActions() in waiting');
      if (waiting === null) {
        this.waitings = [];
        return {waitingsNumber: 0};
      };
      this.waitings.splice(action, 1);
      return {waitingsNumber: this.waitings.length};
    }
    catch(e) {
      console.error(error_console_font, e.message);
      return {error: e.message};
    };
  }
  //events
  async onCheckFail(bot) {}
  async onCheckSuccess(bot) {}
  async onlisten(bot) {}
  async onStopListen(bot) {}
}
//
module.exports = {ICQWaiting, ICQLife, ICQAction};
