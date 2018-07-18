const Book = require( '../models/book' );
const BookInstance = require( '../models/bookinstance' );
const { body, validationResult } = require( 'express-validator/check' );
const { sanitizeBody } = require( 'express-validator/filter' );
const async = require( 'async' );

// display list of all BookInstances
exports.bookinstance_list = ( req, res, next ) =>
{
    BookInstance.find()
        .populate( 'book' )
        .exec(( err, list_bookinstances ) =>
        {
            if ( err ) return next( err );
            // successful, so render
            res.render( 'bookinstance/bookinstance_list', { title: 'Book Instance List', bookinstance_list: list_bookinstances });
        });
};

// display detail page for a specific BookInstance
exports.bookinstance_detail = ( req, res, next ) =>
{
    BookInstance.findById( req.params.id )
        .populate( 'book' )
        .exec(( err, bookinstance ) =>
        {
            if ( err ) return next( err );
            if ( bookinstance == null ) // no results
            {
                const err = new Error( 'Book copy not found' );
                err.status = 404;
                return next( err );
            }
            // successful, so render
            res.render( 'bookinstance/bookinstance_detail', { title: 'Book:', bookinstance });
        });
};

// display BookInstance create form on GET
exports.bookinstance_create_get = ( req, res, next ) =>
{
    Book.find({}, 'title' ).exec(( err, books ) =>
    {
        if ( err ) return next( err );
        // successful, so render
        res.render( 'bookinstance/bookinstance_form', { title: 'Create BookInstance', book_list: books });
    });
};

// handle BookInstance create on POST
exports.bookinstance_create_post =
[
    // validate fields
    body( 'book', 'Book must be specified' ).isLength({ min: 1 }).trim(),
    body( 'imprint', 'Imprint must be specified' ).isLength({ min: 1 }).trim(),
    body( 'due_back', 'Invalid date' ).optional({ checkFalsy: true }).isISO8601(),

    // sanitize fields
    sanitizeBody( 'book' ).trim().escape(),
    sanitizeBody( 'imprint' ).trim().escape(),
    sanitizeBody( 'status' ).trim().escape(),
    sanitizeBody( 'due_back' ).trim().escape(),

    // process request after validation and sanitization
    ( req, res, next ) =>
    {
        // extract the validation errors from a request
        const errors = validationResult( req );

        // create a BookInstance object with escaped and trimmed data
        const bookinstance = new BookInstance(
        {
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back
        });

        if ( ! errors.isEmpty())
        {
            // there are errors. render form again with sanitized values and error messages
            Book.find({}, 'title' ).exec(( err, books ) =>
            {
                if ( err ) return next( err );
                // successful, so render
                res.render( 'bookinstance/bookinstance_form', { title: 'Create BookInstance', book_list: books, selected_book: bookinstance.book._id, errors: errors.array(), bookinstance });
            });
            // return;
        }
        else
        {
            // data from form is valid
            bookinstance.save(( err ) =>
            {
                if ( err ) return next( err );
                // successful - redirect to new record
                res.redirect( bookinstance.url );
            });
        }
    }
];

// display BookInstance delete form on GET
exports.bookinstance_delete_get = ( req, res, next ) =>
{
    BookInstance.findById( req.params.id ).populate( 'book' )
        .exec(( err, bookinstance ) =>
        {
            if ( err ) return next( err );

            if ( bookinstance == null ) res.redirect( '/catalog/bookinstances' ); // no results
            // successful, so render
            res.render( 'bookinstance/bookinstance_delete', { title: 'Delete BookInstance', bookinstance });
        });
};

// handle BookInstance delete on POST
exports.bookinstance_delete_post = ( req, res, next ) =>
{
    BookInstance.findByIdAndRemove( req.body.bookinstanceid, function deleteBookInstance ( err )
    {
        if ( err ) return next( err );
        // success - go to bookinstance list
        res.redirect( '/catalog/bookinstances' );
    });
};

// display BookInstance update form on GET
exports.bookinstance_update_get = ( req, res, next ) =>
{
    async.parallel(
    {
        books: ( callback ) => { Book.find({}, 'title' ).exec( callback ); },
        bookinstance: ( callback ) => { BookInstance.findById( req.params.id ).exec( callback ); }
    }, ( err, results ) =>
    {
        if ( err ) return next( err );
        // successful, so render
        res.render( 'bookinstance/bookinstance_form', { title: 'Update BookInstance', bookinstance: results.bookinstance, selected_book: results.bookinstance.book._id, book_list: results.books });
    });
};

// handle BookInstance update on POST
exports.bookinstance_update_post =
[
    // validate fields
    body( 'book', 'Book must be specified' ).isLength({ min: 1 }).trim(),
    body( 'imprint', 'Imprint must be specified' ).isLength({ min: 1 }).trim(),
    body( 'due_back', 'Invalid date' ).optional({ checkFalsy: true }).isISO8601(),

    // sanitize fields
    sanitizeBody( 'book' ).trim().escape(),
    sanitizeBody( 'imprint' ).trim().escape(),
    sanitizeBody( 'status' ).trim().escape(),
    sanitizeBody( 'due_back' ).trim().escape(),

    // process request after validation and sanitization
    ( req, res, next ) =>
    {
        // create a BookInstance object with escaped and trimmed data
        const bookinstance = new BookInstance(
        {
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back,
            _id: req.params.id // this is required, or a new ID will be assigned!
        });
        // extract the validation errors from a request
        const errors = validationResult( req );

        if ( ! errors.isEmpty())
        {
            // there are errors. render form again with sanitized values and error messages
            Book.find({}, 'title' ).exec(( err, books ) =>
            {
                if ( err ) return next( err );
                // successful, so render
                return res.render( 'bookinstance/bookinstance_form', { title: 'Update BookInstance', book_list: books, errors: errors.array(), bookinstance });
            });
        }
        else
        {
            // data from form is valid
            BookInstance.findByIdAndUpdate( req.params.id, bookinstance, {}, ( err, thebookinstance ) =>
            {
                if ( err ) return next( err );
                // successful - redirect to Author detail page
                res.redirect( thebookinstance.url );
            });
        }
    }
];