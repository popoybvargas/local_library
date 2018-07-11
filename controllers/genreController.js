const Genre = require( '../models/genre' );

// display list of all Genres
exports.genre_list = ( req, res ) =>
{
    res.send( 'NOT IMPLEMENTED: Genre list' );
};

// display detail page for a specific Genre
exports.genre_detail = ( req, res ) =>
{
    res.send( `NOT IMPLEMENTED: Genre detail: ${req.params.id}` );
};

// display Genre create form on GET
exports.genre_create_get = ( req, res ) =>
{
    res.send( 'NOT IMPLEMENTED: Genre create GET' );
};

// handle Genre create on POST
exports.genre_create_post = ( req, res ) =>
{
    res.send( 'NOT IMPLEMENTED: Genre create POST' );
};

// display Genre delete form on GET
exports.genre_delete_get = ( req, res ) =>
{
    res.send( 'NOT IMPLEMENTED: Genre delete GET' );
};

// handle Genre delete on POST
exports.genre_delete_post = ( req, res ) =>
{
    res.send( 'NOT IMPLEMENTED: Genre delete POST' );
};

// display Genre update form on GET
exports.genre_update_get = ( req, res ) =>
{
    res.send( 'NOT IMPLEMENTED: Genre update GET' );
};

// display Genre update on POST
exports.genre_update_post = ( req, res ) =>
{
    res.send( 'NOT IMPLEMENTED: Genre update POST' );
};