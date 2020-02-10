const express=require('express')
const mysql=require('mysql')
const app=express()

const db=mysql.createConnection({
    host     : 'localhost',
    user     : '유저이름',
    password : '비번',
    database : '데이터베이스이름',
    dateStrings: 'date'
})
db.connect()

app.set('view engine','ejs')
app.use(express.json());
app.use(express.urlencoded( {extended : true } ));

// 프론트뷰
app.get('/',function(req,res){
    var readallquery=`SELECT id,nickname,title,content,wtime FROM posts`
    db.query(readallquery,function(err,posts,fields){
        res.render(__dirname+'/views/main',{posts:posts})
    })
    
})

app.get('/create_post',function(req,res){
    res.sendFile(__dirname+'/views/create.html')
})

app.get('/view_post/:id',function(req,res){
    var post;
    var comemnts;
    var readsinglequery=`SELECT id,nickname,title,content,wtime FROM posts WHERE id=${req.params.id}`
    var commentsquery=`SELECT id,nickname,content,wtime FROM comments WHERE postid=${req.params.id}`
    db.query(readsinglequery,function(err,postdata,fields){
        post=postdata[0]
        db.query(commentsquery,function(err,commentsdata,fields){
            res.render(__dirname+'/views/view',{post:post,comments:commentsdata})
        })
        
    })
})

app.get('/update_post/:id',function(req,res){
    res.render(__dirname+'/views/update',{id:req.params.id})
})

app.get('/delete_post/:id',function(req,res){
    res.render(__dirname+'/views/delete',{id:req.params.id})
})


// 백엔드 api
app.post('/api/create_post',function(req,res){
    var nickname=req.body.nickname
    var title=req.body.title
    var content=req.body.content
    var password=req.body.password
    if(!(nickname&&title&&content&&Number(password))){
        // 정보가 잘못 제출되었을때
        res.status(401)
        res.send('<script type="text/javascript">alert("모든값은 입력되어야하고 비밀번호는 숫자여야합니다.");history.back();</script>')
        res.redirect('/')
        return
    }

    var createquery=`INSERT INTO posts(nickname,title,content,password,wtime) VALUES("${nickname}","${title}","${content}",${password},NOW())`
    db.query(createquery,function(err,result,fields){
        if(err){
            // 만약 에러가 있다면
            res.status(401)
            res.send(`<script type="text/javascript">alert("내용이 잘못되었습니다");history.back();</script>`)
        } else {
            // 만약 에러가 없다면
            res.status(200)
            res.send(`<script type="text/javascript">alert("성공적으로 작성되었습니다.");window.location.href = '/';</script>`)
        }
    })
})

app.post('/api/update_post',function(req,res){
    var id=req.body.id
    var submitpass=req.body.password

    var title=req.body.title
    var content=req.body.content

    if(!(title&&content&&submitpass)){
        // 정보가 잘못 제출되었을때
        res.status(401)
        res.send('<script type="text/javascript">alert("모든값은 입력되어야하고 비밀번호는 숫자여야합니다.");history.back();</script>')
        res.redirect('/')
        return
    }
    
    var getpassquery=`SELECT password FROM posts WHERE id=${id}`
    var updatequery=`UPDATE posts set title="${title}",content="${content}" where id=${id};`
    
    db.query(getpassquery,function(err,data,fields){
        var postpass=data[0].password
        if(postpass==submitpass){
            db.query(updatequery,function(err,data,fields){
                if(err){
                    // 만약 에러가 있다면
                    res.status(401)
                    res.send(`<script type="text/javascript">alert("내용이 잘못되었습니다");history.back();</script>`)
                } else {
                    // 만약 에러가 없다면
                    res.status(200)
                    res.send(`<script type="text/javascript">alert("성공적으로 수정되었습니다.");window.location.href = '/view_post/${id}';</script>`)
                }
            })
        } else {
            res.status(401)
            res.send(`<script type="text/javascript">alert("틀린 비밀번호입니다.");history.back();</script>`)
        }
    })
})

app.post('/api/delete_post',function(req,res){
    var id=req.body.id
    var submitpass=req.body.password

    var getpassquery=`SELECT password FROM posts WHERE id=${id}`
    var deletepostquery=`DELETE FROM posts WHERE id=${id}`
    var deletecommentsquery=`DELETE FROM comments WHERE postid=${id}`
    db.query(getpassquery,function(err,data,fields){
        var postpass=data[0].password
        if(postpass==submitpass){
            db.query(deletecommentsquery,function(e,d,f){})
            db.query(deletepostquery,function(err,data,fields){
                res.status(200)
                res.send(`<script type="text/javascript">alert("성공적으로 삭제되었습니다.");window.location.href = '/';</script>`)
            })
        } else {
            res.status(401)
            res.send(`<script type="text/javascript">alert("틀린 비밀번호입니다.");history.back();</script>`)
        }
    })
})

app.post('/api/create_comment',function(req,res){
    var nickname=req.body.nickname
    var content=req.body.content
    var postid=req.body.postid
    var password=req.body.password
    if(!(nickname&&content&&postid&&Number(password))){
        // 정보가 잘못 제출되었을때
        res.status(401)
        res.send('<script type="text/javascript">alert("모든값은 입력되어야하고 비밀번호는 숫자여야합니다.");history.back();</script>')
        res.redirect('/')
        return
    }
    
    var createcommentquery=`INSERT INTO comments(nickname,content,postid,password,wtime) VALUES("${nickname}","${content}","${postid}",${password},NOW())`
    var checkpostidquery=`select id from posts where id = ${postid};`
    db.query(checkpostidquery,function(err,rawdata,fields){
        if(err||!rawdata.length){
            // 만약 게시글 번호가 없다면
            res.status(401)
            res.send(`<script type="text/javascript">alert("없는 게시글 번호입니다.");history.back();</script>`)
        } else {
            // 만약 게시글 번호가 있다면
            db.query(createcommentquery,function(err,result,fields){
                if(err){
                    // 만약 작성중 에러가 있다면
                    res.status(401)
                    res.send(`<script type="text/javascript">alert("내용이 잘못되었습니다");history.back();</script>`)
                } else {
                    // 만약 에러가 없다면
                    res.status(200)
                    res.send(`<script type="text/javascript">alert("성공적으로 작성되었습니다.");window.location.href = '/view_post/${postid}';</script>`)
                }
            })
        }
    })
})

app.listen(3000)