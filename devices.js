'use strict';

function sync(inputs, callback){
    if(inputs[0].intent != 'action.devices.SYNC'){
        return callback(new Error("Incorrect intent used"));
    }
    
}

function query(inputs, callback){
    console.log("query");
}

function execute(inputs, callback){
    console.log("execute");
} 

function disconnect(inputs, callback){
    console.log("disconnect");
}

exports.sync = sync;
exports.query = query;
exports.execute = execute;
exports.disconnect = disconnect;