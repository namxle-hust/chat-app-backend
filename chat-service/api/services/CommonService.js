'use strict'

const jwt = require('jsonwebtoken');

module.exports = {
    dateDiff: (date) => {
        const date1 = new Date(date);
        const date2 = new Date();
        const diffTime = Math.abs(date2 - date1);

        return diffTime;
    },

    delay: (t, val) => {
        return new Promise(function(resolve) {
            setTimeout(function() {
                resolve(val);
            }, t);
        });
     }
}