


window.onload = function(){
  
  //check if we have a token or not in stoerage, if we already have, we 're logged in. If we're logged in, we want to create
  //a websocket connection. When  you refresh, you should still be signed in
  if(sessionStorage.getItem("token") == null){
    document.getElementById("welcome").innerHTML = document.getElementById("welcomeview").textContent;
  }
  else{
    document.getElementById("welcome").innerHTML = document.getElementById("profileview").textContent;
    socket = io("ws://127.0.0.1:5000");
        socket.on('connect', function() {
          console.log("websocket connection established");
        });
        validateGetMessages();
  }
  
}

window.onunload = () => {
  // Clear the local storage
  locastorage.clear()
}

function validateLogin() {

  let email = document.forms["login"]["username"].value;
  let password = document.forms["login"]["password"].value;

  if (email == "") {
    document.getElementById('log').innerHTML = "Username cannot be empty!";
    return false;
  }

  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email) == false){
    document.getElementById('log').innerHTML = "Bad e-mail format!";
    return false;
  }

  if (password == "") {
    document.getElementById('log').innerHTML = "Password cannot be empty!";
    return false;
  }
  if (password.length<5){
    document.getElementById('log').innerHTML = "Password cannot be shorter than 5 characters.";
    return false;
  }

  let user = {"email" : email, "password" : password}
  let request = new XMLHttpRequest();
  request.open("POST", "/user/signin", true);

  // create web socket
  // websocket, token, email (array, duplicate user-->sign out)
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.onreadystatechange = function(){
    if (this.readyState == 4){
      if (this.status == 200){
        socket = io("ws://127.0.0.1:5000");
        socket.on('connect', function() {
          console.log("websocket connection established");

        });
        
        socket.addEventListener('message', function (event) {
          console.log("WebSocket message received:", event);
          if (event == "signout") {
            validateSignOut();
          
            
          }
        });


        document.getElementById("log").innerHTML = "<h3>Correctly signed in!</h3>";
        let arr = JSON.parse(request.responseText)
        sessionStorage.setItem("email", email);
        sessionStorage.setItem("token", arr.token);
        
        document.getElementById("welcome").innerHTML = document.getElementById("profileview").textContent;
      }else if (request.status == 400){
        document.getElementById("log").innerHTML = "<h3>Bad request!</h3>";
      }else if (request.status == 404){
        document.getElementById("log").innerHTML = "<h3>Wrong username or password!</h3>";
      }
    }
  }

  request.send(JSON.stringify(user));
  validateGetMessages();
}

function validateSignUp() {

  let email = document.forms["signUp"]["username"].value;
  let password = document.forms["signUp"]["password"].value;
  let firstname = document.forms["signUp"]["firstName"].value;
  let familyname = document.forms["signUp"]["familyName"].value;
  let city = document.forms["signUp"]["city"].value;
  let country = document.forms["signUp"]["country"].value;
  let rPassword = document.forms["signUp"]["rPassword"].value;
  let gender = document.forms["signUp"]["gender"].value;

  if (email == "") {
    document.getElementById('log').innerHTML = "Username cannot be empty!";
    return false;
  }

  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email) == false){
    document.getElementById('log').innerHTML = "Bad e-mail format!";
    return false;
  }

  if (firstname == "") {
    document.getElementById('log').innerHTML = "Name cannot be empty!";
    return false;
  }

  if (familyname == "") {
    document.getElementById('log').innerHTML = "Family name cannot be empty!";
    return false;
  }

  if (city == "") {
    document.getElementById('log').innerHTML = "City cannot be empty!";
    return false;
  }

  if (country == "") {
    document.getElementById('log').innerHTML = "Country cannot be empty!";
    return false;
  }


  if (password == "") {
    document.getElementById('log').innerHTML = "Password cannot be empty!";
    return false;
  }
  if (password.length<5){
    document.getElementById('log').innerHTML = "Password cannot be shorter than 5 characters.";
    return false;
  }

  if(password != rPassword){
    document.getElementById('log').innerHTML = "Passwords should be equal!";
    return false;
  }


  let user = {"email" : email, "password" : password, "firstname" : firstname, "familyname" : familyname, "gender" : gender, "city" : city, "country" : country}


  let request = new XMLHttpRequest();
  request.open("POST", "/user/signup", true);

  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.onreadystatechange = function(){
    if (this.readyState == 4){
      if (this.status == 201){
        document.getElementById("log").innerHTML = "<h3>User correctly created!</h3>";
        console.log(user)
      }else if (request.status == 400){
        document.getElementById("log").innerHTML = "<h3>Bad request!</h3>";
      }else if (request.status == 409){
        document.getElementById("log").innerHTML = "<h3>User already exists!</h3>";
      }
    }
  }

  request.send(JSON.stringify(user));
}

