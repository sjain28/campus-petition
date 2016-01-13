var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;

var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');

router.get('/posts', function(req,res,next){ //Get all posts
	Post.find(function(err, posts){
		if(err){return next(err);}

		res.json(posts);
	});
}); 

router.post('/posts', function(req,res,next){ //Post a poast
	var post = new Post(req.body);

	post.save(function(err, post){
		if(err){return next(err);}

		res.json(post);
	});
});

router.param('post', function(req, res, next, id) { //Preload posts
  var query = Post.findById(id);

  query.exec(function (err, post){
    if (err) { return next(err); }
    if (!post) { return next(new Error('can\'t find post')); }

    req.post = post;
    return next();
  });
});

router.param('comment', function(req,res,next,id){ //Preload commments
	var query = Comment.findById(id);

	query.exec(function (err, comment){
		if(err){ return next(err);}
		if(!comment){ return next(new Error('can\'t find comment')); }

		req.comment = comment;
		return next();
	});
});


router.get('/posts/:post', function(req, res, next) { //get a specific post
  req.post.populate('comments', function(err, post) {
    if (err) { return next(err); }

    res.json(post);
  });
});



router.put('/posts/:post/upvote', function(req, res){ //upvote a post
	req.post.upvote(function(err, post){
		if(err){ return next(err);}

		res.json(post);
	});
});

router.post('/posts/:post/comments', function(req,res){ //post a comment
	var comment = new Comment(req.body);
	comment.post = req.post;

	comment.save(function(err, comment){
		if(err){return next(err);}

		req.post.comments.push(comment);
		req.post.save(function(err, post){
			if(err){next(err);}
			res.json(comment);
		});
	});	
});

router.get('/posts/:post/comments/:comment', function(req, res){ //get a specific comment
	res.json(req.comment);
});

router.put('/posts/:post/comments/:comment/upvote', function(req, res){ //upvote a comment
	req.comment.upvote(function(err, comment){
		if(err){ return next(err);}
		res.json(comment);
	});	

});

router.put('/posts/:post/update', function(req, res){ //update a post
	var post = req.post;
	post.title = req.body.title;
	post.contents = req.body.contents;

	post.save(function(err){
		if(err){ return next(err);}

		res.json(post);
	});
});

router.put('/posts/:post/comments/:comment/update', function(req, res){ //update a comment
	var comment = req.comment;
	comment.author = req.body.author;
	comment.body = req.body.body;

	comment.save(function(err){
		if(err){ return next(err);}

		res.json(comment);
	});
});


router.delete('/posts/:post', function(req, res){ //delete a post
	var post = req.post;
	post.remove(function(err){
		if(err){return next(err);}

		res.json(post);
	});
});

router.delete('/posts/:post/comments/:comment', function(req, res){ //delete a comment
	var comment = req.comment;
	comment.remove(function(err){
		if(err){return next(err);}
		res.json(comment);
	});
});