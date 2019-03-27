import os

from flask import Flask, jsonify, render_template, request
from flask_socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# chat_data = {"room": "", "message": "" }
chat_data={}

@app.route("/")
def index():
    return render_template("index.html")

@socketio.on('connect')
def on_connect():
    print("connect event!!!")
    emit('connect', {'data': 'Connected'})
    
    
@socketio.on('join')
def on_join(data):
    print("====================================== on_join ======================================")
    print(data)
    # print(data2)
    display_name = data['displayName']
    room = data['room']
    join_room(room)
    msg =  str(display_name)  + ' has entered ' + room
    
    # for key in chat_data :
    #     if(key === romm):
    #         chat_data[ key ]


    #  msg=<span class="text-info"></span> has entered room01  chat_data={room: "room01", message: "test"}
    emit("join room message from server", (msg, chat_data, room), room=room)
    
 

@socketio.on("send message")
def on_message(data):
    print("==================================== on_message ========================================= ")
    room = data['room']
    message = data["message"]
    
    if room in chat_data.keys() :
        chat_data[room] = chat_data[room] + message + "<br/>"
    else:
        chat_data[room] = message + "<br/>"

    print("chat_data[room] " + chat_data[room])

    # print("message " + message)
    emit("message from server", message, room=room)
    
    

 # if __name__ == '__main__':
 #    socketio.run(app)
