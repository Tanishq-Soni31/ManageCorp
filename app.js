// This is the Main app.js File
// All routes And logic are  handled in this file



/****************************************************** Requiring NPM packages ***************************************************/
const express = require('express');
const bodyParser = require("body-parser");
var mongoose = require("mongoose");
const ejs = require("ejs");
const port = 3000;
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const ObjectId = require('mongodb').ObjectID;
const cookie = require('cookie-parser');
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function(req,file,cb){
    cb(null, './views/uploads/')
  },
  filename : function(req,file,cb){
    cb(null, file.originalname);
  }
})
const upload = multer({storage : storage});
const app = express();

app.use(cookie());
app.use(express.static("public"));
app.use(express.static("views"))
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

//Session configure
app.use(session({
  secret: "youshallnotpass",
  resave: false,
  saveUninitialized: false
}));

//Passport configuration
app.use(passport.initialize());
app.use(passport.session());

// connecting to MongoDB Database
mongoose.connect("mongodb://localhost:27017/tpsDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(() => console.log("Connected to mDB"))
  .catch((e) => console.log("Error :", e));
mongoose.set('useCreateIndex', true);

// home Route
app.get("/", function(req, res) {
  res.render("home");
});
/******************************************************************** Emplyee Schema ***************************************************************/
// Employee DataBase Base Schema
const employeeSchema = new mongoose.Schema({
  username: String,
  name: String,
  email: String,
  password: String,
  emp_edu: String,
  emp_salary: Number,
  experience: String,
  skills: String,
  location: String,
  phone: Number,
  availability: String,
  imageemp : String
});

/*************************************************************** Enabling passport JS ************************************************************************/

employeeSchema.plugin(passportLocalMongoose);
const Employee = mongoose.model("Employee", employeeSchema);

passport.use(Employee.createStrategy());
passport.serializeUser(Employee.serializeUser());
passport.deserializeUser(Employee.deserializeUser());

/*********************************************************** Defining Routes **************************************************************************/
// Route for Register Employee
app.get("/registeremp", function(req, res) {
  res.render("registeremp");
});

// Route for Register Login
app.get("/loginemp", function(req, res) {
  //res.render("loginemp");
  res.render("login", {
    user: "emp"
  });

});

// Route for employee home (Resume page)
app.get("/employee/:id", function(req, res) {

  if (req.cookie.logged) {
    res.redirect("/resume/" + req.params.id)
    //res.render('employee');
  } else {
    res.redirect('/loginemp');
  }
});

// Logut Route For employee
app.get("/logoutemp", function(req, res) {
  res.clearCookie("logged");

  req.logout();
  res.redirect("/");
});

/************************************************************* Register Employee   *******************************************************************************************/

app.post("/registeremp", upload.single("imageemp") , function(req, res) {
  console.log(req.file)
  Employee.register({
    username: req.body.username,
    name : req.body.name,
    email: req.body.email,
    emp_edu: req.body.emp_edu,
    emp_salary: req.body.emp_salary,
    experience: req.body.experience,
    skills : req.body.skills,
    location: req.body.location,
    phone: req.body.phone,
    availability: req.body.availability,
    imageemp : req.file.filename
  }, req.body.password, async function(err, user) {
    if (err) {
      res.render("errorhandling", {err : err , route : "registeremp"});
    } else {
      const {
        user
      } = await Employee.authenticate()(req.body.username, req.body.password.toString());
      console.log(user._id);
      res.cookie("logged",user._id.toString());
      //console.log(req.cookies.logged);
      if (user == false) {
        res.render("errorhandling", {
          err: "Null user"
        });
      } else {

        res.render("resume", {
          resumes: user,
          client: "no"
        });
      }
    }
  });
});


/*************************************************************Login Employee    *******************************************************************************************/


app.post("/loginemp", async function(req, res) {

  const {
    user
  } = await Employee.authenticate()(req.body.username, req.body.password.toString());
  console.log(user);
  if(user === false){
    res.render("errorhandling" , {err : "Not Authorized User" , route : "/"})
  }else{
    res.cookie("logged",user._id.toString());
    console.log(req.cookies.logged);
    res.render("resume", {
      resumes: user,
      client: "no"
    });
  }
});


/************************************************************* Updaing Resume for Employee   *******************************************************************************************/


// Finding Employee for resume Edit
app.get("/resumeupd/:id", function(req, res) {
  
  if (req.cookies.logged) {
    
    console.log(req.cookies.logged);
     var id = req.cookies.logged;
    let route = "/resumeupd/" + id;
    Employee.findById(id, function(err, resumes) {
      if (err) {
        res.render("errorhandling", {
          err: err,
          route: route
        });
      } else {
        if (resumes) {
          res.render("resumeupdate", {
            resumes: resumes
          });
        } else {
          res.render("errorhandling", {
            err: "user not found",
            route: route
          });
        }
      }
    })
  } else {
    res.redirect('/loginemp');
  }

})

// Resume update
app.post("/resumeupdate/:id", upload.single("imageemp") ,function(req, res) {
  if (req.cookies.logged) {
    console.log("ppppppp");
     var id = req.params.id;
    let route = "/resumeupdate/" + id;
    Employee.findByIdAndUpdate(id, {
      username: req.body.username,
      name : req.body.name,
      email: req.body.email,
      emp_edu: req.body.emp_edu,
      emp_salary: req.body.emp_salary,
      experience: req.body.experience,
      skills : req.body.skills,
      location: req.body.location,
      phone: req.body.phone,
      availability: req.body.availability,
      imageemp : req.file.filename
    }, function(err, empfound) {
      if (err) {
        res.render("errorhandling", {
          err: err,
          route: route
        });
      } else {
        if (empfound) {
          res.render("resume", {
            resumes: empfound,
            client: "no"
          })
        } else {
          res.render("errorhandling" , {err : "no user found" , route : route});
        }
      }
    });
  } else {
    res.redirect('/loginemp');
  }

});


/************************************************************* Deleting Resume For Employee   *******************************************************************************************/
app.get("/resumedelete/:id", function(req, res) {
  if (req.cookies.logged) {

     var id = req.cookies.logged;
    let route = "/resumedelete/" + id;
    Employee.findByIdAndDelete(id, function(err, delObj) {
      if (err) {
        res.render("errorhandling", {
          err: err,
          route: route
        });
      } else {
        res.redirect("/logoutemp");
      }
    })
  } else {
    res.redirect('/loginemp');
  }

})

/*************************************************************  Resume For Emplyee  *******************************************************************************************/


app.get("/resume/:id", function(req, res) {
  if (req.cookies.logged) {
     var id = req.cookies.logged;
    let route = "/resume" + id;
    Employee.findById(id, function(err, resume) {
      if (err) {
        res.render("errorhandling", {
          err: err,
          route: route
        });
      } else {
        res.render("resume", {
          resumes: resume,
          client: "no"
        })
      }
    })
  } else {
    res.redirect('/loginemp');
  }

})

app.get("/errr", function(req, res) {
  res.render("errorhandling", {
    err: "err",
    route: "/showjobman"
  })
})


/************************************************************* Manager Schema For DataBase   *******************************************************************************************/

const managerSchema = new mongoose.Schema({
  email: String,
  name: String,
  username: String,
  password: String
});

/************************************************************* Enabling Passport JS for Manager   *******************************************************************************************/

managerSchema.plugin(passportLocalMongoose);
const Manager = mongoose.model("Manager", managerSchema);

// passport initialize for Manager
passport.use(Manager.createStrategy());
passport.serializeUser(Manager.serializeUser());
passport.deserializeUser(Manager.deserializeUser());

// Register route for manager
app.get("/registerman", function(req, res) {
  res.render("registerman");
});

// login route for login
app.get("/loginman", function(req, res) {
  //res.render("loginman");
  res.render("login", {
    user: "man"
  });
});

// route for manager Home
app.get("/manager", function(req, res) {
  if (req.cookies.logged) {
    res.redirect('showjobman');
  } else {
    res.redirect('loginman');
  }
});

// route for logout manager
app.get("logoutman", function(req, res) {
  res.clearCookie("logged");
  req.logout();
  res.redirect("home");
})

/*************************************************************  Register For Manager  *******************************************************************************************/


app.post("/registerman", function(req, res) {
  Manager.register({
    username: req.body.username,
    name: req.body.name,
    email: req.body.email

  }, req.body.password, async function(err, user) {
    if (err) {
      res.render("errorhandling", {err : err , route : "/registerman"});
    } else {
      const {
        user
      } = await Manager.authenticate()(req.body.username, req.body.password.toString());
      console.log(user);
      res.cookie("logged",user._id.toString());
      console.log(req.cookies.logged);
      if (user == false) {
        res.render("errorhandling", {
          err: "User not found",
          route: "/loginman"
        });
      } else {
        res.redirect("showjobman");
      }
    }
  });
});

/************************************************************* Login For Manager   *******************************************************************************************/

app.post("/loginman", async function(req, res) {
  const {
    user
  } = await Manager.authenticate()(req.body.username, req.body.password.toString());
  console.log(user);
  if(user === false){
    res.render("errorhandling" , {err : "Not Authorized User" , route : "/"})
  }else{
  res.cookie("logged",user._id.toString());
  console.log(req.cookies.logged);
  if (user == false) {
    res.render("errorhandling", {
      err: "Null user"
    });
  } else {
    res.redirect("showjobman");
  }
}
});




/************************************************************* Client Schema For DataBase   *******************************************************************************************/

const clientSchema = new mongoose.Schema({
  Email: String,
  name: String,
  username: String,
  password: String,
  companyname: String,
  companycontact: Number,
  Jobs_Posted: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff_req'
  }]
});


