const BookInstance = require( '../models/bookinstance' );

// display list of all BookInstances
exports.bookinstance_list = ( req, res ) =>
{
    res.send( 'NOT IMPLEMENTED: BookInstance list' );
};

// display detail page for a specific BookInstance
exports.bookinstance_detail = ( req, res ) =>
{
    res.send( `NOT IMPLEMENTED: BookInstance detail: ${req.params.id}` );
};

// display BookInstance create form on GET
exports.bookinstance_create_get = ( req, res ) =>
{
    res.send( 'NOT IMPLEMENTED: BookInstance create GET' );
};

// handle BookInstance create on POST
exports.bookinstance_create_post = ( req, res ) =>
{
    res.send( 'NOT IMPLEMENTED: BookInstance create POST' );
};

// display BookInstance delete form on GET
exports.bookinstance_delete_get = ( req, res ) =>
{
    res.send( 'NOT IMPLEMENTED: BookInstance delete GET' );
};

// handle BookInstance delete on POST
exports.bookinstance_delete_post = ( req, res ) =>
{
    res.send( 'NOT IMPLEMENTED: BookInstance delete POST' );
};

// display BookInstance update form on GET
exports.bookinstance_update_get = ( req, res ) =>
{
    res.send( 'NOT IMPLEMENTED: BookInstance update GET' );
};

// handle BookInstance update on POST
exports.bookinstance_update_post = ( req, res ) =>
{
    res.send( 'NOT IMPLEMENTED: BookInstance update POST' );
};