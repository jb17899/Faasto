import express from "express"
import supabase from "./supabase.js";
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import {Strategy} from "passport-local";
import dotenv from "dotenv";
dotenv.config();
const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
const app = express();
const port = 3012;
const saltRounds = 10;
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));
app.use(session({
    secret:process.env.SECRET_WORD,
    resave:false,
    saveUninitialized:false,
    cookie:{
        maxAge:1000*60*60*24,
      }
}));
app.use(passport.initialize());
app.use(passport.session());
app.get("/",(req,res)=>{
  var loggedIn =false;
    if(req.user){
        loggedIn =true;
  }
res.render("index.ejs",{
    login:loggedIn
});
});
app.get("/login",(req,res)=>{
    var loggedIn =false;
    if(req.user)loggedIn = true;
    res.render("login.ejs",{
        login:loggedIn
    });
});
app.get("/signsup",(req,res)=>{
    res.render("sign_up.ejs",{
     login:(req.user)?true:false   
    });
})
app.post("/signin",passport.authenticate("local",{
    successRedirect:"/",
    failureRedirect:'/login'
}));

passport.use('local',
    new Strategy(async function (username,password,cb){
        const {data,error} = await supabase
        .from('userm')
        .select()
        .eq('email',username)
        bcrypt.compare(password,data[0].password,(err,result)=>{
         if(err) throw err;
         if(result){
             return cb(null,data[0]);
            }
            else{
             return cb("Password not matched");
            }
        })
    })
)
app.post("/signsin",async(req,res)=>{
    const username = req.body.username;
    const email = req.body.email;
    const phone_number = req.body.phone.toString();
    const password = req.body.password;
    try{
    bcrypt.hash(password,saltRounds,async(err,hash)=>{
        if (err) throw err;
        const {data,error} = await supabase
        .from('userm')
        .insert([
            {name:username,email:email,phone_number:phone_number,password:hash},
        ])
        .select()
        if(error){
            console.log(error);
            res.redirect('/signsup');
        }
        else{
        req.login(data[0],(err)=>{
            if(err) throw err;
            res.redirect('/');
        })}
    })
    }
    catch(errs){
        console.log(errs);
    }
});
app.post("/order_now",async(req,res)=>{
  const restaurent_name = req.body.restaurent;
  const item_name = req.body.food_item;
  const address = req.body.address;
  var date = new Date();
  var day = date.getDate();
  var month = date.getMonth();
  var year = date.getFullYear();
  var dates =months[month]+' '+day+','+year;
  const {data,error} = await supabase
  .from('restaurents')
  .select()
  .eq('name',restaurent_name)
  .eq('food',item_name)
  try{
    if(data[0].availability==true){
        const {datas,error} = await supabase
        .from('orders')
        .insert([
            {user_id:req.user.id,restaurent_id:data[0].id,address:address,price:data[0].price,time:dates}
        ])
        .select()
        if(error){
            console.log(error);
            res.redirect('/');
        }
        else{
        res.render("order_been_accept.ejs");
        }
    }
  }
  catch(err){
    if(err) console.log(err);
    res.redirect('/');
  }
  }
);
app.get("/order_now",(req,res)=>{
    if(req.isAuthenticated()){
    res.render("order_now.ejs",{
        login:(req.user)?true:false
    });}
    else{
        res.redirect('/login');
    }
})
app.get("/order",async(req,res)=>{
    var array=[];
    if(req.user){
    const {data,error} = await supabase
    .from('orders')
    .select()
    .eq('user_id',req.user.id)
    array=data;
    }
    res.render("orders.ejs",{
        items:(req.user)?array:false,
        login:(req.user)?true:false
    });
});
app.get("/faq",(req,res)=>{
    res.render("faq.ejs",{
        login:(req.user)?true:false
    });
});
app.get("/about",(req,res)=>{
    res.render("about_us.ejs",{
        login:(req.user)?true:false
    });
});
app.get("/profile",(req,res)=>{
    res.render("profile.ejs",{
        name:req.user.name,
        login:(req.user)?true:false,
    });
})
passport.serializeUser((user,cb)=>{
cb(null,user);}
)
passport.deserializeUser((user,cb)=>{
    cb(null,user);
})

app.listen(port,(err)=>{
    if (err) throw err;
    console.log(`server is running perfectly on port ${port}`);
})