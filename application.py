import os
import datetime

from flask import Flask, jsonify, render_template, request
from flask_socketio import SocketIO, emit, join_room, leave_room, close_room, rooms, disconnect

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

chat_data={} # chat_data = {"room": "", "message": "" }
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
    emit("join room message from server", (msg, chat_data, room), room=room)

@socketio.on("send message")
def on_message(data):
    print("==================================== on_message ========================================= ")
    print(data)
    #dataから取り出す
    room = data['room']
    displayName = data['displayName']
    message_from_client = data["message"]
    
    #サーバーの時刻を追加
    now = datetime.datetime.now()
    str_now = now.strftime("%Y/%m/%d %H:%M:%S")

    #メッセージを作る
    message = displayName + " " + str(message_from_client)  + " " + str_now

    #メッセージがN件ですか？
    
    #メッセージを追加
    if room in chat_data.keys() :
        #<br/>でメッセージ追加
        chat_data[room] = chat_data[room] + message + "<br/>"
    else:
        #初めてのメッセージ
        chat_data[room] = message + "<br/>"

    print("chat_data[room] " + chat_data[room])
    # print("message " + message)
    emit("message from server", message, room=room)

 # if __name__ == '__main__':
 #    socketio.run(app)
