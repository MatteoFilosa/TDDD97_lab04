# file: gevent_app.py
from server import app
from gevent.pywsgi import WSGIServer

http_server = WSGIServer(('127.0.0.1', 5000), app)
http_server.serve_forever()
