const express = require('express')

const router = express.Router()
const Users = require('../models/users.js')

router.route('/users')
    .get(function (req, res, next) {
        Users.find({}).exec(function (err, users) {
            if (users) {
                res.json({
                    status: "Success",
                    message: "User Saved in DB successfully",
                    payload: users
                })
            }
        })
    })
    .post(function (req, res, next) {
        var payload = req.body
        var user = new Users(payload)
        var a = new Date()
        user.createdAt = a
        user.updatedAt = a
        user.save().then(function (savedUser) {
            if (savedUser) {
                res.json({
                    status: "Success",
                    message: "Successfully saved the user",
                    payload: savedUser
                })
            } else {
                res.json({
                    status: "Failed",
                    message: "Failed to save the user"
                })
            }
        })
    })

router.route('/user/:id')
    .get(function(req,res,next){
        var userid = req.params.id
        User.findOne({"_id": userid}).exec((err,usr) => {
            if(usr){
                res.json({
                    status: "Success",
                    message: "User Data Fetched Successfully",
                    payload: usr
                })
            } else {
                res.json({
                    status: "Failed",
                    message:"User Data could not be fetched",
                })
            }
        })
    })
    .put(function(req,res,next){
        var userid = req.params.id
        var payload = req.body
        var options = {
            new: true
        }
        User.findOneAndUpdate({"_id": userid },payload,options,function(err,savedUser){
            if(savedUser){
                res.json({
                    status: "Success",
                    message: "User Data Updated Successfully",
                    payload: savedUser
                })
            } else {
                if (err) console.log(err)
                res.json({
                    status: "Failed",
                    message: "User Data Update Failed",
                })
            }
        })
    })

module.exports = router