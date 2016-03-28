// set up ==============================================================================
	var express  = require('express');
	var app      = express();		
	var mongoose = require('mongoose'); 		
	var morgan = require('morgan'); 		
	var bodyParser = require('body-parser');
	var methodOverride = require('method-override');
	var argv = require('optimist').argv;
    var http = require('http').Server(app);
	var io = require('socket.io')(http);
	var jwt        = require('jwt-simple');
	var cors       = require('cors');
	var moment = require('moment');
	var request = require('request');
	var qs         = require('querystring');

// configuration ======================================================================
	//mongoose.connect('mongodb://' + argv.be_ip + ':80/boxoApp');
	mongoose.connect('mongodb://localhost/boxoApp');
    //app.use('/public', express.static(__dirname + '/public'));
    app.use(cors());
    app.use(express.static('public'));
    app.use(express.static('/'));
   	app.use('/bower_components', express.static(__dirname + '/bower_components'));
	app.use(morgan('dev')); 										// log every request to the console
	app.use(bodyParser.urlencoded({ extended : true})); 			// parse application/x-www-form-urlencoded
	app.use(bodyParser.json()); 									// parse application/json
	app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
	app.use(methodOverride());

//Include the models and controllers of the app =======================================
    var models = require('./models/modelBdBoxo');
    var controllerUser = require('./controllers/controllerUser'); 
    var requestsMsg = require('./models/modelBdRequest');
	var config = require('./public/secret.json');
	//qvar middleware = require('./public/helpers/middleware');

//Token de autenticación
function createJWT(userId) {
  var payload = {
    sub: userId,
    iat: moment().unix(),
    exp: moment().add(14, 'days').unix()
  };
  return jwt.encode(payload, config.TOKEN_SECRET);
}

//Conection with api twitter
app.post('/auth/twitter', function(req, res) {
  var requestTokenUrl = 'https://api.twitter.com/oauth/request_token';
  var accessTokenUrl  = 'https://api.twitter.com/oauth/access_token';
  var authenticateUrl = 'https://api.twitter.com/oauth/authenticate';

  // First request: no auth token present
  if (!req.body.oauth_token || !req.body.oauth_verifier) {
    var requestTokenOauth = {
      consumer_key: config.TWITTER_KEY,
      consumer_secret: config.TWITTER_SECRET
    };

    // Retrieve a Twitter Token and redirect to Twitter auth page
    request.post({ url: requestTokenUrl, oauth: requestTokenOauth }, function(err, response, body) {
      res.send(qs.parse(body));
    });
  } else {
    var accessTokenOauth = {
      consumer_key: config.TWITTER_KEY,
      consumer_secret: config.TWITTER_SECRET,
      token: req.body.oauth_token,
      verifier: req.body.oauth_verifier
    };

    // Check the token against Twitter and send JWT to app
    request.post({ url: accessTokenUrl, oauth: accessTokenOauth }, function(err, response, resData) {
      // Additional info from user should be retrieved here (from a local db etc.)
      res.send({ token: createJWT(qs.parse(resData).user_id) });
    });
  }
});

//Create routes by server rest API ====================================================
    var boxoRoutes = express.Router();
  //	boxoRoutes.post('/auth/signup', auth.emailSignup);  
    
    boxoRoutes.route('/getUsers')
    .get(controllerUser.showAllUsers)
    // .put(controllerUser.updateUser); // Edit information
   // boxoRoutes.route('/getUniqueUser/:id')
  //  .get(controllerUser.getUniqueUser)

//	boxoRoutes.post('/auth/login', auth.emailLogin);

    boxoRoutes.route('/addUser')
    .post(controllerUser.addNewUser)

    boxoRoutes.route('/login')
    .post(controllerUser.verifyLogin)
   
    app.use('/boxoRest', boxoRoutes)

//Functionality of the real time ======================================================
	io.on('connection', function(socket){
		console.log("New socket abierto!");

		socket.on('boxo-request', function(pull) {
			io.emit('boxo-request', pull);
		});

		socket.on('disconnect', function(){
			console.log("desconectado!");
		});

	})

// application ======================================================================
	app.get('/', function(req, res) {
		//	res.send('Bienvenido al server rest mongo');
		res.sendFile('index.html');
	});

// listen (start app with node server.js) ===========================================
	//app.listen(8080, argv.fe_ip);
	http.listen(8080);
	console.log("App listening on port 8080");
