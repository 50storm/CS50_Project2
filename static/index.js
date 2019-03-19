

function setDisplayName(displayName){
    document.querySelector('#displayname').innerHTML = '<span class="text-info">' + displayName + '</span>';
}

document.addEventListener('DOMContentLoaded', () => {

    // let displayName = prompt("Input your display name!");
    // setDisplayName(displayName);
    // console.log(displayName);


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
            if(button.id == 'joinButon'){
                console.log(button.id);
                button.onclick = () => {
                   
                    let room;
                    let rooms = document.querySelector('#rooms');
                    for(let i=0; i<rooms.length; i++){
                        if(rooms.options[i].selected){
                            room = rooms.options[i].value; break;
                        }
                    }
                    let displayName = document.querySelector('#displayname').innerHTML;
                    console.log( room );
                    console.log( displayName );
                    socket.emit('join', {'room': room, "displayName": displayName}); //送信
                };    
                
            }else if(button.id == 'sendMessage'){
                button.onclick = () => {
                    let message = document.querySelector('#message').value;
                    // alert(message);
                    socket.emit('submit send message', {'message': message}); //送信
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
