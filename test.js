'use strict';

const devices = require('./devices.js');

let action = {devices:devices};

console.log(action);

action.devices.sync();