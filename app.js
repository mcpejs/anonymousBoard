const express=require('express')
const app=express()
app.set('view engine','ejs')
app.use(express.json());
app.use(express.urlencoded( {extended : true } ));

// 프론트뷰
var indexRouter=require('./routes/index')
app.use('/',indexRouter)

// 백엔드 api
var apiRouter=require('./routes/api')
app.use('/api',apiRouter)

app.listen(3000)