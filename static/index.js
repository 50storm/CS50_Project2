/*
broadcaset=>roomに関係なく送信

TODO:join roomしたときに、表示が全員にされてるぞい。。

*/

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
var displayName="";

// Connect to websocket
var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

// WebPageに表示されてるroomsを取得する
function getRoomListOnWebPage(){
    let ulRooms = document.querySelector('#rooms');
    let roomList = ulRooms.children;    
    return roomList;
}

function getRoomElementOnWebPage(roomName){
     let roomList = getRoomListOnWebPage();
     
      for(let i=0; i < roomList.length; i++){
        if (roomList[i].innerText == roomName){
            return roomList[i];            
        }
    }
}

function createRoom(newRoomName){
    let lists = getRoomListOnWebPage();

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
            // let displayName = document.querySelector('#displayname').innerHTML;
            
            socket.emit('join', { 'room': currentRoom, "displayName": displayName}); //送信                 
        };
        // });
    }
}

function saveRoomsInLocalStorage(){
    let roomList = getRoomListOnWebPage();
    let roomListArray = [];
    for (let i = 0; i < roomList.length; i++) {
        roomListArray.push(roomList[i].innerText);
    }

    localStorage.setItem('roomList', roomListArray);

    //debug
    console.log(localStorage.getItem("roomList"));
}

function clearRoomsOnWebPage(){
    let ulRooms = document.querySelector('#rooms');
    while (ulRooms.firstChild) {
        ulRooms.removeChild(ulRooms.firstChild);
    }  
}

// Restore rooms from Localstrage
function restoreRooms(){
    // HTMLにあるroomsをクリア
    clearRoomsOnWebPage();


    let roomList = getRoomListOnWebPage();
    let savedRoomNameList = localStorage.getItem("roomList").split(",");
   
    if(savedRoomNameList.length > 0){
        for (let i = 0; i<savedRoomNameList.length; i++ ){
            let li = document.createElement('li');
            if(savedRoomNameList[i] !== ""){
                //TODO:Debugging
                li.innerText = savedRoomNameList[i];
                ulRooms.append(li);
            } 
        }
    }else{
         // TODO: everyoneが消えてる
        let li = document.createElement('li');
        li.innerText = "everyone";
        ulRooms.append(li);
    }
}

//ページを閉じる時
window.addEventListener('beforeunload',()=>{
    saveRoomsInLocalStorage();
    if(currentRoom !== ""){
        //TODO:For debugging a bug
        localStorage.setItem('currentRoom', currentRoom );
    }
});
    
//DOMドキュメントを読み終わった
document.addEventListener('DOMContentLoaded', () => {
    //Display Nameの処理
    displayName = localStorage.getItem("displayName");
    if( displayName == null || displayName =="" ){
        displayName = prompt("Input your display name!");
        console.log(displayName);
        localStorage.setItem('displayName', displayName);
    
    }
    setDisplayName(displayName);
    //ローカルストレージから戻す
    restoreRooms();
    addClickEventToRoomList();
    currentRoom = localStorage.getItem('currentRoom');
    if( currentRoom !=="" ){
        let currentRoomElement = getRoomElementOnWebPage(currentRoom);
        currentRoomElement.dispatchEvent(new Event('click'));

    }
    

    // document.querySelector('#btnShowRooms').onclick = () => {
        // socket.emit('show rooms', { 'diplayName': localStorage.getItem("displayName") }); //送信
        
    // };
    
    document.querySelector('#btnCreateRoom').onclick = () => {
                    let newRoomName = document.querySelector('#txtNewRoomName').value;
                    createRoom( newRoomName );
    };
    
    document.querySelector('#sendMessage').onclick = () => {
                    let lists = getRoomListOnWebPage();
                    let room;
                    for(let i=0; i<lists.length; i++){
                        let re = /(selected)/;
                        let li = lists[i];
                            
                        if( re.test(li.className) ){
                            room = li.innerText;
                        }
                    }
                    
                    if(room === undefined){
                        alert("Please select room!");
                        return ; 
                    }
                    
                    let message = document.querySelector('#message').value;
                    // alert(message);
                    // socket.emit('send message', {'room': room, 'message': message}); //送信
                    socket.emit('send message', {'room': room, 'message': message, 'displayName': displayName}); //送信
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
    
    socket.on('join room message from server', (msg, chat_data, room) => {
        if(room === currentRoom){
            if (Object.keys(chat_data).length !== 0) {
                if(chat_data[ room ] !== ""){
                    document.querySelector('#receivedMessage').innerHTML += chat_data[ room ] + "<br />";
                }
            }
            document.querySelector('#receivedMessage').innerHTML += msg + "<br />";
        }
        
    });
 
});
