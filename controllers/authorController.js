const Author = require( '../models/author' );
const Book = require( '../models/book' );
const async = require( 'async' );
const { body, validationResult } = require( 'express-validator/check' );
const { sanitizeBody } = require( 'express-validator/filter' );

// display list of all Authors
exports.author_list = ( req, res, next ) =>
{
    Author.find()
        .sort([[ 'family_name', 'ascending' ]])
        .exec(( err, list_authors ) =>
        {
            if ( err ) return next( err );
            // successful, so render
            res.render( 'author_list', { title: 'Author List', author_list: list_authors });
        });
};

// display detail page for a specific Author
exports.author_detail = ( req, res, next ) =>
{
    async.parallel(
    {
        author: ( callback ) => { Author.findById( req.params.id ).exec( callback ); },
        author_books: ( callback ) => { Book.find({ 'author': req.params.id }, 'title summary' ).exec( callback ); }
    }, ( err, results ) =>
    {
        if ( err ) return next( err ); // error in API usage

        if ( results.author == null ) // no results
        {
            const err = new Error( 'Author not found' );
            err.status = 404;
            return next( err );
        }
        // successful, so render
        res.render( 'author_detail', { title: 'Author Detail', author: results.author, author_books: results.author_books });
    });
};

// display Author create form on GET
exports.author_create_get = ( req, res, next ) =>
{
    res.render( 'author_form', { title: 'Create Author' });
};

// handle Author create on POST
exports.author_create_post =
[
    // validate fields
    body( 'first_name' ).isLength({ min: 1 }).trim().withMessage( 'First name must be specified' ).isAlphanumeric().withMessage( 'First name has non-alphanumeric character' ),
    body( 'family_name' ).isLength({ min: 1 }).trim().withMessage( 'Family name must be specified' ).isAlphanumeric().withMessage( 'Family name has non-alphanumeric characters' ),
    body( 'date_of_birth', 'Invalid date of birth' ).optional({ checkFalsy: true }).isISO8601(),
    body( 'date_of_death', 'Invalid date of death' ).optional({ checkFalsy: true }).isISO8601(),

    // sanitize fields
    sanitizeBody( 'first_name' ).trim().escape(),
    sanitizeBody( 'family_name' ).trim().escape(),
    sanitizeBody( 'date_of_birth' ).toDate(),
    sanitizeBody( 'date_of_death' ).toDate(),

    // process request after validation and sanitization
    ( req, res, next ) =>
    {
        // extract the validation errors from a request
        const errors = validationResult( req );

        if ( ! errors.isEmpty() )
        {
            // there are errors. render form again with sanitized values/errors messages
            return res.render( 'author_form', { title: 'Create Author', author: req.body, errors: errors.array() });
        }
        else
        {
            // data from form is valid
            // create an Author object with escaped and trimmed data
            const author = new Author(
            {
                firt_name: req.body.firt_name,
                family_name: req.body.family_name,
                date_of_birth: req.body.date_of_birth,
                date_of_death: req.body.date_of_death
            });
            author.save(( err ) =>
            {
                if ( err ) return next( err );
                // successful - redirect to new author record
                res.redirect( author.url );
            });
        }
    }
];

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