const express = require('express');
const app = express();
const server = require('http').createServer(app);
const cors = require('cors');

app.use(express.static(__dirname))
app.use(cors());
app.get('/', (req, res) => {
	res.sendFile(req.url);
});

server.listen(8080);