const express = require('express')

const router = express.Router()
const Modules = require('../models/modules.js')

// TESt GET 

router.get('/test',(req,res,next)=>{
    res.json({
        status: "Success"
    })
})

// GET MODULES (Model.find())

// GET SINGLE MODULE (Model.findOne())

// GET CHAPTERS of MODULE

// GET QUESTIONS of CHAPTER


// POST MODULES CREATE or UPDATE

// POST CHAPTERS CREATE or UPDATE

// POST QUESTIONS CREATE or UPDATE

module.exports = router