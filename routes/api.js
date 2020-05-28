const router = require('express').Router();
const jwt = require('jsonwebtoken');
const {
    check,
    body,
    validationResult
} = require('express-validator');
const validator = require('validator');
const moment = require('moment');
const Ravepay = require('flutterwave-node');

const checkJWT = require('../middlewares/check-jwt');

const User = require('../models/userModel');


//user signup using only username and password. 
//It was stated that user should signup/create an account with username and password.
router.post('/signup', (req, res, next) => {

    let user = new User();

[
    user.username = check(req.body.username)
        .notEmpty()
        .withMessage('Username is required'),

    user.personalDetails.password = body(req.body.password, 'Password must contain atleast 8 characters, atleast one uppercase, atleast one lower case, and atleast one special character. ')
        .isLength({
            min: 8
        })
        .matches(
            /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d@$.!%*#?&]/,
        ),

    body(req.body.password2).custom((value, {
            req
        }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match!');
            }
            return true;
        }),
    ]

    //check errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    //save user to database
    User.findOne({
        username: req.body.username
    }, (err, existingUser) => {
        if (existingUser) {
            res.json({
                success: false,
                message: 'A user with that username already exist'
            })
        } else {
            user.save();

            let token = jwt.sign({
                user: user,
            }, "*&HNS__>!%$##@%^__++", {
                expiresIn: '1d'
            });

            res.json({
                success: true,
                message: 'Account successfully created',
                token: token
            });
        }
    });
});

// user signin/login with username and password after signup
router.post('/login', (req, res, next) => {

    User.findOne({
        username: req.body.username
    }, (err, user) => {
        if (err) throw err;

        if (!user) {
            res.json({
                success: false,
                message: 'Authentication failed, User not found'
            });
        } else if (user) {
            let validPassword = user.personalDetails.comparePassword(req.body.password);
            if (!validPassword) {
                res.json({
                    success: false,
                    message: 'Authentication failed. Wrong password'
                });
            } else {

                let token = jwt.sign({
                    user: user,
                }, "*&HNS__>!%$##@%^__++", {
                    expiresIn: '1d'
                });

                res.json({
                    success: true,
                    message: 'Successfully logged in. Enjoy your stay',
                    token: token
                });
            }
        }
    });
});



//Route for user to add personal details after initial signup and login. This would have been created as the original signup route, 
// but because of the initail signup with just username and password, user would have to complete registration after initial signup and login.

//This route would help user add personal details.

router.post('/registration/personal_details', checkJWT, (req, res, next) => {

    User.findOne({
        username: req.decoded.user.username
    }, (err, user) => {
        if (err) return next(err);

        if (req.body.firstname) user.personalDetails.firstname = (req.body.firstname);
        if (req.body.lastname) user.personalDetails.lastname = req.body.lastname;
        if (req.body.email) user.personalDetails.email = check(req.body.email, 'Please Enter a valid email').isEmail();
        if (req.body.phone) user.personalDetails.phone = validator.isMobilePhone(req.body.phone, ['en-NG'], [strict]); //should be a valid Nigerian Number.
        if (req.body.password) {
            user.personalDetails.password = body(req.body.password, 
                'Password must contain atleast 8 characters, atleast one uppercase, atleast one lower case, and atleast one special character. ')
                    .isLength({
                        min: 8
                    })
                    .matches(
                        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d@$.!%*#?&]/,
                    ) //password should be a strong password
        }

        if (req.body.date_of_birth)  {

                let date = req.body.date_of_birth;
                
                let eighteenYearsAgo = momment().subtract("years", 18);
                let birthday = moment(date);

                if (!birthday.isValid()) {
                    throw new Error('Please enter a valid date');
                } else if (eighteenYearsAgo.isAfter(birthday)) {
                    user.personalDetails.date_of_birth =  birthday;
                } else {
                    throw new Error('You must be 18 years or older');
                }
        }
 
        //check errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({
                errors: errors.array()
            });
        }

        user.save();
        res.json({
            success: true,
            message: 'You have successfully added your personal details'
        })
    })
})


