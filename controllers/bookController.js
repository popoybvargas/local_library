const Book = require( '../models/book' );
const Author = require( '../models/author' );
const Genre = require( '../models/genre' );
const BookInstance = require( '../models/bookinstance' );
const { body, validationResult } = require( 'express-validator/check' );
const { sanitizeBody } = require( 'express-validator/filter' );

const async = require( 'async' );

exports.index = ( req, res ) =>
{
    async.parallel(
    {
        book_count: ( callback ) =>
        {
            Book.countDocuments({}, callback ); // pass an empty object as match condition to find all documents of this collection
        },
        book_instance_count: ( callback ) =>
        {
            BookInstance.countDocuments({}, callback );
        },
        book_instance_available_count: ( callback ) =>
        {
            BookInstance.countDocuments({ status: 'Available' }, callback );
        },
        author_count: ( callback ) =>
        {
            Author.countDocuments({}, callback );
        },
        genre_count: ( callback ) =>
        {
            Genre.countDocuments({}, callback );
        }
    }, ( err, results ) =>
    {
        res.render( 'index', { title: 'Local Library Home', error: err, data: results });
    });
};

// display list of all Books
exports.book_list = ( req, res, next ) =>
{
    Book.find({}, 'title author' )
        .populate( 'author' )
        .exec(( err, list_books ) =>
        {
            if ( err ) return next( err );
            // successful, so render
            res.render( 'book_list', { title: 'Book List', book_list: list_books });
        });
};

// display detail page for a specific Book
exports.book_detail = ( req, res, next ) =>
{
    async.parallel(
    {
        book: ( callback ) =>
        {
            Book.findById( req.params.id )
                .populate( 'author' )
                .populate( 'genre' )
                .exec( callback );
        },
        book_instance: ( callback ) =>
        {
            BookInstance.find({ 'book': req.params.id }).exec( callback );
        }
    }, ( err, results ) =>
    {
        if ( err ) return next( err );

        if ( results.book == null ) // no results
        {
            const err = new Error( 'Book not found' );
            err.status = 404;
            return next( err );
        }
        // successful, so render
        res.render( 'book_detail', { title: 'Title', book: results.book, book_instances: results.book_instance });
    });
};

// display Book create form on GET
exports.book_create_get = ( req, res, next ) =>
{
    // get all Authors and Genres, which we can use for adding to our book
    async.parallel(
    {
        authors: ( callback ) => { Author.find( callback ); },
        genres: ( callback ) => { Genre.find( callback ); }
    }, ( err, results ) =>
    {
        if ( err ) return next( err );
        res.render( 'book_form', { title: 'Create Book', authors: results.authors, genres: results.genres });
    });
};

// handle Book create on POST
exports.book_create_post =
[
    // convert the genre to an array
    ( req, res, next ) =>
    {
        if ( ! ( req.body.genre instanceof Array ))
        {
            if ( typeof req.body.genre === 'undefined' ) req.body.genre = [];
            else req.body.genre = new Array( req.body.genre );
        }
        next();
    },

    // validate fields
    body( 'title', 'Title must not be empty' ).isLength({ min: 1 }).trim(),
    body( 'author', 'Author must not be empty' ).isLength({ min: 1 }).trim(),
    body( 'summary', 'Summary must not be empty' ).isLength({ min: 1 }).trim(),
    body( 'isbn', 'ISBN must not be empty' ).isLength({ min: 1 }).trim(),

    // sanitize fields (using wildcard)
    sanitizeBody( '*' ).trim().escape(),

    // process request after validation and sanitization
    ( req, res, next ) =>
    {
        // extract the validation errors from a request
        const errors = validationResult( req );

        // create a Book object with escaped and trimmed data
        const book = new Book(
        {
            title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: req.body.genre
        });

        if ( ! errors.isEmpty())
        {
            // there are errors. render form again with sanitized values/error messages
            // get all Authors and genres for form
            async.parallel(
            {
                authors: ( callback ) => { Author.find( callback ); },
                genres: ( callback ) => { Genre.find( callback ); }
            }, ( err, results ) =>
            {
                if ( err ) return next( err );

                // mark our selected genres as checked
                for ( let i = 0; i < results.genres.length; i++ )
                {
                    if ( book.genre.indexOf( results.genres[ i ]._id ) > -1 )
                    {
                        // current Genre is selected. set "checked" flag
                        results.genres[ i ].checked = 'true';
                    }
                }
                res.render( 'book_form', { title: 'Create Book', authors: results.authors, genres: results.genres, book, errors: errors.array() });
            });
            // return;
        }
        else
        {
            // data form form is valid. save book.
            book.save(( err ) =>
            {
                if ( err ) return next( err );
                // successful - redirect to new book record
                res.redirect( book.url );
            });
        }
    }
];

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