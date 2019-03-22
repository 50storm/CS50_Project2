import os

from flask import Flask, jsonify, render_template, request
from flask_socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)


@app.route("/")
def index():
    return render_template("index.html", votes=votes)

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
    emit("join room message from server", msg, room=room)
 

@socketio.on("send message")
def on_message(data):
    print("==================================== on_message ========================================= ")
    room = data['room']
    message = data["message"]
    
    # print("message " + message)
    emit("message from server", message, room=room)
    
    
@socketio.on("submit vote")
def vote(data):
    selection = data["selection"]
    votes[selection] += 1
    emit("vote totals", votes, broadcast=True)

 # if __name__ == '__main__':
 #    socketio.run(app)
