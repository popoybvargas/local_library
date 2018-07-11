const express = require( 'express' );
const router = express.Router();

/* GET home page. */
router.get( '/', ( req, res, next ) =>
{
    // res.redirect( '/catalog' );
    res.render( 'index', { title: 'Team zV' });
});

module.exports = router;