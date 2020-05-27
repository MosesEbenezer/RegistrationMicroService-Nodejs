const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');


const app = express();

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: false}));


const registrationRoute = require('./routes/api');
app.use('/', registrationRoute);

//connect to mongodb database
const url = "mongodb://localhost:27017/RegistrationMicroService";

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
    if(err) {
        console.log('Not connected to the database: ' + err);
        
    } else {
        console.log('Successfully connected to the database');
        
    }
})


const server = app.listen(3000 || process.env.PORT, (err) => {
   console.log("server is up and running");
});

module.exports = server;