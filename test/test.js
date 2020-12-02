let chai = require("chai");
let server = require("../app");
let chaiHttp = require("chai-http")

chai.should();

chai.use(chaiHttp);

describe("Test App", () => {

    describe("GET /", () =>{
        it("it should GET homepage", (done) => {
            chai.request(server)
            .get("/")
            .end((err, res) => {
                res.should.have.status(200);
                done();
            })
        })
    })

    describe("GET /registeremp", () =>{
        it("it should GET register employ page", (done) => {
            chai.request(server)
            .get("/registeremp")
            .end((err, res) => {
                res.should.have.status(200);
                done();
            })
        })
    })

    describe("GET /loginemp", () =>{
        it("it should GET employ login page", (done) => {
            chai.request(server)
            .get("/loginemp")
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a("object");
               // res.body.should.have.property("user").eq("emp");
                done();
            })
        })
    })

    describe("GET /employee/:id", () =>{
        it("it should GET employ by id", (done) => {
            const empid = "5f779cbd225e5b2e002152c6";
            chai.request(server)
            .get("/employee/" + empid)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a("object");
                done();
            })
        })
    })

    describe("GET /logoutemp", () =>{
        it("it should GET homepage", (done) => {
            chai.request(server)
            .get("/logoutemp")
            .end((err, res) => {
                res.should.have.status(200);
                done();
            })
        })
    })
    
    describe("GET /resumeupd/:id", () =>{
        it("it should GET resume update page for selected id", (done) => {
            const empid = "5f75038d42d7944ef0939c7c";
            chai.request(server)
            .get("/resumeupd/"+empid)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a("object");
                done();
            })
        })
    })
    
    describe("GET /resumedelete/:id", () =>{
        it("it should DELETE employ", (done) => {
            const empid = "5f75038d42d7944ef0939c7c";
            chai.request(server)
            .get("/resumedelete/"+empid )
            .end((err, res) => {
                res.should.have.status(200);
                done();
            })
        })
    })
    
    describe("GET /resume/:id", () =>{
        it("it should GET resume", (done) => {
            const empid = "5f75038d42d7944ef0939c7c";
            chai.request(server)
            .get("/resume/" + empid)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a("object");
                done();
            })
        })
    })

    describe("GET /showjobman", () =>{
        it("it should GET jobs", (done) => {
            chai.request(server)
            .get("/showjobman")
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a("object");
                done();
            })
        })
    })

    describe("POST /registeremp", () =>{
        it("it should POST employ", (done) => {
            const emp = {
                username:"E12",
                name : "Mike",
                email: "an@gmail.com",
                emp_edu: "B.Tech",
                emp_salary: 50000,
                experience: "12years",
                location: "umbai",
                phone: 123456789,
                availability: "yes"
            };
            chai.request(server)
            .post("/regiteremp")
            .send(emp)
            .end((err, res) => {
                res.body.should.be.a("object");
                done();
            })
        })
    })

    describe("POST /resumeupdate/:id", () =>{
        it("it should update values of employ", (done) => {
            const empid = "5f75038d42d7944ef0939c7c";
            const emp = {
                username:"E12",
                email: "an@gmail.com",
                emp_edu: "B.Tech",
                emp_salary: 50000,
                experience: "13years",
                location: "Mumbai",
                phone: 123456789,
                availability: "no"
            };
            chai.request(server)
            .post("/resumeupdate/" + empid)
            .send(emp)
            .end((err, res) => {
                res.body.should.be.a("object");
                done();
            })
        })
    })

    describe("POST /registerman", () =>{
        it("it should POST manager", (done) => {
            const man = {
                username:"M01",
                email: "angel@gmail.com",                
            };
            chai.request(server)
            .post("/regiterman")
            .send(man)
            .end((err, res) => {
                res.body.should.be.a("object");
                done();
            })
        })
    })

    describe("POST /registercli", () =>{
        it("it should POST client", (done) => {
            const cli = {
                username: "C21",
                email: "client@gmail.com",
                name : "John",
                companycontact : 172123314,
                companyname : "ABC Company"              
            };
            chai.request(server)
            .post("/regitercli")
            .send(cli)
            .end((err, res) => {
                res.body.should.be.a("object");
                done();
            })
        })
    })

    describe("POST /staffreq/:id", () =>{
        it("it should POST Staffing Request", (done) => {
            const id = "5f779bd1d52b7061e8060e79";
            const job = {
                title: "Software Developer",
                type: "Full Time",
                location: "Mumbai",
                salary: 40000,
                postedby: id,
                companyname: "ABC",
                companycontact: 212173314,
                duration: "1 month"              
            };
            chai.request(server)
            .post("/staffreq/" + id)
            .send(job)
            .end((err, res) => {
                res.body.should.be.a("object");
                done();
            })
        })
    })

    
    describe("POST /editreq/:id", () =>{
        it("it should POST Staffing Request", (done) => {
            const id = "5f76fabd3da2ca4284648f45";
            const job = {
                title: "Software Developer",
                type: "Full Time",
                location: "Mumbai",
                salary: 60000,
                postedby: id,
                companyname: "ABC",
                companycontact: 2000999,
                duration: "2 month"              
            };
            chai.request(server)
            .post("/editreq/" + id)
            .send(job)
            .end((err, res) => {
                res.body.should.be.a("object");
                done();
            })
        })
    })

})