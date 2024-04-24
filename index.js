import express from "express"
import pg from "pg"
const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
const app = express();
const port = 3012;
const db = new pg.Client({
    user:"postgres",
    host:"localhost",
    database:"postgres",
    password:"admin",
    port:5432
});
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));
db.connect();
const user={
    name:"",
    error:false,
    err_string:"",
    err:function(){
        if(user.error == false){
            return false;
        }
        else{
            return this.err_string;
        }
    }
}
const login={
    bool_login:false,
    login_name:"",
    login:()=>{
        if(!login.bool_login){
            return false;     
        }
        else{
            return this.login_name;
        }
    }
}
app.get("/",(req,res)=>{
    res.render("index.ejs",{login:login.bool_login});
});
app.get("/login",(req,res)=>{
    res.render("login.ejs",{
        login:login.bool_login
    });
});
app.get("/signsup",(req,res)=>{
    res.render("sign_up.ejs",{
        error:user.err(),
        login:login.bool_login
    });
})
app.post("/signin",async(req,res)=>{
   console.log(req.body);
   var username_email = req.body.username;
   var password = req.body.password;
   const results = await db.query("SELECT name from users where name = $1 and password = $2 or email = $1 and password  = $2",[username_email,password]);
   console.log(results.rows);
   if(results.rows[0]){
    user.name = results.rows[0].name;
login.bool_login=true;
setTimeout(()=>{ 
    res.redirect("/");
},300);}
else{
    res.redirect("/login");
}
});
app.post("/signsin",async(req,res)=>{
    console.log(req.body);
    const username = req.body.username;
    const email = req.body.email;
    const phone = req.body.phone;
    const password = req.body.password;
    try{
    const results  = await db.query("INSERT INTO users(name,email,phone_number,password) VALUES($1,$2,$3,$4)",[username,email,phone,password]);
    user.name = username;
    login.bool_login=true;
    res.redirect("/order_now");}
    catch{
        user.error=true;
        user.err_string="write truthfully please!";
        res.redirect('/signsup');
    }

});
app.post("/order_now",async(req,res)=>{
  console.log(req.body);
  const restaurent_name = req.body.restaurent;
  var item = req.body.food_item;
  item = item[0].toUpperCase()+item.slice(1);
  const address = req.body.address;
  const results = await db.query("select id,price from restaurents where food=$1 and name = $2",[item,restaurent_name]);
  var food_id = results.rows[0].id;
  var price = results.rows[0].price;
  var date = new Date();
  var day = date.getDate();
  var month = date.getMonth();
  var year = date.getFullYear();
  var dates =months[month]+' '+day+','+year;
  console.log(dates);
  const ids = await db.query("SELECT id from users where name = $1",[user.name]);
  const result = await db.query("INSERT INTO orders(user_id,restaurent_id,address,price,times) VALUES($1,$2,$3,$4,$5)",[ids.rows[0].id,food_id,address,price,dates]);
  res.render("order_been_accept.ejs");
  }
);
app.get("/order_now",(req,res)=>{
    res.render("order_now.ejs",{
        login:login.bool_login
    });
})
app.get("/order",async(req,res)=>{
    const results = await db.query("select * from orders");
    const array = results.rows;
    console.log(array);
    res.render("orders.ejs",{
        items:results.rows,
        login:login.bool_login
    });
});
app.get("/faq",(req,res)=>{
    res.render("faq.ejs",{
        login:login.bool_login
    });
});
app.get("/about",(req,res)=>{
    res.render("about_us.ejs",{
        login:login.bool_login
    });
});
app.get("/profile",(req,res)=>{
    res.render("profile.ejs",{
        name:user.name,
        login:user.name
    });
})
app.listen(port,(err)=>{
    if (err) throw err;
    console.log(`server is running perfectly on port ${port}`);
})