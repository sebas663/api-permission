var mongoose     = require("mongoose");
// set Promise provider to bluebird
mongoose.Promise = require('bluebird');
var Permission   = require('../models/permissionType');
//Require the dev-dependencies
var chai         = require('chai');
var chaiHttp     = require('chai-http');

chai.use(chaiHttp);

var should = chai.should();

//For work whit environment variable.
require('dotenv').config();

var server  = process.env.API_LOCALHOST;

describe('Permissions', () => {
    beforeEach(() => {
        Permission.remove({}, (err) => { 
           done();         
        });
    });
  describe('/GET permissions', () => {
      it('it should GET all the permissions', () => {
             chai.request(server)
            .get(process.env.API_RESOURCE)
            .then(function (res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.a('array');
                expect(res.body.length).to.be.eql(0);
            })
            .catch(function (err) {
                console.log("Promise Rejected");
            });
      });
  });

  describe('/POST permission', () => {
      it('when missing item in payload, should return a 400 ok response and a single error', () => {
        var permission = {
                code: "MEDICO"
            }
            chai.request(server)
            .post(process.env.API_RESOURCE)
            .send(permission)
            .then(function (res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.a('object');
                expect(res.body).to.have.property('errors');
                expect(res.body.errors).to.have.property('description');
            })
            .catch(function (err) {
                console.log("Promise Rejected");
            })
      });
      it('it should POST a permission ', () => {
        var permission = {
                code: "MEDICO",
                description: "Medico"
            }
            chai.request(server)
            .post(process.env.API_RESOURCE)
            .send(permission)
            .then(function (res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.a('object');
                expect(res.body).to.have.property('message').eql('Permission successfully added!');
                expect(res.body.permission).to.have.property('code');
                expect(res.body.permission).to.have.property('description');
                expect(res.body.permission).to.have.property('enabled');
            })
            .catch(function (err) {
                console.log("Promise Rejected");
            });
      });
  });
  describe('/GET/:id permission', () => {
      it('it should GET a permission by the given id', () => {
        var permission = new Permission({ 
                              code: "WEBADMIN",
                              description: "Administrador web"
                            });
        permission.save((err, permission) => {
            chai.request(server)
            .get(process.env.API_RESOURCE + '/' + permission.id)
            .send(permission)
            .then(function (res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.a('object');
                expect(res.body.permission).to.have.property('code');
                expect(res.body.permission).to.have.property('description');
                expect(res.body.permission).to.have.property('enabled');
                expect(res.body).to.have.property('_id').eql(permission.id);
            })
            .catch(function (err) {
                console.log("Promise Rejected");
            });
        });

      });
  });
  describe('/PUT/:id permission', () => {
      it('it should UPDATE a permission given the id', () => {
        var permission = new Permission({ 
                            code: "MEDICOP",
                            description: "Medico pediatra"
                            })
        permission.save((err, permission) => {
                chai.request(server)
                .put(process.env.API_RESOURCE + '/' + permission.id)
                .send({ code: "MEDICOP",
                        description: "Medico pediatrico"
                    })
                .then(function (res) {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.a('object');
                    expect(res.body).to.have.property('message').eql('Permission successfully updated.');
                    expect(res.body.permission).to.have.property('description').eql("Medico pediatrico");
                })
                .catch(function (err) {
                    console.log("Promise Rejected");
                });
          });
      });
  });
  /*
  * Test the /DELETE/:id route
  */
  describe('/DELETE/:id permission', () => {
      it('it should DELETE a permission given the id', () => {
        var permission = new Permission({  
                            code: "MAS",
                            description: "Masajista"
                            })
        permission.save((err, permission) => {
                chai.request(server)
                .DELETE(process.env.API_RESOURCE + '/' + permission.id)
                .then(function (res) {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.a('object');
                    expect(res.body).to.have.property('message').eql('Permission successfully deleted.');
                    expect(res.body.result).to.have.property('ok').eql(1);
                })
                .catch(function (err) {
                    console.log("Promise Rejected");
                });
          });
      });
  });
});