//TABS
function openTab(evt, tabName) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}



function pswCheck(){
  let oldPassword = document.forms["changePsw"]["oldPassword"].value;
  let newpassword = document.forms["changePsw"]["password"].value;
  let pswConfirm = document.forms["changePsw"]["rPassword"].value;
  //let tokendiv = document.getElementById("token");
  //let token = tokendiv.textContent;
  

  let dataObject = {"token" : sessionStorage.getItem("token"), "password" : oldPassword, "newpassword" : newpassword}
  console.log(dataObject);

  if(newpassword != pswConfirm || newpassword == "" || pswConfirm ==""){
    document.getElementById('logA').innerHTML = "Passwords should be equal!";
    return false;
  }

  let request = new XMLHttpRequest();
  request.open("PUT", "/user/changepassword", true);

  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.onreadystatechange = function(){
    if (this.readyState == 4){
      if (this.status == 201){
        document.getElementById("logA").innerHTML = "<h3>Password correctly changed!</h3>";
      }else if (request.status == 400){
        document.getElementById("logA").innerHTML = "<h3>Bad request!</h3>";
      }else if (request.status == 500){
        document.getElementById("logA").innerHTML = "<h3>Incorrect old password!</h3>";
      }
    }
  }

  request.send(JSON.stringify(dataObject));

}

function validateSignOut(){
  
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('email');
  document.getElementById("welcome").innerHTML = document.getElementById("welcomeview").textContent;
  
}

function validateSignOutFromChangePassword(){

  socket.disconnect();
  document.getElementById("welcome").innerHTML = document.getElementById("welcomeview").textContent;
  
}

function loadInfos(){
  let result = [];
  let request = new XMLHttpRequest();
  let dataObject = {"token" : sessionStorage.getItem("token")}
  request.open("GET", "/user/getuserdatabytoken", true);


  request.onreadystatechange = function(){
    if (this.readyState == 4){
      if (this.status == 200){
        result = JSON.parse(request.responseText);
        let output = "";
        console.log(result);
        result.forEach(function(c){
            output = output + "<h3>Email: " +c.email+ ", Firstname: " + c.firstname  + ", Familyname: " +c.familyname + ", Gender: " +c.gender + ", City: " +c.city + ", Country: " +c.country + "</h3>"
        });
        document.getElementById("infos").innerHTML = output;
      }else if (request.status == 400){
        document.getElementById("logB").innerHTML = "<h3>Bad request!</h3>";
      }else if (request.status == 404){
        document.getElementById("logB").innerHTML = "<h3>This user has no messages!</h3>";
      }
    }
  }

  request.send();
}

function validateMessage(){

    let content = document.getElementById("messages").value;
    if (content == ""){
      document.getElementById("logA").innerHTML = "<h3>Cannot insert an empty message!</h3>";
      return false;
    }
    if (content.length>150){
      document.getElementById("logA").innerHTML = "<h3>Very big message! Try something < 150 characters!</h3>";
      return false;
    }
    let dataObject = {"token" : sessionStorage.getItem("token"), "message" : content, "email" : sessionStorage.getItem("email")}
    console.log(dataObject);
    let request = new XMLHttpRequest();
    request.open("PUT", "/user/postmessage", true);

    request.onreadystatechange = function(){
      if (this.readyState == 4){
        if (this.status == 201){
          document.getElementById("logB").innerHTML = "<h3>Message posted!</h3>";
        }else if (request.status == 400){
          document.getElementById("logB").innerHTML = "<h3>Bad request!</h3>";
        }else if (request.status == 500){
          console.log(dataObject);
          document.getElementById("logB").innerHTML = "<h3>Something bad happened!</h3>";
        }
      }
    }
    request.send(JSON.stringify(dataObject));

    document.getElementById('messagesWall').innerHTML += content + " : " + sessionStorage.getItem("email");
}

function validateGetMessages(){


  let request = new XMLHttpRequest();
  request.open("GET", "/user/getusermessagesbytoken", true);
  request.onreadystatechange = function(){
    if (this.readyState == 4){
      if (this.status == 200){
        result = JSON.parse(request.responseText)["result"];
        for(var i=0; i<result.length; i++){
          document.getElementById("messagesWall").innerHTML += "<hr>" + "Message:" + result[i][0] + "<br>" + "Writer:" + result[i][1] + "<br>";
          console.log("Message:" + result[i][0]);
        }
  
      }else if (request.status == 400){
        document.getElementById("logB").innerHTML = "<h3>Bad request!</h3>";
      }else if (request.status == 404){
        document.getElementById("logB").innerHTML = "<h3>This user has no messages!</h3>";
      }
    }
  }
  request.send();
}

