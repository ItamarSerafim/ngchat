angular.module('io.service', []).
factory('io', function ($http) {
  var socket,
    ioServer,
    ioRoom,
    watches = {};
    
    function clearUsersArray(peopleInChat){
      for(key in peopleInChat){
        var person = peopleInChat[key];

        if (person && person.id) {
          if(person.id == socket.id) person.self = 1;
          var rooms = Object.keys(person.rooms);
        }

        if(!(ioRoom in person.rooms)) delete peopleInChat[key];
      }
      watches['users'](peopleInChat);
    }

  return {
    init: function (conf) {
      ioServer = conf.ioServer;
      ioRoom = conf.ioRoom;

      socket = io.connect(conf.ioServer);
      var joinRoomResponse = socket.emit('event.subscribe', conf.subscriptionInfo, function (response) {
          //This callbac is not working :(
            console.log('start recording emit response',response);
        });
      
      socket.emit('event.addUser', conf.username);

      socket.on('event.userAdded', clearUsersArray);
      socket.on('event.userDesconnected', clearUsersArray);
      
      socket.on('event.response', function (data) {
        var message = data;
        if (data.room === ioRoom) {
          data.message.user = data.user;
          if(data.user.id == socket.id) data.user.self = 1;
          return watches['message'](data.message);
        }
      });

    },

    subscribe: function () {
      socket.emit('event.subscribe', ioRoom);
    },

    emit: function (arguments) {
      socket.emit('event.message', {
        room: ioRoom,
        to: arguments.to,
        message: arguments
      });
    },

    watch: function (item, data) {
      watches[item] = data;
    },

    unWatch: function (item) {
      delete watches[item];
    }
  };
});
