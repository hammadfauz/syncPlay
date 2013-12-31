window.onload = function () {
    var videoFile = document.getElementById('VideoFile');
    var Player = document.getElementById('Player');
    window.WebSocket = window.WebSocket || window.MozWebSocket;
    var connection = new WebSocket('ws://' + window.location.hostname + ':' + window.location.port);
    connection.onopen = function () {

    };
    var onPlay = function () {
        var msg = {command : 'play', time : Player.currentTime };
        connection.send(JSON.stringify(msg));
    };
    var onPause = function () {
        var msg = {command : 'pause'};
        connection.send(JSON.stringify(msg));
    };
    var onSeeked = function () {
        var msg = {command : 'seek', time : Player.currentTime };
        connection.send(JSON.stringify(msg));
    };
    videoFile.onchange = function() {
        var file = videoFile.files[0];
        var objectURL = URL.createObjectURL(file);
        var addAllListeners = function () {
            Player.addEventListener('play', onPlay);
            Player.addEventListener('pause', onPause);
            Player.addEventListener('seeked', onSeeked);
            Player.controls = true;
        };
        var removeAllListeners = function () {
            Player.controls = false;
            Player.removeEventListener('play', onPlay);
            Player.removeEventListener('pause', onPause);
            Player.removeEventListener('seeked', onSeeked);
        };
        Player.src = objectURL;
        Player.addEventListener('error', function (err) {
            console.log(err);
        });
        Player.addEventListener('canplaythrough', function() {
            addAllListeners();
            connection.addEventListener('message', function (evt) {
                var msg = JSON.parse(evt.data);
                if (msg.command == 'play') {
                    removeAllListeners();
                    setTimeout(function() {
                        Player.currentTime = msg.time;
                        Player.play();
                    }, 100);
                    setTimeout(addAllListeners, 5000);
                }else if (msg.command == 'pause') {
                    removeAllListeners();
                    setTimeout(function() {Player.pause();}, 100);
                    setTimeout(addAllListeners, 5000);
                }else if (msg.command == 'seek') {
                    removeAllListeners();
                    setTimeout(function() {Player.currentTime = msg.time;}, 100);
                    setTimeout(addAllListeners, 5000);
                }
            });
        });
    };
};
