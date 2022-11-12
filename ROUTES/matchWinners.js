const express = require('express');
const router = express.Router();
const db = require('../db/connect');
const ObjectId = require('mongodb').ObjectId;

function getQuery(req) {
    let idQuery;
    try {
        idQuery = {
            _id: ObjectId(req.params.id)
        };
    }
    catch (err) {
        //Om det catchas ett fel här så är id:t i fel format. 
        //Men detta hanteras i funktionen som påkallat getQuery() (om inget returneras). 
    };
    return idQuery
};

//Array med matchobjekt för alla matcher som hamstern med id har vunnit. 
//Statuskod 404 om id inte matchar en hamster som vunnit någon match.
router.route('/:id').get(function (req, res) {
    let idQuery = getQuery(req);
    if (idQuery) {

        let winnerQuery = { winnerId: { $eq: req.params.id } }

        db.getDb().collection('matches').find(winnerQuery).toArray(function (err, result) {
            if (err) {
                return res.status(500).send(JSON.stringify({
                    error: 'Internal server error',
                    status: 500
                }));
            }
            
            if (!result || result.length == 0) {
                return res.status(404).send({ error: 'not found', status: 404 })
            }
            
            return res.json(result);
        })
    }
    else {
        return res.status(400).send({ error: 'Bad request', status: 400 })
    }
});


module.exports = router;

