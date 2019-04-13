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

// room名からWebPageのroomsを検索し返却する
function getRoomElementOnWebPage(roomName){
    let result = "";
    //WebPage上のroomsからroomListを取得
    let roomList = getRoomListOnWebPage();
     
    if( roomList.length > 0 ){
        for(let i=0; i < roomList.length; i++){
            if (roomList[i].innerText == roomName){
                result = roomList[i];            
            }
        }
    }
    return result;
}

//新しいroomを作る
function createRoom(newRoomName){
    // 引数チェック
    newRoomName = newRoomName.trim();
    if (newRoomName == ""){
        //空入力だったら警告メッセを出力し、falseを返す
        alert("Input room name!");
        return false;
    }

    // 表示されてるroomを取得し、同じ名前がチェック
    let lists = getRoomListOnWebPage();
    for(let i=0; i < lists.length; i++){
        if (lists[i].innerText == newRoomName){
            alert(newRoomName.toString() + "  already exists. ");
            return false;            
        }
    }

    // liを作り追加する
    let newList = document.createElement('li');
    newList.innerText = newRoomName;
    rooms.append( newList );

    // イベントを追加する
    addClickEventToRoomList();
    return true;
}

//Display Nameの処理
function setDisplayName(){
    displayName = localStorage.getItem("displayName");
    if( displayName == null || displayName =="" ){
        displayName = prompt("Input your display name!");
        console.log(displayName);
        localStorage.setItem('displayName', displayName);
    
    }
    document.querySelector('#displayname').innerHTML = '<span class="text-info">' + displayName + '</span>';
}

// メッセージをクリアする
function clearMessage(){
    let receviedMeaage =  document.querySelector('#receivedMessage');
    let messages = receviedMeaage.children;
    if (messages.length != 0 ){
        while (receviedMeaage.firstChild) {
            receviedMeaage.removeChild(receviedMeaage.firstChild)
        }
    }    
}

// それぞれのルームにクリックイベントを追加する
function addClickEventToRoomList(){
    let lists = getRoomListOnWebPage();

    for(let i=0; i<lists.length; i++){
        let li = lists[i];
        console.log(li);
       
        li.addEventListener("click", (e) => {
            console.log(li.innerText);  

            if (currentRoom !== li.innerText){
                clearMessage();
                currentRoom = li.innerText;
            }

            let lists = getRoomListOnWebPage();
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
            socket.emit('join', { 'room': currentRoom, "displayName": displayName}); //送信                 
        });
    }
}

// ローカルストレージにroomを保存する
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

// HTML上のroomを削除する
function clearRoomsOnWebPage(){
    let ulRooms = document.querySelector('#rooms');
    while (ulRooms.firstChild) {
        ulRooms.removeChild(ulRooms.firstChild);
    }  
}

// Restore rooms from Localstrage
function restoreRooms(){
    // HTMLにあるroomsをクリア(appendで追加していくので)
    clearRoomsOnWebPage();
    // Ulタグを取得
    ulRooms = document.querySelector('#rooms')

    if( localStorage.getItem("roomList") !== null ){
        // alert("rooomList is NOT null");
        let savedRoomNameList = localStorage.getItem("roomList").split(",");
        // alert(savedRoomNameList);
        if(savedRoomNameList.length > 0){
            //ローカルストレージに保存されている
            for (let i = 0; i<savedRoomNameList.length; i++ ){
                let li = document.createElement('li');
                    li.innerText = savedRoomNameList[i];
                    ulRooms.append(li);
            }
        }
    }else{
        //初回
        // alert("rooomList is NULL");
        //ローカルストレージに保存されてない
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

    setDisplayName(displayName);
    //ローカルストレージから戻す
    restoreRooms();
    //クリックイベントを追加する
    addClickEventToRoomList();
    currentRoom = localStorage.getItem('currentRoom');
    debugger;
    console.log(currentRoom);
    // alert("currentRoom(リストアしたチャネル) =>" + currentRoom);
    
    if( currentRoom !== null && currentRoom !== "null" && currentRoom !== "" ){
        //今のルームがブランク
        let currentRoomElement = getRoomElementOnWebPage(currentRoom);
        //TODO: Chromだとエラーとなる。
        currentRoomElement.dispatchEvent(new Event('click'));

        //TODO:途中
        // var event = document.createEvent('Event');
        // event.initEvent('click', true, true);
        // currentRoomElement.addEventListener('click', function(e)=>{

        // },false);


        // currentRoom.trigger('click');
        // debugger;
        // document.querySelector('#' + currentRoom ).click();
        //$('#' + currentRoom ).trigger('click'); // TGODO:jQUeryでclickイベントをつけないとダメらしい。。
        // setTimeout(()=>{
        //     document.querySelector('#' + currentRoom ).click(),1000
        // });
        
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
