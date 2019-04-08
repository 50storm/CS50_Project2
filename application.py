import os
import datetime

from flask import Flask, jsonify, render_template, request
from flask_socketio import SocketIO, emit, join_room, leave_room, close_room, rooms, disconnect

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# chat_data = {"room": "", "message": "" }
chat_data={}
room="";

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
    now = datetime.datetime.now()
    str_now = now.strftime("%Y/%m/%d %H:%M:%S")
    
    print("room => " + str(room))
    join_room(room)
    msg =  str(display_name)  + ' has entered ' + room + " " + str_now

    
       
    if not room in chat_data.keys() :
        chat_data[room] = ""
    
    # for k in chat_data:
        # print("key =>" + k)
        # print("chat_data =>" + chat_data[k])

    # room_message = chat_data[room]
    # print("room_message => "  +  room_message)
    #  msg=<span class="text-info"></span> has entered room01  chat_data={room: "room01", message: "test"}
    emit("join room message from server", (msg, chat_data, room), room=room)

 
# @socketio.on('show rooms')
# def on_show_rooms(data):
    # msg = data['diplayName'] + "'" +  "room list : ".join(rooms())
    # emit("join room message from server", (msg, chat_data, room))

@socketio.on("send message")
def on_message(data):
    print("==================================== on_message ========================================= ")
    print(data)
    now = datetime.datetime.now()
    str_now = now.strftime("%Y/%m/%d %H:%M:%S")
    room = data['room']
    displayName = data['displayName']
    message = displayName + " " + data["message"]  + " " + str_now
    
    
    if room in chat_data.keys() :
        chat_data[room] = chat_data[room] + message + "<br/>"
    else:
        chat_data[room] = message + "<br/>"

    print("chat_data[room] " + chat_data[room])
    
    
    # print("message " + message)
    emit("message from server", message, room=room)
    
    

 # if __name__ == '__main__':
 #    socketio.run(app)
