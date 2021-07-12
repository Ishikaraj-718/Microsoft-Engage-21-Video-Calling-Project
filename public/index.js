var options = {
    weekday:"long",
    day:"numeric",
    month: "long"
};

let today = new Date().toLocaleDateString("en-US",options);

document.getElementById('Date').innerHTML=today;
var get_id=document.getElementById("get_id");
function set_input(id){
  document.getElementById("input").value=id;
  
}

function updateInput(val){
const input= document.getElementById("input").value=val;
  console.log(input);
  var bt=document.getElementById("submit");
    bt.addEventListener('click',()=>{
   document.getElementById("form_id").setAttribute("action", "/"+input);
  })
}

function onSignIn(googleUser) {
  var id_token = googleUser.getAuthResponse().id_token;
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/');
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onload = function() {

};
xhr.send(JSON.stringify({token:id_token}));
  
}
