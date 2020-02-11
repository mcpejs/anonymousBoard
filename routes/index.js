const express=require('express')
const router=express.Router()
db=require('../db/db')

router.get('/',function(req,res){
    var readallquery=`SELECT id,nickname,title,content,wtime FROM posts`
    db.query(readallquery,function(err,posts,fields){
        res.render('../views/main',{posts:posts})
    })
    
})

router.get('/create_post',function(req,res){
    res.sendFile("c:\\Users\\Jiho\\Documents\\node\\MyProject\\anonymousPost\\views\\create.html")
})

router.get('/view_post/:id',function(req,res){
    var post;
    var readsinglequery=`SELECT id,nickname,title,content,wtime FROM posts WHERE id=${req.params.id}`
    var commentsquery=`SELECT id,nickname,content,wtime FROM comments WHERE postid=${req.params.id}`
    db.query(readsinglequery,function(err,postdata,fields){
        post=postdata[0]
        db.query(commentsquery,function(err,commentsdata,fields){
            res.render('../views/view',{post:post,comments:commentsdata})
        })
        
    })
})

router.get('/update_post/:id',function(req,res){
    res.render('../views/update',{id:req.params.id})
})

router.get('/delete_post/:id',function(req,res){
    res.render('../views/delete',{id:req.params.id})
})

router.get('/delete_comment/:commentid',function(req,res){
    res.render('../views/deletecomment',{commentid:req.params.commentid})
})

module.exports=router