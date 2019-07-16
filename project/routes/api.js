const express = require('express')

const router = express.Router()
const Modules = require('../models/modules.js')
const Chapters = require('../models/chapters.js')
const Questions = require('../models/questions.js')
const Rewards = require('../models/rewards.js')



// TESt GET 

router.get('/test',(req,res,next)=>{
    res.json({
        status: "Success"
    })
})

// (http://localhost:3000/server/modules) - GET, POST, PUT
router.route('/modules')
    .get(function (req,res) {
        Modules.find({}).exec((err, modules) => {
            if (modules) {
                res.json({
                    status: "Success",
                    message: "Modules Fetched Successfully",
                    payload: modules
                })
            } else if (err) {
                res.json({
                    status: "Failed",
                    message: "Error in fetching modules"
                })
            } else {
                res.json({
                    status: "Failed",
                    message: "Error in Fetching Modules or Module Not Found"
                })
            }
        })
    })
    .post(function (req,res){
        var single_module = req.body
        Modules.findOne({ "title": single_module.title }).exec(function (err, smodule){
            if (smodule) {
                res.json({
                    status: "Failed",
                    message: "Already Contains Module with Same Title"
                })
            } else {
                var dbm = new Modules(single_module)
                var a = new Date()
                dbm.createdAt = a
                dbm.updatedAt = a
                var ip = req.ip
                ip = (ip == "::1") ? "127.0.0.1" : ip
                dbm.lastUpdatedBy = "api request from " + ip
                dbm.save(function (err, savedModule) {
                    if (savedModule) {
                        res.json({
                            status: "Success",
                            message: "Module Saved Successfully",
                            payload: savedModule
                        })
                    } else {
                        console.log(err)
                        res.json({
                            status: "Failed",
                            message: "Module could not be saved"
                        })
                    }
                })
            }
        })
    })
    .put()
    .delete()



// GET SINGLE MODULE (Model.findOne())

router.get('/module/:id', (req, res, next) => {
    var id = req.params.id
    if (id) {
        Modules.findOne({ "_id": id }).exec((err, single_module) => {
            if (single_module) {
                res.json({
                    status: "Success",
                    message: "Module Fetched Successfully",
                    payload: single_module
                })
            } else if (err) {
                res.json({
                    status: "Failed",
                    message: "Module could not be fetched",
                })
            } else {
                res.json({
                    status: "Failed",
                    message: "Module could not be fetched"
                })
            }
        })
    } else {
        res.json({
            status: "Failed",
            message: "Could not get id in the request"
        })
    }
})

// GET CHAPTERS

router.get('/chapters', (req, res) => {
    Chapters.find({}).exec((err, chapters) => {
        if (chapters) {
            res.json({
                status: "Success",
                payload: chapters
            })
        } else {
            res.json({
                status: "Failed"
            })
        }
    })
})


// POST CHAPTERS CREATE

router.post('/chapters', (req, res, next) => {
    var single_chapter = req.body
    var dbc = new Chapters(single_chapter)
    var a = new Date()
    dbc.createdAt = a
    dbc.updatedAt = a
    var ip = (req.ip == "::1") ? "127.0.0.1" : req.ip
    dbc.lastUpdatedBy = "api request from " + ip
    dbc.save().then(savedChapter => {
        if (savedChapter) {
            res.json({
                status: "Success",
                message: "Chapter saved Successfully",
                payload: savedChapter
            })
        } else {
            res.json({
                status: "Failed",
                message: "Chapter could not be saved, Please Try Again"
            })
        }
    })
})

// GET CHAPTERS of MODULE

router.get('/chapters/:mid', (req, res, next) => {
    const mid = req.params.mid
    Chapters.find({"mid":mid}).exec((err, chapters) => {
        if (chapters) {
            res.json({
                status: "Success",
                message: "Fetched Chapters Successfully",
                payload: chapters
            })
        } else {
            res.json({
                status: "Failed",
                message: "Failedd to fetch Chapters"
            })
        }
    })
})


router.get('/questions', (req, res) => {
    Questions.find({}).exec((err, questions) => {
        if (questions) {
            res.json({
                status: "Success",
                payload: questions
            })
        } else {
            res.json({
                status: "Failed"
            })
        }
    })
})


// GET QUESTIONS of CHAPTER

