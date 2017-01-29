
const fs 		= require('fs') ;
const express   = require('express') ;
const layout	= require('./layout.js') ;

const app       = express() ;
const router   	= express.Router() ;
const port      = process.env.PORT || 1963 ;


app.use(function(req, res, next) {
    var data = '';
    req.setEncoding('utf8');
    req.on('data', function(chunk) { 
        data += chunk;
    });
    req.on('end', function() {
        req.rawBody = data;
        next();
    });
});


app.post( "/upload", function(req,res) { 
	res.charset = 'utf8';
	res.contentType = "application/javascript" ;
    res.json( layout( req.rawBody ) ) ;
}) ;

app.use('/css', express.static('css'));
app.use('/js', express.static('js'));
app.use('/', express.static('html'));

app.listen(port);


