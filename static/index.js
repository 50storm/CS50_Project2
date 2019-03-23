
function createRoom(newRoomName){
    let rooms = document.querySelector('#rooms');
    let newList = document.createElement('li');
    newList.innerText = newRoomName;
    rooms.append( newList );
}


function setDisplayName(displayName){
    document.querySelector('#displayname').innerHTML = '<span class="text-info">' + displayName + '</span>';
}


document.addEventListener('DOMContentLoaded', () => {

    var displayName;
    displayName  = localStorage.getItem("displayName");
    if(displayName == null){
        displayName = prompt("Input your display name!");
        console.log(displayName);
        localStorage.setItem('displayName', displayName);
    
    }
    setDisplayName(displayName);
    


    
    
    let rooms = document.querySelector('#rooms');
    let lists = rooms.children;
    for(let i=0; i<lists.length; i++){
        let li = lists[i];
        console.log(li);
        li.onclick = (e) => {
            console.log(li.innerText);  
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
            let room = li.innerText;
            let displayName = document.querySelector('#displayname').innerHTML;
            socket.emit('join', {'room': room, "displayName": displayName}); //送信                 
        }
    }
       
    

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // When connected, configure buttons
    socket.on('connect', (data) => {
        console.log('connect');
        if(data !== undefined){
            console.log(data['data']);
        }
        


        // Each button should emit a "submit vote" event
        document.querySelectorAll('button').forEach(button => {
            if(button.id == "btnCreateRoom"){
                button.onclick = () => {
                    let newRoomName = document.querySelector('#txtNewRoomName').value;
                    createRoom( newRoomName );
                };
                
            }else if(button.id == 'sendMessage'){
                button.onclick = () => {
                    let rooms = document.querySelector('#rooms');
                    let lists = rooms.children;
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
            }
            
        });

        
    });

    socket.on('message from server', data => {
        console.log(data);
        
        document.querySelector('#receivedMessage').innerHTML += data + "<br />";
        
    });
    
    socket.on('join room message from server', data => {
        console.log(data);
        
        document.querySelector('#receivedMessage').innerHTML += data + "<br />";
        
    });
    
    
    // When a new vote is announced, add to the unordered list
    socket.on('vote totals', data => {
        document.querySelector('#yes').innerHTML = data.yes;
        document.querySelector('#no').innerHTML = data.no;
        document.querySelector('#maybe').innerHTML = data.maybe;
    });
});