router.get('/questions/:mid', (req, res, next) => {
    const mid = req.params.mid
    if (mid) {
        Questions.find({
            "mid": mid
        }).exec((err, questions) => {
            if (questions) {
                res.json({
                    status: "Success",
                    message: "Fetched Questions Successfully",
                    payload: questions
                })
            } else {
                res.json({
                    status: "Failed",
                    message: "Error Occured in fetching questions"
                })
            }
        })
    } else {
        res.json({
            status: "Failed",
            message: "No id found in Request"
        })
    }
})






// POST QUESTIONS CREATE

router.post('/questions', (req, res, next) => {
    var single_question = req.body
    var dbq = new Questions(single_question)
     var a = new Date()
     dbq.createdAt = a
     dbq.updatedAt = a
     var ip = (req.ip == "::1") ? "127.0.0.1" : req.ip
     dbq.lastUpdatedBy = "api request from " + ip
    dbq.save().then(savedQuestion => {
        if (savedQuestion) {
            res.json({
                status: "Success",
                message: "Question saved Successfully",
                payload: savedQuestion
            })
        } else {
            res.json({
                status: "Failed",
                message: "Question could not be saved, Please Try Again"
            })
        }
    })
})


// EDIT MODULE

router.put('/edit/module/:id', (req, res, next) => {
    var id = req.params.id
    var sm = req.body
    if (id) {
        Modules.findOne({ "_id": id }).exec((err, single_module) => {
            if (single_module) {
                
            }
        })
    }
})

router.get('/modules/finish/:id',function(req,res,next){
    var mid = req.params.id
    Rewards.find({"mid":mid}).exec((err,rewards)=>{
        if(rewards){
            res.json({
                status: "Success",
                message: "Successfully fetched rewards",
                payload: rewards
            })
        } else {
            res.json({
                status: "Failed",
                message: "Could not fetch Rewards"
            })
        }
    })
})


/*  
    <------------------------------------------------REWARDS ROUTER--------------------------------------------------------------->
*/

router.route('/rewards')
    .get(function(req,res,next){
        Rewards.find({}).exec((err,rewards)=>{
            if(rewards){
                res.json({
                    status: "Success",
                    message: "Successfully fetched Rewards",
                    payload: rewards
                })
            } else {
                res.json({
                    status: "Failed",
                    message: "Failed to fetch Rewards"
                })
            }
        })
    })
    .post(function(req,res,next){
        var payload = req.body
        Rewards.findOne({title:payload.title}).exec((err,rwrd)=>{
            if(rwrd){
                res.json({
                    status:"Failed",
                    message: "Reward Already Exists"
                })
            } else {
                var new_rwrd = new Reward(payload)
                new_rwrd.save().then(savedReward => {
                    if(savedReward){
                        res.json({
                            status: "Success",
                            message: "Saved Reward Successfully",
                            payload: savedReward
                        })
                    } else {
                        res.json({
                            status: "Failed",
                            message: "Could not save Rewards"
                        })
                    }
                })
            }
        })
    })
    .delete(function(req,res,next){
        Rewards.remove({},function(err){
            if(err){
                res.json({
                    status: "Failed",
                    message: "Error in deleting documents"
                })
            } else {
                res.json({
                    status: "Success",
                    message: "Deleted Documents Successfully"
                })
            }
        })
    })

router.route('/rewards/:id')
    .get(function(rew,res,next){
        var rid = req.params.id
        Rewards.findOne({"_id":rid}).exec((err,rwrd)=>{
            if(rwrd){
                res.json({
                    status: "Success",
                    message: "Successfully retrieved Reward for reward id " + rid,
                    payload: rwrd
                })
            } else {
                res.json({
                    status: "Failed",
                    message: "Failed to retrieve reward"
                })
            }
        })
    })
    .put(function(req,res,next){
        var rid = req.params.id
        var payload = req.body
        var options = {
            new: true
        }
        Rewards.findOneAndUpdate({"_id":rid},payload,options,function(err,reward){
            if(reward){
                res.json({
                    status: "Success",
                    message: "Updated Reward",
                    payload: reward
                })
            } else {
                res.json({
                    status: "Failed",
                    message: "Failed to Update Reward"
                })
            }
        })
    })
    .delete(function(req,res,next){
        var rid = req.params.id
        Rewards.remove({"_id":rid}, function(err){
            if(err){
                res.json({
                    status: "Failed",
                    message: "Failed to delete reward with reward id " + rid,
                })
            } else {
                res.json({
                    status: "Success",
                    message: "Deleted Reward with reward id" + rid
                })
            }
        })
    })
    

module.exports = router