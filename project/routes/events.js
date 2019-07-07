const express = require('express');
const router = express.Router()


const GlobalEvents = require('../models/globalEvents.js')

/* ===================================== GLOBAL EVENTS ======================================= */

router.route('/global/visits')
    .get(function (req, res) {
        var query = req.query.page
        GlobalEvents.find({ evt: query }).exec((err, events) => {
            if (events) {
                var el = events.length
                res.json({
                    status: "Success",
                    payloadLength: el,
                    payload: events
                })
            }
        })
    })
    .post(function (req, res) {
        var payload = req.body
        var event = new GlobalEvents(payload)
        event.save().then(savedGlobalEvent => {
            if (savedGlobalEvent) {
                res.json({
                    status: "Success",
                    payload: savedGlobalEvent
                })
            } else {
                res.json({
                    status: "Failed"
                })
            }
        })
    })