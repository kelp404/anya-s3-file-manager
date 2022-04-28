const http = require('http');
const express = require('express');

const app = express();
const server = http.createServer(app);

module.exports = {app, server};
