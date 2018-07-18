const Book = require( '../models/book' );
const Genre = require( '../models/genre' );
const async = require( 'async' );
const { body, validationResult } = require( 'express-validator/check' );
const { sanitizeBody } = require( 'express-validator/filter' );

// display list of all Genres
exports.genre_list = ( req, res, next ) =>
{
    Genre.find()
        .sort([[ 'name', 'ascending' ]])
        .exec(( err, genreList ) =>
        {
            if ( err ) return next( err );
            // successful, so render
            res.render( 'genre/genre_list', { title: 'Genre List', genreList });
        });
};

// display detail page for a specific Genre
exports.genre_detail = ( req, res, next ) =>
{
    async.parallel(
    {
        genre: ( callback ) => { Genre.findById( req.params.id ).exec( callback ); },
        genre_books: ( callback ) => { Book.find({ 'genre': req.params.id }).exec( callback ); }
    }, ( err, results ) =>
    {
        if ( err ) return next( err );

        if ( results.genre == null ) // no results
        {
            const err = new Error( 'Genre not found' );
            err.status = 404;
            return next( err );
        }
        // successful, so render
        res.render( 'genre/genre_detail', { title: 'Genre Detail', genre: results.genre, genre_books: results.genre_books });
    });
};

// display Genre create form on GET
exports.genre_create_get = ( req, res, next ) =>
{
    res.render( 'genre/genre_form', { title: 'Create Genre' });
};

// handle Genre create on POST
exports.genre_create_post =
[
    // validate that the name field is not empty
    body( 'name', 'Genre name required' ).isLength({ min: 1 }).trim(),

    // sanitize (trim and escape) the name field
    sanitizeBody( 'name' ).trim().escape(),

    // process request after validation and sanitization
    ( req, res, next ) =>
    {
        // extract the validation errors from a request
        const errors = validationResult( req );

        // create a genre object with escaped and trimmed data
        const genre = new Genre({ name: req.body.name });

        if ( ! errors.isEmpty())
        {
            // there are errors. render the form again with sanitized values/error messages
            return res.render( 'genre/genre_form', { title: 'Create Genre', genre, errors: errors.array() });
        }
        else
        {
            // data form is valid
            // check if Genre with same name already exists
            Genre.findOne({ 'name': req.body.name })
                .exec(( err, found_genre ) =>
                {
                    if ( err ) return next( err );

                    if ( found_genre )
                    {
                        // Genre exists, redirect to its detail page
                        res.redirect( found_genre.url );
                    }
                    else
                    {
                        genre.save(( err ) =>
                        {
                            if ( err ) return next( err );
                            // Genre saved. redirect to genre detail page
                            res.redirect( genre.url );
                        });
                    }
                });
        }
    }
];

// display Genre delete form on GET
exports.genre_delete_get = ( req, res, next ) =>
{
    async.parallel(
        {
            genre: ( callback ) => { Genre.findById( req.params.id ).exec( callback ); },
            genre_books: ( callback ) => { Book.find({ 'genre': req.params.id }).exec( callback ); }
        }, ( err, results ) =>
        {
            if ( err ) return next( err );
    
            if ( results.genre == null ) res.redirect( '/catalog/genres' ); // no results
            // successful, so render
            res.render( 'genre/genre_delete', { title: 'Delete Genre', genre: results.genre, genre_books: results.genre_books });
        });
};

// handle Genre delete on POST
exports.genre_delete_post = ( req, res, next ) =>
{
    async.parallel(
        {
            genre: ( callback ) => { Genre.findById( req.params.authorid ).exec( callback ); },
            genre_books: ( callback ) => { Book.find({ 'genre': req.body.genreid }).exec( callback ); }
        }, ( err, results ) =>
        {
            if ( err ) return next( err );
            // success
            if ( results.genre_books.length > 0 )
            {
                // Genre has books. render in same way as for GET route
                return res.render( 'genre/genre_delete', { title: 'Delete Genre', genre: results.genre, genre_books: results.genre_books });
            }
            else
            {
                // Genre has no books. delete object and redirect to the list of Genres
                Genre.findByIdAndRemove( req.body.genreid, function deleteGenre ( err )
                {
                    if ( err ) return next( err );
                    // success - go to author list
                    res.redirect( '/catalog/genres' );
                });
            }
        });
};

// display Genre update form on GET
exports.genre_update_get = ( req, res, next ) =>
{
    // get Author for form
    Genre.findById( req.params.id, ( err, genre ) =>
    {
        if ( err ) return next( err );

        if ( genre == null ) // no result
        {
            const err = new Error( 'Genre not found' );
            err.status = 404;
            return next( err );
        }
        // successful, so render
        res.render( 'genre/genre_form', { title: 'Update Genre', genre });
    });
};

// display Genre update on POST
exports.genre_update_post =
[
    // validate that the name field is not empty
    body( 'name', 'Genre name required' ).isLength({ min: 1 }).trim(),
    
    // sanitize (trim and escape) the name field
    sanitizeBody( 'name' ).trim().escape(),

    // process request after validation and sanitization
    // process request after validation and sanitization
    ( req, res, next ) =>
    {
        // extract the validation errors from a request
        const errors = validationResult( req );

        // create a genre object with escaped and trimmed data
        const genre = new Genre(
        {
            name: req.body.name,
            _id: req.params.id // this is required, or a new ID will be assigned!
        });

        if ( ! errors.isEmpty())
        {
            // there are errors. render the form again with sanitized values/error messages
            return res.render( 'genre/genre_form', { title: 'Update Genre', genre, errors: errors.array() });
        }
        else
        {
            // data form is valid
            // check if Genre with same name already exists
            Genre.findOne({ 'name': req.body.name })
                .exec(( err, foundGenre ) =>
                {
                    if ( err ) return next( err );

                    if ( foundGenre )
                    {
                        // Genre exists, redirect to its detail page
                        res.redirect( foundGenre.url );
                    }
                    else
                    {
                        Genre.findByIdAndUpdate( req.params.id, genre, {}, ( err, thegenre ) =>
                        {
                            if ( err ) return next( err );
                            // successful - redirect to Genre detail page
                            res.redirect( thegenre.url );
                        });
                    }
                });
        }
    }
];