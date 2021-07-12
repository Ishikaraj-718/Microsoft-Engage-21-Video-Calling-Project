var inputmsg= document.getElementById("inputmsg").value


function updateInputmsg(val){
     inputmsg= val;
      console.log(input);
      
    }

   

const url="/"+ROOM_ID1+"chat/chat";
console.log(url);
async function fetchData(){
  const response = await fetch(url);
  const data = await response.json();
  for(var i=0;i<data.length;i++){
    console.log(data[i].name)
    console.log(data[i].text);
    $("#msg").append(`<div>${data[i].name}: </div><div>${data[i].text}</div>`);
  }
  console.log(data);
}

fetchData();