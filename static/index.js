

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
    socket.on('connect', () => {
        console.log('connect');

        // Each button should emit a "submit vote" event
        document.querySelectorAll('button').forEach(button => {
            if(button.id == 'joinButon'){
                console.log(button.id);
                button.onclick = () => {
                   
                    let selectRoom;
                    let rooms = document.querySelector('#rooms');
                    for(let i=0; i<rooms.length; i++){
                        if(rooms.options[i].selected){
                            selectRoom = rooms.options[i].value; break;
                        }
                    }
                    
                    alert( selectRoom );
                    
                    socket.emit('submit join room', {'selectRoom': selectRoom}); //送信
                   
                    
                };    
                
            }else{
                // button.onclick = () => {
                    // const selection = button.dataset.vote;
                    // socket.emit('submit vote', {'selection': selection}); //送信
                // };    
            }
            
        });

        
    });

    // When a new vote is announced, add to the unordered list
    socket.on('vote totals', data => {
        document.querySelector('#yes').innerHTML = data.yes;
        document.querySelector('#no').innerHTML = data.no;
        document.querySelector('#maybe').innerHTML = data.maybe;
    });
});
