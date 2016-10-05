var express = require('express')
var bodyParser = require('body-parser')
var mongoClient = require('mongodb').MongoClient
var ObjectID = require('mongodb').ObjectID
var engine = require('express-handlebars')

var bcrypt = require('bcrypt')
var session = require('express-session')

var app = express()

app.use(bodyParser.urlencoded({extended:true}))
app.engine('handlebars', engine({defaultLayout:'main'}))
app.set('view engine', 'handlebars')
app.set('views', __dirname + '/views')

mongoClient.connect('mongodb://localhost:27017/users', function(err, db){
	//middleware
	app.use(function(req, res, next){
		if(req.session.userId){
			db.collection('users').findOne(ObjectID(req.session.userId), function(err, user){
				req.user = user,
				next()
			})
		} else {
			next()
		}
	})

	//routes
	// index
	app.get('/', function(req, res){
		db.collection('users').find().toArray(function(err, result){
			res.render('index', {
				users:users,
				currentUser: req.user
			})
		})
	})

	//new 
	app.get('/users/new', function(req, res){
		res.render('users/new')
	})

	//create
	app.post('/users', function(req, res){
		var user = req.body.user
		bcrypt.hash(user.pass, 8 , function(err, hash){
			user.pass = hash
			db.collection('users').insertOne(user, function(err, result){
				if(err){
					res.render('users/new', {error: "Email already registered"})
					return
				}
				req.session.userId = user._id 
				res.redirect('/')
			})
		})
	})
})

app.listen(3001)