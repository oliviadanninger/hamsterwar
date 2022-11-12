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
    } catch (err) {
        //Om det catchas ett fel här så är id:t i fel format. 
        //Men detta hanteras i funktionen som påkallat getQuery() (om inget returneras). 
    };
    return idQuery
};

// HÄMTA ALLA HAMSTRAR
router.route('/').get(function (req, res) {
     try{
    db.getDb().collection('hamsters') //connectar
        .find({}) //hämtar collectionen
        .toArray(function (err, result) { //gör om till array
            if (err) {
                return res.status(500).send(JSON.stringify({
                    error: 'Internal server error',
                    status: 500
                }));
            }
            if (result.length == 0) {
                return res.status(404).send(JSON.stringify({
                    error: 'not found',
                    status: 404
                }));
            }

            return res.json(result)
        })
    }
    catch(err){
        throw err
    }
});

// HÄMTA EN RANDOM HAMSTER
router.route('/random').get(function (req, res) {
    db.getDb().collection('hamsters').aggregate([{
        $sample: {
            size: 1
        }
    }]).next(function (err, result) { //next tar första objektet i arrayen
        if (err) {
            return res.status(500).send(JSON.stringify({
                error: 'Internal server error',
                status: 500
            }));
        }

        if (!result) {
            return res.status(404).send(JSON.stringify({
                error: 'not found',
                status: 404
            }));
        }

        return res.json(result)
    });
});

// HÄMTA EN HAMSTER
router.route('/:id').get(function (req, res) {
    let idQuery = getQuery(req);
    if (idQuery) {
        db.getDb().collection('hamsters').findOne(idQuery, function (err, result) {

            if (err) {
                return res.status(500).send(JSON.stringify({
                    error: 'Internal server error',
                    status: 500
                }));
            }

            if (!result) {
                return res.status(404).send(JSON.stringify({
                    error: 'not found',
                    status: 404
                }));
            }

            return res.json(result);
        })
    } else {
        return res.status(400).send(JSON.stringify({
            error: 'Bad request',
            status: 400
        }));
    }
});

// SKAPA EN HAMSTER
router.route('/').post(function (req, res) {
    console.log("POST")
    const {
        name,
        age,
        favFood,
        loves,
        imgName
    } = req.body;

    let newHamster = {
        name: name,
        age: age,
        favFood: favFood,
        loves: loves,
        imgName: imgName,
        wins: 0,
        defeats: 0,
        games: 0
    };

    db.getDb().collection('hamsters').insertOne(newHamster, function (err, result) {
        if (err) {
            return res.status(500).send(JSON.stringify({
                error: 'Internal server error',
                status: 500
            }));
        }
        console.log(result)
        res.json(result);
    })
});

// UPPDATERA EN HAMSTER
router.route('/:id').put(function (req, res) {

    let idQuery = getQuery(req);
    if (idQuery) {
        let updateObj = {
            $set: req.body
        };

        db.getDb().collection('hamsters').findOneAndUpdate(idQuery, updateObj, function (err, result) {
            if (err) {
                return res.status(500).send(JSON.stringify({
                    error: 'Internal server error',
                    status: 500
                }));
            }
            
            if (!result.value) {
                return res.status(404).send(JSON.stringify({
                    error: 'not found',
                    status: 404
                }));
            }
            return res.status(200).send(JSON.stringify("Success"));
        })
    } else {
        return res.status(400).send(JSON.stringify({
            error: 'Bad request',
            status: 400
        }));
    }
});

// DELETE HAMSTER
router.route('/:id').delete(function (req, res) {
    let idQuery = getQuery(req);
    if (idQuery) {
        let findAllMatchesQuery = { $or : [{ winnerId : { $eq: req.params.id }},
            { loserId : { $eq: req.params.id }}]
        }
         //Tar bort alla matcher som den bortagna hamstern spelat.
         db.getDb().collection('matches').deleteMany(findAllMatchesQuery ,function (err, result) {
            if (err) {
                return res.status(500).send(JSON.stringify({
                    error: 'Internal server error',
                    status: 500
                }));
            }            
        })
        db.getDb().collection('hamsters').deleteOne(idQuery, function (err, result) {
            if (err) {
                return res.status(500).send(JSON.stringify({
                    error: 'Internal server error',
                    status: 500
                }));
            }

            if (result.deletedCount == 0) {
                return res.status(404).send(JSON.stringify({
                    error: 'not found',
                    status: 404
                }));
            }
            return res.status(200).send(JSON.stringify({  // Crashar i frontenden utan payload
                status: 200
            }));
        })
    }
    else {
        return res.status(400).send({ error: 'Bad request', status: 400 })
    }
});

module.exports = router;

