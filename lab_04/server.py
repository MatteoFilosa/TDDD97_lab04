from flask import Flask, jsonify, request, render_template, session, redirect, url_for
from werkzeug.security import generate_password_hash, check_password_hash
from engineio.async_drivers import gevent
#from authlib.integrations.flask_client import OAuth
#from auth_decorator import login_required
from datetime import timedelta
from flask_socketio import SocketIO, send, emit
import binascii
import os
import database_helper
import sys
webSocketConnection=[]

tokenDic = {
    "token": "",
    "email": ""
 }
tokenHash = ""


app = Flask(__name__, template_folder='static')
app.debug = True
socketio = SocketIO(app)

@socketio.on('connect')
def websocketConnection():
    print("Client establishing websocket connection")
    if webSocketConnection:
        for e in webSocketConnection:
            print("e[0] is: ", e[0])
            print("email is: ", tokenDic["email"])
            print("Socket id is: ", request.sid)
            if(e[1]==tokenDic["email"]):
                webSocketConnection.remove(e)
                socketio.send("signout", to=e[0])

    webSocketConnection.append((request.sid, tokenDic["email"], tokenDic["token"]))

@socketio.on('disconnect')
def disconnect():
    if webSocketConnection:
        for e in webSocketConnection:
            webSocketConnection.remove(e)
    
#Session config
app.secret_key = 'random secret'


# oAuth Setup
#oauth = OAuth(app)
#google = oauth.register(
    #name='google',
    #client_id="274085789990-3tmjvlcbdq657p8vf8tsjaloob4q6kei.apps.googleusercontent.com",#os.getenv("GOOGLE_CLIENT_ID"),
    #client_secret="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",
    #access_token_url='https://accounts.google.com/o/oauth2/token',
    #access_token_params=None,
    #authorize_url='https://accounts.google.com/o/oauth2/auth',
    #authorize_params=None,
    #api_base_url='https://www.googleapis.com/oauth2/v1/',
    #userinfo_endpoint='https://openidconnect.googleapis.com/v1/userinfo',  # This is only needed if using openId to fetch user info
    #client_kwargs={'scope': 'openid email profile'},
#)
"""""
@app.route('/oauthlogin')
def login():
    google = oauth.create_client('google')  # create the google oauth client
    redirect_uri = url_for('authorize', _external=True)
    return google.authorize_redirect(redirect_uri)
"""
""""
@app.route('/authorize')
def authorize():
    google = oauth.create_client('google')  # create the google oauth client
    token = google.authorize_access_token()  # Access token from google (needed to get user info)
    resp = google.get('userinfo')  # userinfo contains stuff u specificed in the scrope
    user_info = resp.json()
    user = oauth.google.userinfo()  # uses openid endpoint to fetch user info
    # Here you use the profile/user data that you got and query your database find/register the user
    # and set ur own data in the session not the profile from google
    session['profile'] = user_info
    session.permanent = True  # make the session permanant so it keeps existing after broweser gets closed
    return redirect('/')
"""

@app.route('/oauthlogout')
def logout():
    for key in list(session.keys()):
        session.pop(key)
    return redirect('/')

#########END OAUTH###########
#app.config['SECRET_KEY'] = 'secret!'
#socketio = SocketIO(app)

#if __name__ == '__main__':
    #socketio.run(app)

#websocket flasksock->gunicorn

##if __name__ == '__main__':
    #socket.run(app)
@app.route('/api')
def api():
    if request.environ.get('wsgi.websocket'):
        ws = request.environ['wsgi.websocket']
        while True:
            message = ws.wait()
            ws.send(message)
    return



@app.teardown_request
def after_request(exception):
    database_helper.disconnect_db()

@app.route('/')
def index():
    return app.send_static_file('client.html') #render_template? or app.send_static_file


#@socketio.on('message')
#def handle_message(message):
    #print('received message: ' + message)

#@socketio.on('my event')
#def handle_my_custom_event(json):
    #emit('my response', json)
    """""
@app.route('/forgot', methods=('GET', 'POST'))
def forgot():
    error = None
    message = None
    form = ForgotForm()
    if form.validate_on_submit():
        pass
    return render_template('static/forgot.html', form=form, error=error, message=message)
    """""

