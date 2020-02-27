const express=require('express')
const router=express.Router()
db=require('../db/db')

router.post('/create_post',function(req,res){
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

router.post('/update_post',function(req,res){
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

router.post('/delete_post',function(req,res){
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

router.post('/create_comment',function(req,res){
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

router.post('/delete_comment',function(req,res){
    var id=req.body.id
    var submitpass=req.body.password

    var getpassquery=`SELECT postid,password FROM comments WHERE id=${id}`
    var deletecommentquery=`DELETE FROM comments WHERE id=${id}`
    db.query(getpassquery,function(err,data,fields){
        var commentpass=data[0].password
        var postid=data[0].postid
        if(commentpass==submitpass){
            db.query(deletecommentquery,function(err,data,fields){
                res.status(200)
                res.send(`<script type="text/javascript">alert("성공적으로 삭제되었습니다.");window.location.href='/view_post/${postid}';</script>`)
            })
        } else {
            res.status(401)
            res.send(`<script type="text/javascript">alert("틀린 비밀번호입니다.");history.back();</script>`)
        }
    })
})

function ishaveEmpty(array){
    array.foreach(function(element){
    if(!element) return True
    })
    return False
}
module.exports=router