/************************************************************* Enabling Passport JS for client   *******************************************************************************************/

clientSchema.plugin(passportLocalMongoose);
const Client = mongoose.model("Client", clientSchema);

passport.use(Client.createStrategy());
passport.serializeUser(Client.serializeUser());
passport.deserializeUser(Client.deserializeUser());

// register client route
app.get("/registercli", function(req, res) {
  res.render("registercli");
});

// route login client
app.get("/logincli", function(req, res) {
  //res.render("logincli");
  res.render("login", {
    user: "cli"
  });
});


// route for client home (staffing request)
app.get("/client/:id", function(req, res) {
var id = req.cookies.logged;
  res.redirect("/staffreqq/" + id);
});

// route for client logout
app.get("/clilogout", function(req, res) {
  res.clearCookie("logged");
  req.logout();
  res.redirect("/");
})

/*************************************************************  Register Client  *******************************************************************************************/

app.post("/registercli", function(req, res) {
  Client.register({
    username: req.body.username,
    Email: req.body.email,
    name: req.body.name,
    companyname: req.body.companyname,
    companycontact: req.body.companycontact
  }, req.body.password, async function(err, user) {
    if (err) {
      res.render("errorhandling", {err : err , route : "/registercli"});
    } else {
      const {
        user
      } = await Client.authenticate()(req.body.username, req.body.password.toString());
      console.log(user);
      res.cookie("logged",user._id.toString());
      console.log(req.cookies);
      if (user == false) {
        res.render("errorhandling", {
          err: "User not found",
          route: "/logincli"
        });
      } else {
        res.redirect("/staffreqq/" + user._id);
      }
    }
  });
});