// BROWSE FUNCTIONS
function validateGetUserDetails(){
  let targetDiv=document.getElementById("result");
  let email = document.getElementById("insertUser").value;
  if(email == '' || email.length > 30){
    document.getElementById("logC").innerHTML = "<h3>Insert a valid email!</h3>"
    return false;
  }
  console.log(email);
  let request = new XMLHttpRequest();

  request.open("POST", "/user/checkuser", true);
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.onreadystatechange = function(){
    if (this.readyState == 4){
      if (this.status == 200){
        targetDiv.style.display = "block";
      }else if (request.status == 404){
        document.getElementById("logC").innerHTML = "<h3>User not found!</h3>";
      }
    }
  }

  request.send(JSON.stringify(email));


}

function loadInfosBrowse(){
  let result = [];
  let email = document.getElementById("insertUser").value;
  let request = new XMLHttpRequest(); //through url or header
  request.open("GET", "/user/getuserdatabyemail/" + email, true);

  request.onreadystatechange = function(){
    if (this.readyState == 4){
      if (this.status == 200){
        result = JSON.parse(request.responseText);
        let output = "";
        console.log(result);
        result.forEach(function(c){
            output = output + "<h3>Email: " +c.email+ ", Firstname: " + c.firstname  + ", Familyname: " +c.familyname + ", Gender: " +c.gender + ", City: " +c.city + ", Country: " +c.country + "</h3>"
        });
        document.getElementById("infosBrowse").innerHTML = output;
      }else if (request.status == 404){
        document.getElementById("logC").innerHTML = "<h3>User not found!</h3>";
      }else if (request.status == 400){
        document.getElementById("logC").innerHTML = "<h3>Bad request!</h3>";
      }
    }
  }

  request.send();

}


function validatePostMessageBrowse(){

  let email = document.getElementById("insertUser").value;
  let content = document.getElementById("messagesBrowse").value;
  if (content == ""){
    document.getElementById("logA").innerHTML = "<h3>Cannot insert an empty message!</h3>";
    return false;
  }
  if (content.length>150){
    document.getElementById("logA").innerHTML = "<h3>Very big message! Try something < 150 characters!</h3>";
    return false;
  }
  let dataObject = {"token" : sessionStorage.getItem("token"), "message" : content, "email" : email}
  console.log(dataObject);
  let request = new XMLHttpRequest();
  request.open("PUT", "/user/postmessage", true);

  request.onreadystatechange = function(){
    if (this.readyState == 4){
      if (this.status == 201){
        document.getElementById("logC").innerHTML = "<h3>Message posted!</h3>";
      }else if (request.status == 400){
        document.getElementById("logC").innerHTML = "<h3>Bad request!</h3>";
      }else if (request.status == 500){
        console.log(dataObject);
        document.getElementById("logC").innerHTML = "<h3>Something bad happened!</h3>";
      }
    }
  }
  request.send(JSON.stringify(dataObject));

  document.getElementById('messagesWallBrowse').innerHTML += content + " : " + sessionStorage.getItem("email");
}


function validateGetMessagesBrowse(){
  let request = new XMLHttpRequest();
  let email = document.getElementById("insertUser").value;

  request.open("GET", "/user/getusermessagesbyemail/" + email , true);
  request.onreadystatechange = function(){
    if (this.readyState == 4){
      if (this.status == 200){
        result = JSON.parse(request.responseText)["message"];
        console.log("result");
        for(var i=0; i<result.length; i++){
          document.getElementById("messagesWallBrowse").innerHTML += "<hr>" + "Message:" + result[i][0] + "<br>" + "Writer:" + result[i][1] + "<br>";
          console.log("Message:" + result[i][0]);
        }
      } else if (request.status == 400){
        document.getElementById("logB").innerHTML = "<h3>Bad request!</h3>";
      }else if (request.status == 404){
        document.getElementById("logB").innerHTML = "<h3>User not found!</h3>";
      }
    }
  }
  request.send();
}

function deleteMessages(){
  let request = new XMLHttpRequest();

  request.open("DELETE", "/user/deleteallmessages", true);
  request.onreadystatechange = function(){
    if (this.readyState == 4){
      if (this.status == 200){
        document.getElementById("messagesWall").innerHTML ="";
        document.getElementById("logDelete").innerHTML="";
      }else if (request.status == 400){
        document.getElementById("logB").innerHTML = "<h3>Bad request!</h3>";
      }else if (request.status == 404){
        document.getElementById("logB").innerHTML = "<h3>User not found!</h3>";
      }
    }
  }
  request.send();
}

function alertDelete(){
  document.getElementById("logDelete").innerHTML = "<h3>Are you sure to delete all your messages?</h3>" + "<button class= 'confirm' onclick = 'deleteMessages();' >Confirm</button>";
}

