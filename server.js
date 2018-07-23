'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const database = require('./database.js');
const devices = require('./devices.js');

let app = express();

app.use(bodyParser.json());

const data = {
    users:{
        test:{
            password: 'iM0hCLU0fZc885zfkFPX3UJwSHbYyam9ji0WglnT3fc',
            id: 'cFdJLZevZmiHL1sN0eUjD55P/RippI9dtDB+gKxBSpA',
            createTime: 1532302464454
        }
    },
    devices: { 'cFdJLZevZmiHL1sN0eUjD55P/RippI9dtDB+gKxBSpA': [
        {
            'type': 'light'
        }
        ] },
    keys: { '4amMCkX3HL1Zc5najbII2vkHhePfOaCAFVgnEhg/mHI': 'cFdJLZevZmiHL1sN0eUjD55P/RippI9dtDB+gKxBSpA' }
}

let db = new database(data);

app.get('/', (request, response)=>{
    response.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/signup', (request, response)=>{
    response.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.post('/signup', (request, response)=>{
    console.log("post to /signup");
    request.accepts('application/json');
    let username = request.body.username;
    let password = request.body.password;
    
    db.createUser(username, password, (err, id)=>{
        if(err){
            response.status(500).send("Something went wrong");
        }
        else if(id == 0){
            response.status(200).send({auth_key:0});
        }
        else{
            db.createKey(id, (err, key)=>{
                if(err){
                    response.status(500).send("Something went wrong");
                }
                else{
                    console.log(db.getData());
                    response.status(200).send({auth_key:key});
                }
            });
        }
        
    });
    
});

app.get('/signin', (request, response)=>{
    response.sendFile(path.join(__dirname, 'public', 'signin.html'));
});

app.post('/signin', (request, response)=>{
    console.log("post to /signin");
    request.accepts('application/json');
    const username = request.body.username;
    const password = request.body.password;
    
    db.authenicate(username, password, (err, id)=>{
        if(err){
            response.status(500).send("Something went wrong");
        }
        else if(id == 0){
            response.status(200).send({auth_key:0});
        }
        else{
            db.createKey(id, (err, key)=>{
                console.log('key created')
                if(err){
                    response.status(500).send("Something went wrong");
                }
                else{
                    response.status(200).send({auth_key:key});
                }
            });
        }
        
    });
});

app.get('/smarthome',(request, response)=>{
    console.log('get /smarthome');
    response.sendFile(path.join(__dirname, 'public', 'smarthome.html'));
});

app.post('/smarthome',(request, response)=>{
    const key = request.headers.authorization;
    
    db.getDeviceByKey(key, (err, devices)=>{
        if(err){
            response.status(500).send("Something went wrong");
        }
        else if(devices == undefined){
            response.status(401).send("401");
        }
        else{
            response.status(200).send(devices);
        }
    });
});

app.get('/oauth', (request, response)=>{
    console.log('get /oauth');
    const client_id = request.query.client_id;
    const redirect_uri = request.query.redirect_uri;
    const state = request.query.state;
    const response_type = request.query.response_type;
    
    if(client_id != 'google' || redirect_uri != 'https://oauth-redirect.googleusercontent.com/r/home-test-cd56a'){
        response.status(403).send("Invalid Oauth2 request");
    }
    
    response.sendFile(path.join(__dirname, 'public', 'auth.html'));
});

app.get('/fulfillment', (request, response)=>{
    console.log('get /fulfillment');
    const key = request.headers.authorization;
    console.log('fulfilling something!')
    
    response.send("working on it");
});

app.post('/fulfillment', (request, response)=>{
    console.log('post /fulfillment');
    const key = request.headers.authorization;
    
    db.getIdByKey(key, (err, id)=>{
        if(err){
            request.status(500).send("An Unknow Error Has Occured");
        }
        else if(id == undefined){
            request.status(401).send("Invalid Key");
        }
        else{
            const intent = request.body.inputs[0].intent;
            
            data = {
                requestId: request.body.requestId,
                payload: {}
            };
            
            switch (intent){
                case "action.devices.SYNC":
                    devices.sync(request.body.inputs, (err, payload)=>{
                        if(err){
                            //handle error
                        }
                        
                    });
                    break;
                case "action.devices.QUERY":
                    
                    break;
                case "action.devices.EXECUTE":
                    
                    break;
                case "action.devices.DISCONNECT":
                    
                    break;
                default:
                    data.payload.errorCode = "notSupported";
                    data.payload.debugString = "action not yet supported"
                    request.status(200).send(data);
                    break;
            }
        }
    });
    
    console.log(request.body);
    
    let res = request.body.requestId;
    
    response.send("working on it");
});

app.listen(process.env.PORT, (err)=>{
    if(err){
        console.error(err);
    }
    else{
        console.log(`started on port: ${process.env.PORT}`);
    }
});