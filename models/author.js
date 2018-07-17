const mongoose = require( 'mongoose' );
const moment = require( 'moment' );

const Schema = mongoose.Schema;

const AuthorSchema = new Schema(
{
    first_name:
    {
        type: String,
        required: true,
        max: 100
    },
    family_name:
    {
        type: String,
        required: true,
        max: 100
    },
    date_of_birth: { type: Date },
    date_of_death: { type: Date }
});

// virtual for author's full name
AuthorSchema
    .virtual( 'name' )
    .get( function ()
    {
        return `${this.family_name}, ${this.first_name}`;
    });

// virtual for author's URL
AuthorSchema
    .virtual( 'url' )
    .get( function ()
    {
        return `/catalog/author/${this._id}`;
    });

// virtual for author's lifespan
AuthorSchema
    .virtual( 'lifespan' )
    .get( function ()
    {
        let lifespan = this.date_of_birth ? moment( this.date_of_birth ).format( 'MMMM Do, YYYY' ) : '';
        const dod = this.date_of_death ? moment( this.date_of_death ).format( 'MMMM Do, YYYY' ) : '';
        lifespan += dod ? ` - ${dod}` : '';
        return lifespan;
    });

// virtual for display of DOB
AuthorSchema
    .virtual( 'dob_formatted' )
    .get( function ()
    {
        return moment( this.date_of_birth ).format( 'YYYY-MM-DD' );
    });

    // virtual for display of DOD
    AuthorSchema
        .virtual( 'dod_formatted' )
        .get( function ()
        {
            return moment( this.date_of_death ).format( 'YYYY-MM-DD' );
        });

// export model
module.exports = mongoose.model( 'Author', AuthorSchema );