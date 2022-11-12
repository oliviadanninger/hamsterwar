const express = require('express');
const router = express.Router();
const db = require('../db/connect');

//En array med hamsterobjekt för de 5 som förlorat flest matcher
router.route('/').get(function (req, res) {
    db.getDb().collection('hamsters').aggregate([
        // Sortera docs efter antal vinster
        {$sort: {wins: 1}}, //resultaten sorteras i stigande ordning
        // Ta de första 5
        {$limit: 5}
    ]).toArray(function (err, result) { //gör om till array
        if (err) {
            return res.status(500).send(JSON.stringify({
                error: 'Internal server error',
                status: 500
            }));
        }
        
        if (result.length == 0) {
            return res.status(404).send(JSON.stringify({
                error: 'not found'
            }));
        }
        
        return res.json(result)
    });
});

module.exports = router;