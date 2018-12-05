"use strict";

let salesforce = require('./salesforce'),

    formatter = require('./formatter'),

    HOUSE_TOKEN = process.env.SLACK_HOUSE_TOKEN;

exports.handle = (req, res) => {

    if (req.body.token != HOUSE_TOKEN) {
        res.send("Invalid token");
        return;
    }

    let params  = req.body.text.split(" ");

    if (params[0].toLowerCase() === "search") {
        salesforce.findProperties({city: params[1], priceMin: params[2], priceMax: params[3], bedrooms: params[4]})
            .then(properties => res.send({
                text: "I found these properties:",
                attachments: formatter.formatProperties(properties)
            }))
            .catch(error => res.send("Error while retrieving properties " + JSON.stringify(error)));
    } else if (params[0].toLowerCase() === "changes") {
        salesforce.findPriceChanges()
            .then(priceChanges => res.send({
                text: "Here are the recent price changes:",
                attachments: formatter.formatPriceChanges(priceChanges)
            }))
            .catch(error => res.send("Error while retrieving price changes " + JSON.stringify(error)));
    } else {
        res.send("I didn't understand what you asked");
    }

};
