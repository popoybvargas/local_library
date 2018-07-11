const Book = require( '../models/book' );

exports.index = ( req, res ) =>
{
    res.send( 'NOT IMPLEMENTED: Site Home Page' );
};

// display list of all Books
exports.book_list = ( req, res ) =>
{
    res.send( 'NOT IMPLEMENTED: Book list' );
};

// display detail page for a specific Book
exports.book_detail = ( req, res ) =>
{
    res.send( `NOT IMPLEMENTED: Book detail: ${req.params.id}` );
};

// display Book create form on GET
exports.book_create_get = ( req, res ) =>
{
    res.send( 'NOT IMPLEMENTED: Book create GET' );
};

// handle Book create on POST
exports.book_create_post = ( req, res ) =>
{
    res.send( 'NOT IMPLEMENTED: Book create POST' );
};

// display Book delete form on GET
exports.book_delete_get = ( req, res ) =>
{
    res.send( 'NOT IMPLEMENTED: Book delete GET' );
};

// handle Book delete on POST
exports.book_delete_post = ( req, res ) =>
{
    res.send( 'NOT IMPLEMENTED: Book delete POST' );
};

// display Book update form on GET
exports.book_update_get = ( req, res ) =>
{
    res.send( 'NOT IMPLEMENTED: Book update GET' );
};

// handle Book update on POST
exports.book_update_post = ( req, res ) =>
{
    res.send( 'NOT IMPLEMENTED: Book update POST' );
};