'use strict';

const fs = require("fs");
const path = require("path");
const crypto = require('crypto');

module.exports = class database{
    
    constructor(data){
        if(data == undefined){
            this.data = {
                users: {},
                devices: {},
                keys:{}
            };
        }
        else{
            this.data = data;
        }
    }
    
    loadData(callback){
        fs.readFile(path.join(__dirname,'database','data.json'), 'utf-8', (err, data)=>{
            if(err){
                return callback(err);
            }
            this.data = JSON.parse(data);
            return callback(null, this.data);
        });
    }
    
    getData(){
        return this.data;
    }
    
    saveData(callback){
        fs.writeFile(path.join(__dirname,'database','data.json'), this.data, 'utf-8', (err)=>{
            if(err){
                return callback(err);
            }
            return callback()
        });
    }
    
    createUser(username, password, callback){
        if(this.data.users[username] != undefined){
            return callback(null, 0);
        }
        
        const time = Date.now();
        const hash = crypto.createHmac('sha256', username).update(password).digest('base64').substring(0, 43);
        const id = crypto.createHmac('sha256', username).update(time.toString()).digest('base64').substring(0, 43);
        
        this.data.users[username] = {
            password: hash,
            id: id,
            createTime: time
        };
        this.data.devices[id] = [];
        
        return callback(null, id);
    }
    
    authenicate(username, password, callback){
        if(this.data.users[username] == undefined){
            return callback(null, 0);
        }
        
        const hash = crypto.createHmac('sha256', username).update(password).digest('base64').substring(0, 43);
        const userPasswordHash = this.data.users[username].password;
        
        if(hash == userPasswordHash){
            return callback(null, this.data.users[username].id);
        }
        else{
            return callback(null, 0);
        }
    }
    
    getIdByKey(key, callback){
        return callback(null, this.data.keys[key]);
    }
    
    getDeviceById(id, callback){
        return callback(null, this.data.devices[id]);
    }
    
    getDeviceByKey(key, callback){
        const id = this.data.keys[key];
        if(id == undefined){
            return callback();
        }
        return callback(null, this.data.devices[id]);
    }
    
    getIdByUsername(username){
        return this.data.users[username].id;
    }
    
    changePassword(username, password, callback){
        
        if(this.data.users[username] == undefined){
            return callback(null, 0);
        }
        
        let hash = crypto.createHmac('sha256', username).update(password).digest('base64');
        hash = hash.substring(0, hash.length-1);
        
        this.data.users[username].password = hash;
        
        return callback(null, hash);
    }
    
    createKey(id, callback){
        let key = crypto.createHmac('sha256', Date.now().toString()).update(id).digest('base64').substring(0,43);
        
        this.data.keys[key] = id;
        
        callback(null, key);
    }
    
    getIdByKey(key){
        return this.data.keys[key];
    }
    
    getDeviceListById(id, callback){
        return this.data.devices[id];
    }
    
    addDevice(id, deviceObj, callback){
        const deviceId = deviceObj.id;
        
        this.getDeviceById(id, (err, list)=>{
            if(err){
                return callback(err);
            }
            
            for(let i = 0; i<list.length;i++){
                if(list[i].id == deviceId){
                    this.data.devices[id][i] = deviceObj;
                }
                else{
                    this.data.devices[id].push(deviceObj);
                }
            }
        });
    }
    
    removeDevice(id, deviceId, callback){
        
    }
}