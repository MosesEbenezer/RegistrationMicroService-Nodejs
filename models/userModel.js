const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const  bcrypt = require('bcrypt-nodejs');

const UserSchema = new Schema({
    username: String,
    personalDetails: {
        firstname: String,
        lastname: String,
        email: String,
        phone: String, //should be a valid Nigerian number
        password: String, //strong password check, password confirmation.
        date_of_birth: String //Must be 18years or older
    },
    employmentDetails: {
        sector: String,
        employment_status: String,
        employer: String,
        employer_address: String,
        office_email: String,
        office_phone: String,
        designation: String
    },
    bankDetails: {
        account_number: String, //must be a valid nuban number
        bank: String,
        bvn: String // Must be a valid bvn
    }

})


UserSchema.pre('save', function(next) {
    let user = this;

    if(!user.isModified('password')) return next();

    bcrypt.hash(user.password, null, null, function(err, hash) {
        if(err) return next(err);

        user.password = hash;
        next();
    })
})

UserSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model("User", UserSchema);