const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config({ path: "./config.env" });
const port = process.env.PORT || 4444;

app.use(cors());
app.use(express.json());

const hamstersRoute = require('./ROUTES/hamsters');
const matchesRoute = require('./ROUTES/matches');
const matchWinnersRoute = require('./ROUTES/matchWinners');
const winnersRoute = require('./ROUTES/winners');
const losersRoute = require('./ROUTES/losers');
app.use('/hamsters', hamstersRoute);
app.use('/matches', matchesRoute);
app.use('/matchWinners', matchWinnersRoute);
app.use('/winners', winnersRoute);
app.use('/losers', losersRoute);



const db = require('./db/connect');

app.listen(port, () => {
    db.connectToServer(function (err) {
        if (err) {
            console.error(err);
        }
    })
    console.log('Server is running on ' + port);
})