/*************************************************************  Login Client   *******************************************************************************************/

app.post("/logincli", async function(req, res) {
  const {
    user
  } = await Client.authenticate()(req.body.username, req.body.password.toString());
  console.log(user);
  if(user === false){
    res.render("errorhandling" , {err : "Not Authorized User" , route : "/"})
  }else{
  res.cookie("logged",user._id.toString());
    //var id = req.cookies.logged;
  if (user == false) {
    res.render("errorhandling", {
      err: "Null user"
    });
  } else {
    res.redirect("/staffreqq/" + user._id);
  }
}
});

/************************************************************* Staffing Request Schema   *******************************************************************************************/
// make staffing request
const Staff_reqSchema = new mongoose.Schema({
  title: String,
  type: String,
  location: String,
  salary: Number,
  duration: String,
  companyname: String,
  companycontact: Number,
  status: String,
  applicants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  }],
  postedby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  }
});
const Staff_req = new mongoose.model("Staff_req", Staff_reqSchema);

/************************************************************* Show Staffing Request   *******************************************************************************************/


app.get("/staffreq/:id", function(req, res) {
  console.log(req.cookies)
  if (req.cookies.logged) {
    var id = req.cookies.logged;
    let route = "/staffreq/" + id;
    Employee.find({
      availability: {
        $ne: "no"
      }
    }, function(err, employs) {
      if (err) {
        res.render("errorhandling", {
          err: err,
          route: route
        });

      } else {
        res.render("staffreq", {
          employs: employs,
          id: id
        });
      }
    });

  } else
  {
   res.redirect("/logincli");
  }

});

