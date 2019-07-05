const express = require('express')

const router = express.Router()
const Modules = require('../models/modules.js')
const Chapters = require('../models/chapters.js')
const Questions = require('../models/questions.js')



// TESt GET 

router.get('/test',(req,res,next)=>{
    res.json({
        status: "Success"
    })
})

// GET MODULES (Model.find())

router.get('/modules', (req, res, next) => {
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


// POST MODULES CREATE

router.post('/modules', (req, res, next) => {
    var single_module = req.body
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

module.exports = router