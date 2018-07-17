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
        .exec(( err, listBooks ) =>
        {
            if ( err ) return next( err );
            // successful, so render
            res.render( 'book/book_list', { title: 'Book List', book_list: listBooks });
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
        res.render( 'book/book_detail', { title: 'Title', book: results.book, book_instances: results.book_instance });
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
        res.render( 'book/book_form', { title: 'Create Book', authors: results.authors, genres: results.genres });
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
                res.render( 'book/book_form', { title: 'Create Book', authors: results.authors, genres: results.genres, book, errors: errors.array() });
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
exports.book_delete_get = ( req, res, next ) =>
{
    async.parallel(
        {
            book: ( callback ) => { Book.findById( req.params.id ).exec( callback ); },
            bookinstances: ( callback ) => { BookInstance.find({ 'book': req.params.id }).exec( callback ); }
        }, ( err, results ) =>
        {
            if ( err ) return next( err );
    
            if ( results.book == null ) res.redirect( '/catalog/book' ); // no results
            // successful, so render
            res.render( 'book/book_delete', { title: 'Delete Book', book: results.book, bookinstances: results.bookinstances });
        });
};

// handle Book delete on POST
exports.book_delete_post = ( req, res, next ) =>
{
    async.parallel(
        {
            book: ( callback ) => { Book.findById( req.params.bookid ).exec( callback ); },
            bookinstances: ( callback ) => { BookInstance.find({ 'book': req.body.bookid }).exec( callback ); }
        }, ( err, results ) =>
        {
            if ( err ) return next( err );
            // success
            if ( results.bookinstances.length > 0 )
            {
                // Book has bookinstances. render in same way as for GET route
                return res.render( 'book/book_delete', { title: 'Delete Book', book: results.book, bookinstances: results.bookinstances });
            }
            else
            {
                // Book has no bookinstances. delete object and redirect to the list of Books
                Book.findByIdAndRemove( req.body.bookid, function deleteBook ( err )
                {
                    if ( err ) return next( err );
                    // success - go to book list
                    res.redirect( '/catalog/books' );
                });
            }
        });
};

// display Book update form on GET
exports.book_update_get = ( req, res, next ) =>
{
    // get Book, Authors, and Genres for form
    async.parallel(
    {
        book: ( callback ) => { Book.findById( req.params.id ).populate( 'author' ).populate( 'genre' ).exec( callback ); },
        authors: ( callback ) => { Author.find( callback ); },
        genres: ( callback ) => { Genre.find( callback ); }
    }, ( err, results ) =>
    {
        if ( err ) return next( err );

        if ( results.book == null ) // no results
        {
            const err = new Error( 'Book not found' );
            err.status = 404;
            return next( err );
        }
        // success. mark our selected genres as checked
        for ( let all_g_iter = 0; all_g_iter < results.genres.length; all_g_iter++ )
        {
            for ( let book_g_iter = 0; book_g_iter < results.book.genre.length; book_g_iter++ )
            {
                if ( results.genres[ all_g_iter ]._id.toString() === results.book.genre[ book_g_iter ]._id.toString())
                {
                    results.genres[ all_g_iter ].checked = 'true';
                }
            }
        }
        res.render( 'book/book_form', { title: 'Update Book', authors: results.authors, genres: results.genres, book: results.book });
    });
};

// handle Book update on POST
exports.book_update_post =
[
    // convert the Genre to an array
    ( req, res, next ) =>
    {
        if ( ! ( req.body.genre instanceof Array ))
        {
            if ( typeof req.body.genre === 'undefined' )
                req.body.genre = [];
            else
                req.body.genre = new Array( req.body.genre );
        }
        next();
    },

    // validate fields
    body( 'title', 'Title must not be empty' ).isLength({ mind: 1 }).trim(),
    body( 'author', 'Author must not be empty' ).isLength({ min: 1 }).trim(),
    body( 'summary', 'Summary must not be empty' ).isLength({ min: 1 }).trim(),
    body( 'isbn', 'ISBN must not be empty' ).isLength({ min: 1 }).trim(),
    
    // sanitize fields
    sanitizeBody( 'title' ).trim().escape(),
    sanitizeBody( 'author' ).trim().escape(),
    sanitizeBody( 'summary' ).trim().escape(),
    sanitizeBody( 'isbn' ).trim().escape(),
    sanitizeBody( 'genre' ).trim().escape(),

    // process request after validation and sanitization
    ( req, res, next ) =>
    {
        // extract the validation errors from a request
        const errors = validationResult( req );

        // create a Book object with escaped/trimmed data and old id
        const book = new Book(
        {
            title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: ( typeof req.body.genre === 'undefined' ) ? [] : req.body.genre,
            _id: req.params.id // this is required, or a new ID will be assigned!
        });

        if ( ! errors.isEmpty())
        {
            // there are errors. render form again with sanitized values/error messages
            // get all Authors and Genres for form
            async.parallel(
            {
                authors: ( callback ) => { Author.find( callback ); },
                genres: ( callback ) => { Genre.find( callback ); }
            }, ( err, results ) =>
            {
                if ( err ) return next( err );

                // mark our selected Genres as checked
                for ( let i = 0; i < results.genres.length; i++ )
                {
                    if ( book.genre.indexOf( results.genres[ i ]._id ) > -1 )
                    {
                        results.genres[ i ].checked = 'true';
                    }
                }
                res.render( 'book/book_form', { title: 'Udpate Book', authors: results.authors, genres: results.genres, book, errors: errors.array() });
            });
            // return;
        }
        else
        {
            // data form form is valid. update the record
            Book.findByIdAndUpdate( req.params.id, book, {}, ( err, thebook ) =>
            {
                if ( err ) return next( err );
                // successful - redirect to book detail page
                res.redirect( thebook.url );
            });
        }
    }
];