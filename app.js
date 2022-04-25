var express 			= require('express'),
	app 				= express(),
	expressSanitizer 	= require('express-sanitizer'),
	bodyParser 			= require('body-parser'),
	mongoose 			= require('mongoose'),
	methodOverride		= require('method-override');

//APP CONFIG
//connecting to mongodb and creating database restful_blog_app
mongoose.connect("mongodb://localhost/restful_blog_app", {useNewUrlParser: true});
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
//tell express to use sanitizer
app.use(expressSanitizer());
//to use our custom stylesheet
app.use(express.static("public"));
//tell the express to use method-override
app.use(methodOverride("_method"));

//basic layout of blog
//title
//image
//body - textarea of blog
//created - date on which the blog is created

//MONGOOSE/MODEL CONFIG
//CREATING DATABASE SCHEMA
var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {
		type: Date,
		default: Date.now
	}
});
//CREATING MODEL
var Blog = mongoose.model("Blog", blogSchema);

//TEST CASE
// Blog.create({
// 	title: "Test Blog",
// 	image: "https://source.unsplash.com/0eLg8OTuCw0",
// 	body: "This is blog post of a beautiful landscape"
// },
// 	function(err, blog){
// 		if(err){
// 			console.log(err);
// 		}
// 		else{
// 			console.log(blog);
// 		}
// });

//RESTFUL ROUTES
//ROOT ROUTE
app.get("/", function(req, res){
	res.redirect("/blogs");
});

//INDEX
app.get("/blogs", function(req, res){
	//retrieving all blogs from DB
	Blog.find({},
		function(err, allBlogs){
			if(err){
				console.log(err);
			}
			else{
				//sending blogs to index.ejs
				res.render("index", {
					blogs: allBlogs
				});
			}
		});
});

//NEW
app.get("/blogs/new", function(req ,res){
	res.render("new");
});

//CREATE
app.post("/blogs", function(req, res){
	//create blog and save it to DB
	//we have to sanitize the blog's body
	req.body.blog.body = req.sanitize(req.body.blog.body);
	//the sanitized body is stored in req.body.blog.body i.e. the existing object variable
	Blog.create(req.body.blog, function(err, newBlog){
		if(err){
			console.log(err);
			res.render("new");
		}
		else{
			//redirect to the blogs page
			res.redirect("/blogs");
		}
	});
});

//SHOW
app.get("/blogs/:id", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			console.log(err);
			res.redirect("/blogs");
		}
		else{
			res.render("show", {
				blog: foundBlog
			});
		}
	});
});

//EDIT
app.get("/blogs/:id/edit", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			console.log(err);
			res.redirect("/blogs/" + req.params.id);
		}
		else{
			res.render("edit", {
				blog: foundBlog
			});
		}
	});
});

//UPDATE
app.put("/blogs/:id", function(req, res){
	//sanitizing the body of updated blog
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updateBlog){
		if(err){
			res.redirect("/blogs");
		}
		else{
			res.redirect("/blogs/" + req.params.id);
		}
	})
});

//DELETE
app.delete("/blogs/:id", function(req, res){
	//destroy blog
	Blog.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/blogs");
		}
		else{
			//redirect
			res.redirect("/blogs");
		}
	});
});

//SERVER STARTING
app.listen(3000, function(){
	console.log("SERVER STARTED ON PORT=3000");
	console.log("Welcome to RESTful blog app");
})
