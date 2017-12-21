module.exports = function(app) {
    const bodyParser = require('body-parser');
    const mysql = require('mysql');
    const urlEncodedParser = bodyParser.urlencoded({extended: false});
    const printer_data_promise = require('./printer-data-promise');

    let db = mysql.createConnection({
        host: '127.0.0.1',
        user: 'root',
        password: '',
        database: 'printers_inc_supply'
    });

    db.connect(function (err) {
        if (err) throw err;
        console.log('Mysql connected to printers_inc_supply on 127.0.0.1');
    });

    function requestedPrinterJoinToResponse(response, req){
        for(let i=0; i<response.length; i++){
            response[i].requested = req.params.id;
        }
        return response;
    }

    app.post('/admin/add-printer', urlEncodedParser, function (req, res) {
        console.log(req);
        printer_data_promise("WHERE color = true OR color = false ").then(response => {
            res.redirect('/admin');
        });
    });

    app.post('/', urlEncodedParser, function (req, res) {
        let sql_statement_put = "UPDATE printers_inc_supply.inc_supply_status SET cartridge_supply='" + req.body.inc_storage_count + "' WHERE cartridge_name='" + req.body.inc_storage_name + "'";
        // console.log(sql_statement_put);
        let query = db.query(sql_statement_put, function (error, data) {
            if (error) throw error;
            res.redirect('/');
        });
    });

};