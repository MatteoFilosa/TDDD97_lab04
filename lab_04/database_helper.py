import sqlite3
from flask import g
from werkzeug.security import generate_password_hash, check_password_hash

DATABASE_URI = 'database.db'

loggedInUser = {
    "token": "",
    "email": ""
 }

def token_to_email(token):
    return loggedInUser["email"]

def send_token(token):
    loggedInUser["token"] = token


def get_db():
    db = getattr(g, 'db', None)
    if db is None:
        db = g.db = sqlite3.connect(DATABASE_URI)

    return db

def disconnect_db():
    db = getattr(g, 'db', None)

    if db is not None:
        db.close
        g.db = None

def create_user(email, password, firstname, familyname, gender, city, country):
    try:
        hashed_value = generate_password_hash(password)
        get_db().execute("insert into user values(?,?,?,?,?,?,?)", [email, hashed_value, firstname, familyname, gender, city, country])

        get_db().commit()
        return True
    except:  #FIX Exception

        return False



def get_password(email, password):


    loggedInUser["email"] = email
    cursor = get_db().execute("select password from user where user.email = ?", [email])
    stored_password = cursor.fetchall()
    for row in stored_password:
        stored_password = row[0]
        break
    result = check_password_hash(stored_password, password)
    cursor.close()
    print(stored_password)
    if result:
        return True
    else:
        return False

def find_user_byemail(email):

    cursor = get_db().execute("select * from user where email = ?", [email])
    rows = cursor.fetchall()
    cursor.close()
    print(rows)
    if rows:
        return True
    else:
        return False



def new_password(token, password, newpassword):

    try:
        cursor = get_db().execute("select password from user where user.email = ?", [loggedInUser["email"]])
        stored_password = cursor.fetchall()
        for row in stored_password:
            stored_password = row[0]
            break
        result = check_password_hash(stored_password, password)
        print(stored_password)
        print(password)
        if result:
            get_db().execute("update user set password = ? where user.email = ?", [newpassword, loggedInUser["email"]])
            get_db().commit()
            return True
        else:
            return False
    except:
        return False



def message_help(token, message, email):

    cursor = get_db().execute("select * from user where email = ?", [email])
    rows = cursor.fetchall()
    cursor.close()
    if rows: #user exists
        get_db().execute("insert into messages values(?, ?)", [message, email])
        get_db().commit()
        print(message)
        return True
    else:
        return False

def retrieve_data_token(token):

    email = token_to_email(token)
    cursor = get_db().execute("select * from user where user.email = ?", [email])
    rows = cursor.fetchall()
    cursor.close()
    print(rows)
    if rows:
        return rows
    else:
        return False

def retrieve_data_email(token, email):
    try:
        cursor = get_db().execute("select * from user where email = ?", [email])
        rows = cursor.fetchall()
        cursor.close()
        print(rows)
        return rows
    except sqlite3.DatabaseError as err:
        print(err)
        return False

def retrieve_messages_token(token):

    email = token_to_email(token)
    cursor = get_db().execute("select * from messages where email = ?", [email])
    rows = cursor.fetchall()
    cursor.close()
    print(rows)
    if rows:
        return rows
    else:
        return False

def retrieve_messages_email(token, email):


    cursor = get_db().execute("select * from messages where email = ?", [email])
    rows = cursor.fetchall()
    cursor.close()
    print(rows)
    if rows:
        return rows
    else:
        return False
