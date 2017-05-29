var express      = require("express");
var mongoose     = require('mongoose');
// set Promise provider to bluebird
mongoose.Promise = require('bluebird');
var Permission   = require('../models/permissionType');
var validator    = require('express-route-validator')

// API routes
var router = express.Router();

router.route('/permissions')
  .get(function (req, res) {
        var promise = Permission.find().exec();
        promise.then(function(permissions) {
           response(res,permissions);
        })
        .catch(function(err){
            // just need one of these
            //console.log('error:', err);
            res.status(500).send(err.message);
        });
    })
  .post(validator.validate({
         body: {
                code:             { isRequired: true },
                description:      { isRequired: true }
              },
              headers: {
                'content-type': { isRequired: true, equals: 'application/json' }
              }
        }),
        function(req, res) {
            //console.log('POST');
            //console.log(req.body);
            var permission = new Permission({
                  code: req.body.code,
                  description: req.body.description
            });
            var promise = permission.save();
            promise.then(function(permission) {
              response(res,permission);
            })
            .catch(function(err){
              // just need one of these
              //console.log('error:', err);
              res.status(500).send(err.message);
            });
        }
  );

router.route('/permissions/:idPermission')
  .get(validator.validate({
          params: {
            idPermission: { isRequired: true , isMongoId: true }
          }
      }),
      function(req, res) {
          var promise = Permission.findById(req.params.idPermission).exec();
          promise.then(function(permission) {
            //console.log('GET /permissions/' + req.params.idPermission);
             response(res,permission);
          })
          .catch(function(err){
            // just need one of these
            //console.log('error:', err);
            res.status(500).send(err.message);
          });
       }
  )
  .put(validator.validate({
          params: {
            idPermission: { isRequired: true , isMongoId: true }
          }
      }),
      function(req, res) {
          //console.log('PUT');
          //console.log(req.body);
          var promise = Permission.findById(req.params.idPermission).exec();
          promise.then(function(permission) {
            if(permission){
                permission.code = req.body.code,
                permission.description = req.body.description
                return permission.save(); // returns a promise
            }
          })
          .then(function(permission) {
              var message = "Permission successfully updated.";                
              response(res,permission,message);
          })
          .catch(function(err){
              // just need one of these
              //console.log('error:', err);
              res.status(500).send(err.message);
          }); 
      }
  )
  .delete(validator.validate({
              params: {
                idPermission: { isRequired: true, isMongoId: true }
              }
          }),
          function(req, res) {
              Permission.findByIdAndRemove(req.params.idPermission, function (err, permission) {  
                 if(err)
                    res.status(500).send(err.message);
                 var message = "Permission successfully deleted.";                
                 response(res,permission,message);
              });
          }
  );
var response = function(res,permission,messageOK,messageNotOK){
    if(permission) {
      var resp = {
                  message: messageOK,
                  id:permission._id
                };
      if(messageOK){
        res.status(200).jsonp(resp);
      }else{
        res.status(200).jsonp(permission);
      }
    }else{
      var dfault =  "Permission Not Found";
      if(messageNotOK){
        res.status(400).send(messageNotOK);
      }else{
        res.status(400).send(dfault);
      }
    }
};
module.exports = router