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
        .exec(( err, listAuthors ) =>
        {
            if ( err ) return next( err );
            // successful, so render
            res.render( 'author/author_list', { title: 'Author List', author_list: listAuthors });
        });
};

// display detail page for a specific Author
exports.author_detail = ( req, res, next ) =>
{
    async.parallel(
    {
        author: ( callback ) => { Author.findById( req.params.id ).exec( callback ); },
        authors_books: ( callback ) => { Book.find({ 'author': req.params.id }, 'title summary' ).exec( callback ); }
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
        res.render( 'author/author_detail', { title: 'Author Detail', author: results.author, authors_books: results.authors_books });
    });
};

// display Author create form on GET
exports.author_create_get = ( req, res, next ) =>
{
    res.render( 'author/author_form', { title: 'Create Author' });
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

        if ( ! errors.isEmpty())
        {
            // there are errors. render form again with sanitized values/errors messages
            return res.render( 'author/author_form', { title: 'Create Author', author: req.body, errors: errors.array() });
        }
        else
        {
            // data from form is valid
            // create an Author object with escaped and trimmed data
            const author = new Author(
            {
                first_name: req.body.first_name,
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
exports.author_delete_get = ( req, res, next ) =>
{
    async.parallel(
    {
        author: ( callback ) => { Author.findById( req.params.id ).exec( callback ); },
        authors_books: ( callback ) => { Book.find({ 'author': req.params.id }).exec( callback ); }
    }, ( err, results ) =>
    {
        if ( err ) return next( err );

        if ( results.author == null ) res.redirect( '/catalog/authors' ); // no results
        // successful, so render
        res.render( 'author/author_delete', { title: 'Delete Author', author: results.author, authors_books: results.authors_books });
    });
};

// handle Author delete on POST
exports.author_delete_post = ( req, res, next ) =>
{
    async.parallel(
    {
        author: ( callback ) => { Author.findById( req.params.authorid ).exec( callback ); },
        authors_books: ( callback ) => { Book.find({ 'author': req.body.authorid }).exec( callback ); }
    }, ( err, results ) =>
    {
        if ( err ) return next( err );
        // success
        if ( results.authors_books.length > 0 )
        {
            // Author has books. render in same way as for GET route
            return res.render( 'author/author_delete', { title: 'Delete Author', author: results.author, authors_books: results.authors_books });
        }
        else
        {
            // Author has no books. delete object and redirect to the list of Authors
            Author.findByIdAndRemove( req.body.authorid, function deleteAuthor ( err )
            {
                if ( err ) return next( err );
                // success - go to author list
                res.redirect( '/catalog/authors' );
            });
        }
    });
};

// display Author update form on GET
exports.author_update_get = ( req, res, next ) =>
{
    // get Author for form
    Author.findById( req.params.id, ( err, author ) =>
    {
        if ( err ) return next( err );

        if ( author == null ) // no result
        {
            const err = new Error( 'Author not found' );
            err.status = 404;
            return next( err );
        }
        // successful, so render
        res.render( 'author/author_form', { title: 'Update Author', author });
    });
};

// handle Author update POST
exports.author_update_post =
[
    // validate fields
    body( 'first_name', 'First Name must not be empty' ).isLength({ mind: 1 }).trim(),
    body( 'family_name', 'Family Name must not be empty' ).isLength({ min: 1 }).trim(),
    
    // sanitize fields
    sanitizeBody( 'first_name' ).trim().escape(),
    sanitizeBody( 'family_name' ).trim().escape(),

    // process request after validation and sanitization
    // process request after validation and sanitization
    ( req, res, next ) =>
    {
        // extract the validation errors from a request
        const errors = validationResult( req );

        if ( ! errors.isEmpty())
        {
            // there are errors. render form again with sanitized values/errors messages
            return res.render( 'author/author_form', { title: 'Update Author', author: req.body, errors: errors.array() });
        }
        else
        {
            // data from form is valid
            // create a Book object with escaped/trimmed data and old id
            const author = new Author(
            {
                first_name: req.body.first_name,
                family_name: req.body.family_name,
                date_of_birth: req.body.date_of_birth,
                date_of_death: req.body.date_of_death,
                _id: req.params.id // this is required, or a new ID will be assigned!
            });
            Author.findByIdAndUpdate( req.params.id, author, {}, ( err, theauthor ) =>
            {
                if ( err ) return next( err );
                // successful - redirect to Author detail page
                res.redirect( theauthor.url );
            });
        }
    }
];