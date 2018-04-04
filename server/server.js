var express = require('express');
var server = require('http').createServer(app);
var app = express();
var io = require('socket.io')(server);

var port = 3696;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

var people = {};


io.on('connection', function (socket) {

  //console.log('user connected...%d', new Date().getTime());

  //socket.broadcast.emit('user connected');

  socket.on('event.addUser', function (username) {
    people[socket.id] = {username: username, id: socket.id, rooms: socket.rooms};
    socket.userInfo = socket.userInfo || people[socket.id];
    //TODO may be I must store people in an array?
    var peopleInChat = [];
    var obj = {};
    for(key in people){
      var user = people[key];
      if(user) peopleInChat.push(user);
    }
    io.emit('event.userAdded', peopleInChat);
  });
  
  socket.on('event.message', function (payload) {

    payload.message ?  payload.message.time = new Date().getTime() : null;

    payload.user = people[socket.id];

    if(payload.to && payload.to != 'everyone'){//TODO: Verify security problems
      io.sockets.in(socket.rooms).to(payload.to).to(socket.id).emit('event.response', payload);  
    }else{
      //TODO: send to a specific room and take out the code related to room at io.js: line 22
      io.emit('event.response', payload);
    }
    
  });

  socket.on('event.subscribe', 
  /**
   * subscriptionInfo {Object} - 
   */
    function (subscriptionInfo) {
    //console.log('subscribing to', room);
    socket.join(subscriptionInfo.room);
    socket.userInfo = socket.userInfo || {};
    socket.userInfo.room = subscriptionInfo.room;
    socket.userInfo.rooms = socket.rooms;

    var person = people[socket.id];
    if(person) person.rooms = socket.rooms;

  });

  socket.on('event.unsubscribe', function (room) {
    socket.leave(room);
  });

  socket.on('disconnect', function (req, resp) {
    console.log('user disconnected...', req);
    io.emit('user disconnected', socket.id);

    for(key in people){
      if(key == socket.id) delete people[key];
    }

    var peopleInChat = [];
    for(key in people){
      var user = people[key];
      if(user) peopleInChat.push(user);
    }
    io.emit('event.userDesconnected', peopleInChat);

  });
  

});
