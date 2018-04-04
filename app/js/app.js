angular.module('myApp', ['io.service']).
/*
run(function (io) {
  io.init({
    ioServer: 'http://localhost:3696',
    ioRoom: 'TestRoom'
  });
}).*/

controller('MainController', function ($scope, io) {
  
  $scope.rooms = [
    {
      title: 'The English Munchers',
      numberOfUsers: 0
    },
    {
      title: 'The Poliglot Group 101',
      numberOfUsers: 0
    }
  ];

  $scope.selectRoom = function(index){
    $scope.selectedRoom = $scope.rooms[index];
    $scope.init();
    //$scope.subscribe();
  }

  $scope.init = function () {
    //TODO: ask the user for a nickname, if there's none provided
    if(!$scope.nickname || ($scope.nickname && $scope.nickname.length < 2)) return;

    io.init({
      ioServer: 'http://localhost:3696',
      subscriptionInfo: {room: $scope.selectedRoom.title, nickname: $scope.nickname},
      ioRoom: $scope.selectedRoom.title,
      username: $scope.nickname
    });
    $scope.initiated = true;
  }

  /**
   * 
   * @param {Object} event The event for getting the keycode
   * @param {String} to String defining who the message is sent to. Possible values: 'someone', 'everyone'
   */
  $scope.send = function (event, to) {
    if(event && (event.keyCode && event.keyCode !== 13 || event.shiftKey)) return;
    //Prevent sending empty message
    if(($scope.message || '').trim().length < 1) return;

    io.emit({
      to: to,
      message: $scope.message
    });

    $scope.message = null;
    //document.getElementById('last-msg').scrollIntoView({behavior: 'smooth'});

    var div = document.getElementById('chat-messages');
    setTimeout(function(){
      div.scrollTop = div.scrollHeight - div.clientHeight;
    }, 100);
  }

  $scope.subscribe = function(){
    io.subscribe();
  }

  io.watch('users', function(peopleInChat){
    $scope.usersList = peopleInChat;
    $scope.$apply();
  });

  io.watch('message', function (data) {
    $scope.lastMessage = data.message;
    $scope.messages = $scope.messages || [];
    var date = new Date(data.time);
    if(date !== 'Invalid Date'){
      data.time = date.getUTCFullYear() + '/' + (date.getUTCMonth() + 1) + '/' + date.getUTCDate() + ' - ' + date.getHours() + ':' + date.getMinutes();
    } else{
      data.time = '';
    }
    var receiver = $scope.usersList.filter( function(item){ return item.id == data.to;});
    data.receiver = receiver;
    $scope.messages.push(data);
    $scope.$apply();
  });
});
