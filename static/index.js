//=============================
// 先頭の空白を削除
//=============================
String.prototype.ltrim = function () {
    return this.replace(/^\s+/, "");
}
//=============================
// 末尾の空白を削除
//=============================
String.prototype.rtrim = function () {
    return this.replace(/\s+$/, "");
}
//=============================
// 先頭および末尾の空白を削除
//=============================
String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, "");
    // 以下でも同じ。
    //return this.replace(/^( |　)+|( |　)+$/g, "");
}
var currentRoom="";

// Connect to websocket
var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

function getRoomList(){
    let ulRooms = document.querySelector('#rooms');
    let roomList = ulRooms.children;    
    return roomList;
}

function createRoom(newRoomName){
    let lists = getRoomList();
    let newList = document.createElement('li');
    newRoomName = newRoomName.trim();
    if (newRoomName == ""){
        alert("Input room name!");
        return false;

    }

    for(let i=0; i < lists.length; i++){
        if (lists[i].innerText == newRoomName){
            alert(newRoomName.toString() + "  already exists. ");
            return false;            
        }
    }
    
    newList.innerText = newRoomName;
    rooms.append( newList );
    addClickEventToRoomList();
    
    return true;
}

function setDisplayName(displayName){
    document.querySelector('#displayname').innerHTML = '<span class="text-info">' + displayName + '</span>';
}

function clearMessage(){
    let receviedMeaage =  document.querySelector('#receivedMessage');
    let messages = receviedMeaage.children;
    if (messages.length != 0 ){
        while (receviedMeaage.firstChild) {
            receviedMeaage.removeChild(receviedMeaage.firstChild)
        }
    }
    
}

function addClickEventToRoomList(){
    let rooms = document.querySelector('#rooms');
    let lists = rooms.children;
    for(let i=0; i<lists.length; i++){
        let li = lists[i];
        console.log(li);
       
        // li.addEventListener("click", (e) => {
        li.onclick =(e) => {
            console.log(li.innerText);  

            if (currentRoom !== li.innerText){
                clearMessage();
                currentRoom = li.innerText;
            }

            let rooms = document.querySelector('#rooms');
            let lists = rooms.children;
            for(let i=0; i<lists.length; i++){
                let re = /(selected)/;
                let li = lists[i];
                let boolResult = re.test(li.className);
                    console.log("boolResult " + boolResult);
                if(boolResult){
                    li.classList.remove('selected','text-info');
                }
            }
            li.classList.add('selected','text-info');
            let displayName = document.querySelector('#displayname').innerHTML;
            socket.emit('join', { 'room': currentRoom, "displayName": displayName}); //送信                 
        };
        // });
    }
}

function saveRoomsInLocalStorage(){
    let roomList = getRoomList();
    let roomListArray = [];
    for (let i = 0; i < roomList.length; i++) {
        roomListArray.push(roomList[i].innerText);
    }

    localStorage.setItem('roomList', roomListArray);

    //debug
    console.log(localStorage.getItem("roomList"));
}

function restoreRooms(){
    let ulRooms = document.querySelector('#rooms');
    let roomList = getRoomList();
    while (ulRooms.firstChild) {
        ulRooms.removeChild(ulRooms.firstChild);

    }
    let savedRoomNameList = localStorage.getItem("roomList").split(",");
    for (let i = 0; i<savedRoomNameList.length; i++ ){
        let li = document.createElement('li');
        li.innerText = savedRoomNameList[i];
        ulRooms.append(li);
    }
}

document.addEventListener('DOMContentLoaded', () => {

    let displayName = localStorage.getItem("displayName");
    if( displayName == null || displayName =="" ){
        displayName = prompt("Input your display name!");
        console.log(displayName);
        localStorage.setItem('displayName', displayName);
    
    }
    setDisplayName(displayName);
    saveRoomsInLocalStorage();
    restoreRooms();
    addClickEventToRoomList();

    document.querySelector('#btnCreateRoom').onclick = () => {
                    let newRoomName = document.querySelector('#txtNewRoomName').value;
                    createRoom( newRoomName );
    };
    
    document.querySelector('#sendMessage').onclick = () => {
                    let lists = getRoomList();
                    let room;
                    for(let i=0; i<lists.length; i++){
                        let re = /(selected)/;
                        let li = lists[i];
                            
                        if( re.test(li.className) ){
                            room = li.innerText;
                        }
                    }
                    
                    let message = document.querySelector('#message').value;
                    // alert(message);
                    socket.emit('send message', {'room': room, 'message': message}); //送信
    };
    
    // When connected, configure buttons
    socket.on('connect', (data) => {
        console.log('connect');
        if(data !== undefined){
            console.log(data['data']);
        }

    });

    socket.on('message from server', data => {
        console.log(data);
        
        document.querySelector('#receivedMessage').innerHTML += data + "<br />";
        
    });
    
    socket.on('join room message from server', (data, data2) => {
        console.log(data);
        console.log(data2);
        document.querySelector('#receivedMessage').innerHTML += data2['room01'] + "<br />";
        document.querySelector('#receivedMessage').innerHTML += data + "<br />";
        
        
    });
 
});