/************************************************************* Create Staffing Request   *******************************************************************************************/


app.post("/staffreq/:id", function(req, res) {
  if (req.cookies.logged) {
       var id = req.cookies.logged;
      let route = "/staffreq/" + id;
      if (typeof req.body.employ === "undefined") {
        res.render("errorhandling", {
          err: "Select atleast one employ",
          route: route
        });
      } else if (req.body.employ.length < 4) {
        const j = new Staff_req({
          title: req.body.title,
          type: req.body.type,
          location: req.body.location,
          salary: req.body.salary,
          postedby: req.params.id,
          companyname: req.body.companyname,
          companycontact: req.body.companycontact,
          duration: req.body.duration
        });
        j.save((err, user) => {

          console.log(id);
          req.body.employ.forEach((em) => {
            console.log(typeof em);

            console.log(em);

            Staff_req.findByIdAndUpdate(id, {
              $push: {
                applicants: new ObjectId(em)
              }
            }, function(err) {
              if (err) {
                res.render("errorhandling", {
                  err: err,
                  route: route
                });
              } else {
                console.log("P");
              }

            });

          });
          console.log("find :"+id);
          Client.findByIdAndUpdate( id, {
            $push: {
              Jobs_Posted: id
            }
          }, function(err) {
            if (err) {
              res.render("errorhandling", {
                err: err,
                route: route
              });
            } else {
              console.log("P");
            }

          });
        })

        res.redirect("/staffreqq/" + id);
      } else {
        res.render("errorhandling", {
          err: "Cannnot select more than 3 employ",
          route: route
        });
      }
      //res.redirect("/staffreq");


  } else
  {
   res.redirect("/logincli");
  }

});

/********************************************************** Delete Staffing Request    ******************************************************************************/


app.get("/deletereq/:id/:idcli", function(req, res) {
  if (req.cookies.logged) {
    var id = req.params.id;
    let route = "/staffreqq/" + req.params.idcli;
    Staff_req.findByIdAndDelete(id, function(err, delObj) {
      if (err) {
        res.render("errorhandling", {
          err: err,
          route: route
        });
      } else {
        res.redirect("/staffreqq/" + req.params.idcli);
      }
    })


  } else
  {
   res.redirect("/logincli");
  }

})


/********************************************************** Edit Staffing Request   ******************************************************************************/

app.get("/editreq/:id/:cliid", function(req, res) {
  console.log("get: " + req.cookies.logged)
  if (req.cookies.logged) {
    var id = req.params.id;
    res.render("editreq", {
      id: id,
      cliid : req.params.cliid
    });
  } else
  {
   res.redirect("/logincli");
  }

});

app.post("/editreq/:id/:cliid", function(req, res) {
  console.log(req.params)
  if (req.cookies.logged) {
    var id = req.params.id;
    let route = "/editreq/" + id;
    Staff_req.findByIdAndUpdate(id, {
      title: req.body.title,
      type: req.body.type,
      location: req.body.location,
      salary: req.body.salary,
      postedby: req.params.cliid,
      companyname: req.body.companyname,
      companycontact: req.body.companycontact,
      duration: req.body.duration
      },
      (err, staffr) => {
        if (!err) {
          res.redirect("/staffreqq/" + req.params.cliid);
        } else {
          res.render("errorhandling", {
            err: err,
            route: route
          });
        }
      }
    )


  } else
  {
   res.redirect("/logincli");
  }

});


