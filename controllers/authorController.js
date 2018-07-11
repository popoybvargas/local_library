const Author = require( '../models/author' );

// display list of all Authors
exports.author_list = ( req, res ) =>
{
    res.send( 'NOT IMPLEMENTED: Author list' );
};

// display detail page for a specific Author
exports.author_detail = ( req, res ) =>
{
    res.send( `NOT IMPLEMENTED: Author deatail: ${req.params.id}` );
};

// display Author create form on GET
exports.author_create_get = ( req, res ) =>
{
    res.send( 'NOT IMPLEMENTED: Author create GET' );
};

// handle Author create on POST
exports.author_create_post = ( req, res ) =>
{
    res.send( 'NOT IMPLEMENTED: Author create POST' );
};

// display Author delete form on GET
exports.author_delete_get = ( req, res ) =>
{
    res.send( 'NOT IMPLEMENTED: Author delete GET' );
};

// handle Author delete on POST
exports.author_delete_post = ( req, res ) =>
{
    res.send( 'NOT IMPLEMENTED: Author delete POST' );
};

// display Author update form on GET
exports.author_update_get = ( req, res ) =>
{
    res.send( 'NOT IMPLEMENTED: Author update GET' );
};

// handle Author update POST
exports.author_update_post = ( req, res ) =>
{
    res.send( 'NOT IMPLEMENTED: Author update POST' );
};