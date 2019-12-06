import os
import datetime
import uuid

from flask import Flask, jsonify, render_template, request
from flask_socketio import SocketIO, emit, join_room, leave_room, close_room, rooms, disconnect

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app, binary=True)
#dictronary
chat_data={}
chat_counter={}
room="";
testList=[]
testDic={}

#CONSTANT VALUES / 最大メッセージ数
MAX_MESSAGE = 500

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

    #まだルームがない場合は、初期化する
    if not room in chat_data.keys() :
        chat_data[room] = []
        chat_counter[room] = 0
        print('#######  initialized room #########')
        print(chat_data)
        print(chat_counter)
    
    emit("join room message from server", (msg, chat_data, room), room=room)

@socketio.on("send message")
def on_message(data):
    print("==================================== on_message ========================================= ")
    print(data)
    #dataから取り出す
    room = data['room']
    displayName = data['displayName']
    message_from_client = data["message"]
    print('room:' + room )
    print('displayName:' + displayName )
    print('message_from_client:' + message_from_client )

    #サーバーの時刻を追加
    now = datetime.datetime.now()
    str_now = now.strftime("%Y/%m/%d %H:%M:%S")

    #メッセージを作る
    message = { str(uuid.uuid4()): displayName + " " + str(message_from_client)  + " " + str_now }
    
    #メッセージを追加
    if room in chat_data.keys() :
        if chat_counter[room] >= MAX_MESSAGE :
            emit("message from server", "[ Reached the maximum record ]", room=room)
            return
        else :
            print('debug 1')
            save_data = message
            print(save_data)
            chat_data[room].append(save_data)
            testList.append(save_data)
    else:
        #初めてのメッセージ
        print('debug 2')
        save_data = message
        print(save_data)
        chat_data[room].append(save_data)
        testList.append(save_data)
    
    #カウントアップ
    chat_counter[room] = chat_counter[room] + 1
    # DEBUG
    print("#######chat_data##########")
    for v in chat_data[room]:
        print(v)
    # print("DEBUG==========================================")
    # {'76b0009a-ecff-4651-bcb0-678ccce2e371': 'Brave_Igarahsi aaaa 2019/11/25 14:19:24'}
    # {'4b21b0d7-9f4d-40a9-89fc-d1d1f3ec73cd': 'Brave_Igarahsi aaaa 2019/11/25 14:19:38'}
    # {'5a7077e2-311d-44f6-8cb5-9debcbeec805': 'Brave_Igarahsi aaaaa 2019/11/25 14:22:25'}
    # {'ba998228-bdf1-43f4-9c5f-a0bf58132e8d': 'Brave_Igarahsi aaaaa 2019/11/25 14:22:34'}
    # {'8eff6e4f-7f50-453e-bcc9-d7f72bbd2131': 'chrom_user aaa 2019/11/25 14:23:44'}
    # {'e1326fa6-eb76-4f1b-8042-bc580cdf9791': 'chrom_user TEST 2019/11/25 14:23:58'}
    # {'8f46403f-8ecf-475e-a0eb-550d5b57f1cc': 'chrom_user ã\x81\x82ã\x81\x82ã\x81\x82ã\x81\x82 2019/11/25 14:30:59'}
    # {'fbec350a-d6fe-4ea6-a315-cc31c118a0a9': 'chrom_user AAAAã\x81\x82ã\x81\x82 2019/11/25 14:31:05'}
    # {'bcd6f526-7b4d-46c8-a95e-9b35d42d8fc1': 'chrom_user LOUIS VUITTON 2019/11/25 14:31:19'}
    
    # for v in testList:
        # print(v)

    print("chat_counter[room] " + str(chat_counter[room]))
    print("DEBUG==========================================")

    # print("chat_data " + chat_data)
    emit("message from server", message)

@socketio.on("delete message")
def on_delete(data):
    print("==================================== on delete ========================================= ")
    print(data)
    uuid = data['uuid']
    room = data['room']

    # list1 = ['item1', 'item2', 'item3']
    # for index, item in enumerate(list1):
    #     print("インデックス：" + str(index) + ", 値：" + item)
    msg="";
    msgList=list()
    splited_data = chat_data[room].split('|')
    msgList.pop()
    # print(splited_data)
    for index, item in enumerate(splited_data):
        print("---for----")
        print(str(index) +"   "+ item)
        if item == uuid :
            print("-----if------")
            print(msgList[index-1])
            # print(msgList[index])
            del msgList[index-1]
            continue
        else:
            msgList.append(item)

    print(msgList)


 # if __name__ == '__main__':
 #    socketio.run(app)
