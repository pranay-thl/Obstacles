function addIncomingMessage(msgObj) {
    let $msgDiv = $('<div class="media w-50 mb-3"/>');
    $msgDiv.prepend('<img src="https://lh3.googleusercontent.com/_4zBNFjA8S9yjNB_ONwqBvxTvyXYdC7Nh1jYZ2x6YEcldBr2fyijdjM2J5EoVdTpnkA" alt="user" width="50" class="rounded-circle"/>');
    let $msgDivInner = $('<div class="media-body ml-3"/>');
    let $textDiv = $('<div class="bg-light rounded py-2 px-3 mb-2"/>');
    let $textPara = $('<p class="text-small mb-0 text-muted"/>');
    $textPara.text(msgObj.message);
    $textDiv.append($textPara);
    let $datetimePara = $('<p class="small text-muted"/>')
    $datetimePara.text(new Date().toLocaleTimeString());
    $msgDivInner.append($textDiv, $datetimePara);
    $msgDiv.append($msgDivInner);

    $("#chatBox").append($msgDiv);
}

function addOutGoingMessage(message) {
    let $msgDiv = $('<div class="media w-50 ml-auto mb-3"/>');
    let $msgDivInner = $('<div class="media-body"/>');
    let $textDiv = $('<div class="bg-primary rounded py-2 px-3 mb-2"/>');
    let $textPara = $('<p class="text-small mb-0 text-white"/>');
    $textPara.text(message);
    $textDiv.append($textPara);
    let $datetimePara = $('<p class="small text-muted"/>')
    $datetimePara.text(new Date().toLocaleTimeString());
    $msgDivInner.append($textDiv, $datetimePara);
    $msgDiv.append($msgDivInner);

    $("#chatBox").append($msgDiv);
}

function contentHandler() {
    var $window = $(window);
    var $submit_button = $("#button_sendmsg");
    var $message = $("#msgInput");
    var $heading = $("#heading");
    var username = "User";
    $.getJSON("/user_data", (data) => {
        if (data.hasOwnProperty('username')) {
            username = data.username;
            $heading.html("Discord Chat: " + data.username);
        }
        else {
            socket.disconnect();
            window.location.href = "/logout";
        }
    });

    var socket = io();
    socket.on('message', (msgObj) => {
        let msg = msgObj.message;
        if (msgObj.username) {
            msg = msgObj.username + ": " + msg;
        }
        if ("Notification" in window) {
            if (Notification.permission === "granted") {
                var notification = new Notification(msgObj.username, { body: msgObj.message, icon: "https://lh3.googleusercontent.com/_4zBNFjA8S9yjNB_ONwqBvxTvyXYdC7Nh1jYZ2x6YEcldBr2fyijdjM2J5EoVdTpnkA" });
            }
            else {
                Notification.requestPermission().then(function (permission) {
                    if (permission === "granted") {
                        var notification = new Notification(msgObj.username, { body: msgObj.message, icon: "https://lh3.googleusercontent.com/_4zBNFjA8S9yjNB_ONwqBvxTvyXYdC7Nh1jYZ2x6YEcldBr2fyijdjM2J5EoVdTpnkA" });
                    }
                });
            }
        }
        addIncomingMessage({ message: msg });
    });
    socket.on('logout', () => {
        socket.disconnect();
        window.location.href = "/logout";
    })
    $submit_button.click(() => {
        let messageText = $message.val();
        if (messageText.trim().length) {
            addOutGoingMessage(messageText);
            let msgObj = {
                username: username,
                message: messageText
            }
            socket.emit("message", msgObj);
        }
        $message.val("");
    });

    $window.keydown(function (event) {
        if (!(event.ctrlKey || event.metaKey || event.altKey)) {
            $message.focus();
        }
    });

}

$(document).ready(() => {
    contentHandler();
})