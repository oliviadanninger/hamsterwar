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

//HÄMTA ALLA MATCHOBJECT
router.route('/').get(function (req, res) {
    db.getDb().collection('matches').find({}).toArray(function (err, result) {
        if (err) {
            return res.status(500).send(JSON.stringify({
                error: 'Internal server error',
                status: 500
            }));
        }
            return res.json(result)
        })
});

//HÄMTA ETT MATCHOBJECT
router.route('/:id').get(function (req, res) {
    let idQuery = getQuery(req);
    if (idQuery) {
        db.getDb().collection('matches').findOne(idQuery, function (err, result) {
            if (err) {
                return res.status(500).send(JSON.stringify({
                    error: 'Internal server error',
                    status: 500
                }));
            }

            if (!result) {
                return res.status(404).send(JSON.stringify({ error: 'not found' }));
            }

            return res.json(result);
        })
    }
    else {
        return res.status(400).send({ error: 'Bad request' })
    }
});

//SKAPA ETT MATCHOBJECT
router.route('/').post(function (req, res) {
    const { winnerId, loserId } = req.body;

    let matchObj = {
        winnerId: winnerId,
        loserId: loserId
    };

    db.getDb().collection('matches').insertOne(matchObj, function (err, result) {
        if (err) {
            return res.status(500).send(JSON.stringify({
                error: 'Internal server error',
                status: 500
            }));
        }

        return res.json(result);
    })
});

//TA BORT ETT MATCHOBJECT
router.route('/:id').delete(function (req, res) {
    let idQuery= getQuery(req);
    if (idQuery) {
        db.getDb().collection('matches').deleteOne(idQuery, function (err, result) {
            if (err) {
                return res.status(500).send(JSON.stringify({
                    error: 'Internal server error',
                    status: 500
                }));
            }

            if (result.deletedCount == 0) {
                return res.status(404).send(JSON.stringify({ error: 'not found' }));
            }

            return res.status(200).send(JSON.stringify({ message: 'Success' }));
        })
    }
    else {
        return res.status(400).send(JSON.stringify({ error: 'Bad request' }));
    }
});


module.exports = router;