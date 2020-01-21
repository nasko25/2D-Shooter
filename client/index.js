var socket = new WebSocket("ws://localhost:8080/");

socket.onmessage = function(data) {
  var message = JSON.parse(data.data);
  if (message[0] === "stats") {
    if (message[1] === "recent_games") {
      document.getElementById("recent_games").innerHTML = "";
      message[2].forEach((element) =>{
        document.getElementById("recent_games").innerHTML += "<li> Game ID: " + element.game_id + "<br> Winner: " + element.winner + "</li>";
      });
    }
    else if (message[1] === "recent_wins") {
      document.getElementById("recent_wins").innerHTML = "";
      message[2].forEach((element) =>{
        document.getElementById("recent_wins").innerHTML += "<li> The winner was: " + element.winner + " and he won on " + element.time.split("T")[0] + " at " + element.time.split("T")[1].split("Z")[0].split(".")[0]+ "</li>";
      });
    }
    else if (message[1] === "games_atm") {
      document.getElementById("currently_online").innerHTML = "";
      document.getElementById("currently_online").innerHTML += "<li> " + message[2] + "</li>";
    }
  }
}
