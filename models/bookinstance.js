const mongoose = require( 'mongoose' );
const moment = require( 'moment' );

const Schema = mongoose.Schema;

const BookInstanceSchema = new Schema(
{
    book: // reference to the associated book
    {
        type: Schema.ObjectId,
        ref: 'Book',
        required: true
    },
    imprint: { type: String, required: true },
    status:
    {
        type: String,
        required: true,
        enum: [ 'Available', 'Maintenance', 'Loaned', 'Reserved' ],
        default: 'Maintenance'
    },
    due_back: { type: Date, default: Date.now }
});

// virtual for bookinstance's URL
BookInstanceSchema
    .virtual( 'url' )
    .get( function ()
    {
        return `/catalog/bookinstance/${this._id}`;
    });

// virtual for bookinstance's formatted due_back
BookInstanceSchema
    .virtual( 'due_back_formatted' )
    .get( function ()
    {
        return moment( this.due_back ).format( 'MMMM Do, YYYY' );
    });

// export model
module.exports = mongoose.model( 'BookInstance', BookInstanceSchema );