var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var piblaster = require('pi-blaster.js');

//front right
piblaster.setPwm(17, 0.5 );
piblaster.setPwm(27, 0.5 );
piblaster.setPwm(22, 0.5 );

//front left
piblaster.setPwm(18, 0.5 );
piblaster.setPwm(23, 0.5 );
piblaster.setPwm(24, 0.5 );




var firebase = require("firebase");
firebase.initializeApp({
  serviceAccount: "./HyperBot-c52ccadf3e05.json",
  databaseURL: "https://hyperbot-d6494.firebaseio.com"
});

var controlRef = firebase.database().ref().child('control');
controlRef.on('value', function(snap){
  console.log(snap.val());
})

var goProRef = firebase.database().ref().child('goProHyper');
goProRef.on('value', function(snap){
    var snap = snap.val();
    for(var key in snap){
        if(!snap[key].isDone){
            //time, dist, interval
       console.log('recieved goProTL')
        inProgress(goProRef, key);
           var numMovements = (snap[key].time * 60) / snap[key].interval;
           var lengthMovements = snap[key].dist/numMovements;
           var interval = snap[key].interval * 1000;

           var move = function(){
               console.log(numMovements)
               numMovements--;  
               if(numMovements < 0){
               clearInterval(this);
               goProRef.child(key).update({isDone: true})
            }
           }
            
           setInterval(move, interval);
         
        }        
    }    
})
var iPhoneRef = firebase.database().ref().child('iPhoneHyper');
iPhoneRef.on('value', function(snap){
    var snap = snap.val();    
   
    for(var key in snap){
        if(!snap[key].isDone){
            //iPhoneTime iPhoneDist iPhoneCurve
            console.log('recieved iPhoneTL')
        setTimeout(function(){
        inProgress(iPhoneRef, key);
           var numMovements = (snap[key].iPhoneTime * 60);
           var lengthMovements = snap[key].iPhoneDist/numMovements;

           var move = function(){
               console.log(numMovements)
               numMovements--;  
               if(numMovements < 0){
               clearInterval(this);
               iPhoneRef.child(key).update({isDone: true})
            }
           }
           setInterval(move, 1000);
            }, 10000);        
        }        
    }  
})

function inProgress(ref, key){
    return ref.child(key).update({isDone: 'inProgress'})
}

app.get('/', function(req, res, next){
    res.send('recieved socket');
});

io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('disconnect', function(){
        console.log('user disconnected');
    })
    socket.on('chat message', function(msg){
        console.log(msg)
        io.emit('chat message', msg);
    })
})

http.listen(3030, function(){
    console.log('listening on *:3030');
});
