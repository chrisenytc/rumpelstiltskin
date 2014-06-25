'use strict';

module.exports = {
    email: process.env.MAIL_EMAIL || '',
    password: process.env.MAIL_PASSWORD || '',
    from: 'Rumpelstiltskin.js <'+ process.env.MAIL_EMAIL || '' + '>'
};
