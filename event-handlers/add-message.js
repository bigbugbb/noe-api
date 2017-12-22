const db = require('../db');
const { Thread } = require('../models/thread');
const _ = require('lodash');
const axios = require('axios');

const apiHost = 'http://localhost:3000/api/v1';

const findThread = async function (token, author, target) {
  return await Thread.findOne({
    $or: [
      { 'author.id': author, 'target.id': target },
      { 'author.id': target, 'target.id': author }
    ]
  });
};

const createThread = async function (token, author, target, text) {
  const res = await axios({
    method: 'post',
    url: `${apiHost}/threads`,
    data: { author, target, text },
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.data.thread;
};

const updateThread = async function (token, userId, threadId, lastMessage) {
  const res = await axios({
    method: 'patch',
    url: `${apiHost}/users/${userId}/threads/${threadId}`,
    data: { lastMessage },
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.data.thread;
};

const createMessage = async function (token, author, target, text, thread, uuid) {
  const res = await axios({
    method: 'post',
    url: `${apiHost}/messages`,
    data: { author, target, text, thread },
    headers: { 'Authorization': `Bearer ${token}` }
  });
  res.data.message['uuid'] = uuid;
  return res.data.message;
};

const addMessageHandler = function (nsp) {
  return async (room, token, author, target, text, uuid) => {
    try {
      let thread = await findThread(token, author, target);
      thread = _.isEmpty(thread) ?
        await createThread(token, author, target, text) :
        await updateThread(token, author, thread.id, text);
      nsp.to(room).emit('thread-updated', thread);
      const message = await createMessage(token, author, target, text, thread, uuid);
      nsp.to(room).emit('message-added', message);
    } catch (e) {
      console.error(`Error: ${e.code}`);
    }
  };
};

module.exports = addMessageHandler;
