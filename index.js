const App = require('express')();
const Http = require('http').Server(App);
const Io = require('socket.io')(Http);
const CryptoJS = require('crypto-js');
const Request = require('request');

const rq = Request;
const cfg = JSON.parse(require('fs').readFileSync('./cfg.json', 'utf8'));


// cc key
const apiserver = 'http://localhost:8080/v4/';

App.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

Io.on('connection', function(socket) {
    console.log('a user connected');
    socket.on('command', function(msg) {
        let nonce = Date.now();
        let message = msg.command + nonce;
        let sig = CryptoJS.SHA1(message + cfg.key + cfg.secret).toString();
        let options = {
            url: apiserver + msg.command.toLowerCase(),
            headers: {
                'key': cfg.key,
                'message': message,
                'signature': sig,
                'nonce': nonce,
            },
        };
        rq(options, function(err, res, body) {
            Io.emit('message', {
                send: JSON.stringify(options),
                receive: body,
            });
        });
    });
});

Http.listen(3000, function() {
    console.log('listening on *:3000');
});
