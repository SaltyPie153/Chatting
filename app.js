/* 설치한 express 모듈 불러오기*/
const express = require("express");
const app = express();
const io = require("socket.io");
const crypto = require("crypto");
const { request, response } = require("express");
const Server = require("http").createServer(app);
const fs = require('fs')

app.use('/css', express.static('./static/css'))
app.use('/js', express.static('./static/js'))

// get 방식으로 / 경로에 접속하면 실행 됨
app.get("/",(request, response)=>{
    fs.readFile('./static/index.html', function(err, data){
        if(err){
            response.send('에러')
        } else {
            response.writeHead(200, {'Content-Type' : 'text/html'})
            response.write(data)
            response.end()
        }
    })
})

io.sockets.on('connection', function(socket){

    // 새로운 유저가 접속했을 경우 다른 소켓에게도 알려줌
    socket.on('newUser', function(name){
        console.log(name + '님이 접속하였습니다.')
        // 소켓에 이름 저장
        socket.name = name
        // 모든 소켓에게 전송
        io.sockets.emit('update', {
            type: 'connect',
            name: 'SERVER',
            message: name + '님이 접속하였습니다.'
        })
    })

    // 전송한 메세지 받기
    socket.on('message', function(data){
        // 받은 데이터에 누가 보냈는지 이름을 추가
        data.name = socket.name

        console.log(data)
        
        // 보낸 사람을 제외한 나머지 유저에게 메세지 전송
        socket.broadcast.emit('update', data);
    })

    // 접속 종료
    socket.on('disconnect', function(){
        console.log(socket.name + '님이 퇴장했습니다.')
        // 나가는 사람을 제외한 나머지 유저에게 메세지 전송
        socket.broadcast.emit('update', {
            type: 'disconnect',
            name: 'SERVER',
            message: socket.name + '님이 나가셨습니다.'
        });
    })
})

// 서버를 포트 3300으로 listen
Server.listen(3300, (err) => {
    if(err) return console.log(err);
    console.log("The server is listening on port 3300");
});