@app.route('/user/signup', methods = ['POST'])
def sign_up():
    json = request.get_json()
    if "email" in json and "password" in json and "firstname" in json and "familyname" in json and "gender" in json and "city" in json and "country" in json:
        if len(json['email']) < 30 and len(json['password']) > 5 and len(json['password']) < 30 and len(json['firstname']) < 30 and len(json['familyname']) < 30 and len(json['gender']) < 30 and len(json['city']) < 30 and len(json['country']) < 30:
            hashed_value = generate_password_hash(json['password'])
            result = database_helper.create_user(json['email'], hashed_value, json['firstname'], json['familyname'], json['gender'], json['city'], json['country'])
            if result == True:
                return "{}", 201
            else:
                return "{}", 409
        else:
            return "{}", 400
    else:
        return "{}", 400

@app.route('/user/signin', methods = ['POST'])
def sign_in():

    json = request.get_json()
    if "email" in json and "password" in json:
        if len(json['email']) < 30 and len(json['password']) < 30:
            result = database_helper.get_password(json['email'], json['password'])
            if result == True:

                token = binascii.hexlify(os.urandom(20)).decode()
                tokenDic["token"] = token
                tokenDic["email"] = json['email']
                tokenHash = generate_password_hash(token)
                database_helper.send_token(tokenHash)
                #jsonify token
                return jsonify({"token" : tokenHash}), 200
            else:
                return "{}", 404
        else:
            return "{}", 400
    else:
        return "{}", 400

@app.route('/user/changepassword', methods = ['PUT'])
def change_password():

    json = request.get_json()
    if "password" in json and "newpassword" in json:
        if len(json['password']) < 30 and len(json['newpassword']) < 30:
            passwordHash = generate_password_hash(json['newpassword'])
            tokenHash = generate_password_hash(tokenDic["token"])
            result = database_helper.new_password(tokenHash, json['password'], passwordHash)
            if result == True:
                return "{}", 201
            else:
                return "{}", 500
        else:
            print("1")
            return "{}", 400
    else:
        print("2")
        return "{}", 400

@app.route('/user/postmessage', methods = ['PUT'])
def post_message():

    json = request.get_json(force = True)
    if check_password_hash(json['token'], tokenDic['token']):
        tokenHash = generate_password_hash(json["token"])
        result = database_helper.message_help(tokenHash, json['message'], json['email'])
        if result == True:
            return "{}", 201
        else:
            return "{}", 500
    else:
        return "{}", 400 #wrong token


@app.route('/user/getuserdatabytoken', methods = ['GET'])
def get_user_data_by_token():

    newtokenHash = generate_password_hash(tokenHash)
    rows = database_helper.retrieve_data_token(newtokenHash)
    if rows != False:
        result = []
        for row in rows:
            result.append({"email": row[0], "firstname" : row[2], "familyname" : row[3], "gender" : row[4], "city" : row[5], "country" : row[6]})
            return jsonify(result), 200
        else:
            return "{}", 404
    else:
        return "{}", 400


@app.route('/user/getuserdatabyemail/<email>', methods = ['GET'])
def get_user_data_by_email(email):

    newtokenHash = generate_password_hash(tokenHash)
    rows = database_helper.retrieve_data_email(newtokenHash, email)
    if rows != False:
        result = []
        for row in rows:
            result.append({"email": row[0], "firstname" : row[2], "familyname" : row[3], "gender" : row[4], "city" : row[5], "country" : row[6]})
            return jsonify(result), 200
        else:
            return "{}", 404
    else:
        return "{}", 400


@app.route('/user/getusermessagesbytoken', methods = ['GET'])
def get_user_messages_by_token():

    newtokenHash = generate_password_hash(tokenHash)
    result = database_helper.retrieve_messages_token(newtokenHash)
    if result != False:
        return jsonify({"result" : result}), 200
    else:
        return "{}", 404



@app.route('/user/getusermessagesbyemail/<email>', methods = ['GET'])
def get_user_messages_by_email(email):

    newtokenHash = generate_password_hash(tokenHash)
    rows = database_helper.retrieve_messages_email(newtokenHash, email)
    if rows != False:
        return jsonify({"message" : rows}), 200
    else:
        return "{}", 500




@app.route('/user/checkuser', methods = ['POST'])
def check_user():

    json = request.get_json(force = True)
    print(json)
    result = database_helper.find_user_byemail(json)
    if result != False:
        return "{}", 200
    else:
        return "{}", 404

@app.route('/user/deleteallmessages', methods = ['DELETE'])
def deleteallmessages():

    result = database_helper.delete_user_messages(tokenDic["email"])
    if result != False:
        return "{}", 200
    else:
        return "{}", 404