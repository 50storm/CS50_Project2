echo setting flask
SET FLASK_APP=application.py
SET FLASK_DEBUG=0
rem SET FLASK_DEBUG=1
SET SECRET_KEY=\xd3\xe4\xb2\xc4\xa3\x98\xd4\xd9\xcf
rem SET DATABASE_URL=postgres://hiroshi:Tera54hiro@localhost/bookreview
echo setting flask run --port=80
flask run --port=80