/***************************************************** view all staffing request ******************************************************************/

// view all staffing request
app.get("/staffreqq/:id", function(req, res) {
  if (req.cookies.logged) {
    var id = req.cookies.logged;
    let route = "/staffreqq/" + id;
    console.log(id);
    Staff_req.find({
      postedby: id
    }, function(err, job) {
      if (err) {
        res.render("errorhandling", {
          err: err,
          route: route
        });
      } else {
        if (!job) {
          res.render("errorhandling", {
            err: "No Staffing request Found",
            route: route
          });
        } else {
          res.render("showjob", {
            jobs: job,
            id: id
          })

        }
      }

    })


  } else
  {
   res.redirect("/logincli");
  }

});


/***************************************************** view Resume******************************************************************/


app.get("/viewresume/:id", function(req, res) {
  if (req.cookies.logged) {
    var id = req.params.id;
    let route = "/viewresume/" + id;
    Employee.findById(id, function(err, resume) {
      if (err) {
        res.render("errorhandling", {
          err: err,
          route: route
        });
      } else {
        console.log(resume)
        res.render("resume", {
          resumes: resume,
          client: "yes"
        })
      }
    })


  } else
  {
   res.redirect("/loginemp");
  }


})


/***************************************************** Showing Staffing Request For Manager  ******************************************************************/


app.get("/showjobman", function(req, res) {
  if (req.cookies.logged) {

    Staff_req.find({
      status: null
    }, function(err, job) {
      if (err) {
        res.render("errorhandling", {err : err , route : "/showjobman"})
      } else {
        if (!job) {
          res.render("errorhandling" , {err : "No Staffing request found" , route : "/showjobman"})
        } else {
          //res.send(job)
          //console.log(jobs);
          res.render("showjobman", {
            jobs: job
          })
        }
      }
    })

  } else
  {
   res.redirect("/loginman");
  }

})


/***************************************************** Validating Staffing Request By Manager  ******************************************************************/


app.post("/managerresponse/:id", function(req, res) {
  if (req.cookies.logged) {
  let idcookie = req.cookies.logged;
  let id = req.params.id;
    let route = "/managerresponse/" + id;
    Staff_req.findById(id, function(err, docs) {
      if (err) {
        res.render("errorhandling", {
          err: err,
          route: route
        });
      } else {
        docs.applicants.forEach((doc) => {
          Employee.findById(doc._id, function(err, emp) {
            if (emp.availability === "no") {
              Staff_req.findByIdAndUpdate(id, {
                status: "unable to fulfill"
              }, function(err, docs) {
                if (err) {
                  res.render("errorhandling", {
                    err: err,
                    route: route
                  });
                } else {
                  res.redirect("/showjobman");
                }
              })
            }
          })
        })
      }
    })
    if (req.body.reqstatus === "valid" || req.body.reqstatus === "filled") {
      Staff_req.findById(id, function(err, docs) {
        if (err) {
          res.render("errorhandling", {
            err: err,
            route: route
          });
        } else {
          docs.applicants.forEach((doc) => {
            Employee.findOneAndUpdate(id, {
              availability: "no"
            }, function(err, doc) {
              if (err) {
                res.render("errorhandling", {
                  err: err,
                  route: route
                })
              }
            })
          })
        }
      })
    }
    Staff_req.findByIdAndUpdate(id, {
      status: req.body.reqstatus
    }, function(err, docs) {
      if (err) {
        res.render("errorhandling", {
          err: err,
          route: route
        });
      } else {
        res.redirect("/showjobman");
      }
    })


  } else
  {
   res.redirect("/loginman");
  }

})

/***************************************************** Terminal Display ******************************************************************/

app.listen(port, () => {
  console.log(`Hosting at http://localhost:${port}`)

})

module.exports = app;

/****************************************** THAT'S ALL FOLKS !!! ******************************************************************************************/
