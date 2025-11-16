const express = require('express');
const bodyParser = require('body-parser');
const create = require('./functions/createMessage');
const get = require('./functions/getMessage');
const del = require('./functions/deleteMessage');

const app = express();
app.use(bodyParser.json());

const cors = require('cors');
app.use(cors());

app.post('/create', create.handler);
app.get('/message/:id', get.handler);
app.delete('/message/:id', del.handler);

app.listen(3000, () => console.log('Server running on http://localhost:3000'));