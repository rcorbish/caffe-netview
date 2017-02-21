
const fs 		= require('fs') ;
const http 		= require('http') ;
const https 	= require('https') ;
const url		= require('url') ;
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


app.post( "/upload", function(req,res,next) {

	new Promise( function( fulfill, reject ) {
		if( req.headers[ 'content-type' ] === 'text/uri-list' ) {
			protoText = "" ;
			const options = url.parse( req.rawBody ) ;
			const handler = options.protocol === 'http' ? http : https ;
			handler.request( options, function(res) {
			  res.on('data', function (chunk) {
			    protoText += chunk ;
			  })
			  .on('end', function() {
				fulfill( protoText ) ;  
			  })
			})
			.on( 'error', function(err) {
				reject( err ) ;
			}) 
			.end();
		} else {
			fulfill( req.rawBody ) ;
		}		
	})	
	.then( function( protoText ) {
		console.log( "Laying out", protoText.length, "text bytes" ) ;
		return layout( protoText, req.query.charge, req.query.tension, req.query.radius, req.query.stage ) ;
	})
	.then( function( obj ) {
	    res.json( obj ) ;		
	})
	.catch( function( err ) {
		next( err ) ;
	}) ;	
}) ;

app.use('/css', express.static('css'));
app.use('/js', express.static('js'));
app.use('/', express.static('html'));

app.listen(port);