//This route would help user add employment details after initail signup and login.
router.post('/registration/employment_details', checkJWT, (req, res, next) => {

    User.findOne({
        username: req.decoded.user.username
    }, (err, user) => {
        if (err) return next(err);

        if (req.body.sector) user.employmentDetails.sector = req.body.sector;
        if (req.body.employment_status) user.employmentDetails.employment_status = req.body.employment_status;
        if (req.body.employer) user.employmentDetails.employer = req.body.employer;
        if (req.body.employer_address) user.employmentDetails.employer_address = req.body.employer_address;
        if (req.body.office_email) user.employmentDetails.office_email = req.body.office_email;
        if (req.body.office_phone) user.employmentDetails.office_phone = req.body.office_phone;
        if (req.body.designation) user.employmentDetails.designation = req.body.designation;

        user.save();
        res.json({
            success: true,
            message: 'You have successfully added your employemnt details'
        });

    });
});


//This route would help user add bank details after initial signup and login.
router.post('/registration/bank_details', checkJWT, (req, res, next) => {

    User.findOne({
        username: req.decoded.user.username
    }, (err, user) => {
        if (err) return next(err);

        if (req.body.account_number) {

            const banks = [
                { name: "ACCESS BANK", code: "044" },
                { name: "CITIBANK", code: "023" },
                { name: "DIAMOND BANK", code: "063" },
                { name: "ECOBANK NIGERIA", code: "050" },
                { name: "FIDELITY BANK", code: "070" },
                { name: "FIRST BANK OF NIGERIA", code: "011" },
                { name: "FIRST CITY MONUMENT BANK", code: "214" },
                { name: "GUARANTY TRUST BANK", code: "058" },
                { name: "HERITAGE BANK", code: "030" },
                { name: "JAIZ BANK", code: "301" },
                { name: "KEYSTONE BANK", code: "082" },
                { name: "PROVIDUS BANK", code: "101" },
                { name: "SKYE BANK", code: "076" },
                { name: "STANBIC IBTC BANK", code: "221" },
                { name: "STANDARD CHARTERED BANK", code: "068" },
                { name: "STERLING BANK", code: "232" },
                { name: "SUNTRUST", code: "100" },
                { name: "UNION BANK OF NIGERIA", code: "032" },
                { name: "UNITED BANK FOR AFRICA", code: "033" },
                { name: "UNITY BANK", code: "215" },
                { name: "WEMA BANK", code: "035" },
                { name: "ZENITH BANK", code: "057" }
              ];
              
              const nubanLength = 10;
              let error;

              let accountNumber = req.body.account_number;

                let accountBanks = [];

                banks.forEach((item, index) => {
                if (isBankAccountValid(accountNumber, item.code)) {
                    const possible_matching_accounts = accountBanks.push(item);
                    if(possible_matching_accounts.length > 0) {
                        user.bankDetails.account_number = accountNumber; // must be a valid bank account.
                    } else{
                        throw new Error('Please enter a valid bank account number');
                    }
                }
                });

                const isBankAccountValid = (accountNumber, bankCode) => {
                    if (!accountNumber || !accountNumber.length == nubanLength) {
                      error = "NUBAN must be %s digits long" % nubanLength;
                      return false;
                    }
                };
        }
        
        if (req.body.bank) user.bankDetails.bank = req.body.bank;

        if (req.body.bvn) {

            const rave = new Ravepay(FLWPUBK-b422b919e407ed651f00229b502f5374-X, FLWSECK-a81833b1dff9d9dd80c8c871a1232828-X, false);

            // const callBvn =  async () => {

                const payload = {
                    bvn: "req.body.bvn"
                }
                try {
                   const response =  rave.Bvn.verification(payload, rave)
                   console.log(response);
                   user.bankDetails.bvn = bvn;
                } catch (error) {
                    console.log(error)
                    throw new Error('BVN must be valid')
                }                            
               
            // }
            // callBvn()
        }
        user.save();
        res.json({
            success: true,
            message: 'You have successfully added your employemnt details'
        });

    });
});


module.exports = router;
