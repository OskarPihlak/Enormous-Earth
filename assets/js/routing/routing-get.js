module.exports = function (app) {
    //npm
    const bodyParser = require('body-parser');
    const mysql = require('mysql');
    const urlEncodedParser = bodyParser.urlencoded({extended: false});
    const filter = require('filter-object');
    const moment = require('moment-business-days');
    const fs = require('fs');
    const colors = require('colors');
    const moment_range = require('moment-range');
    const moment_ranges = moment_range.extendMoment(moment);
    //files
    const printer_data_promise = require('../oid-proccessing/printer-data-promise.js');
    const chart = require('../chart.js');
    const database = require('../db/db.js');
    const helpers = require('../helpers.js');
    const pool = database.db_define_database();
    //helper: array last element
    if (!Array.prototype.last) {
        Array.prototype.last = function () {
            return this[this.length - 1];
        };
    }
    //helper:  only keepunique array values
    Array.prototype.unique = function () {
        let arr = [];
        for (let i = 0; i < this.length; i++) {
            if (!arr.includes(this[i])) {
                arr.push(this[i]);
            }
        }
        return arr; };
    //chart generator
    let chart_master;
    let range = moment_ranges.range(8, 10);

    chart().then(data => chart_master = data);
    setInterval(() => {
        let date = new Date();
        let day_name = moment().format('dddd');
        if (range.contains(date.getHours()) && (day_name !== 'Saturday' || day_name !== 'Sunday')) {
            console.log(`${day_name} chart update - ${date.getHours()}`);
            chart().then(data => chart_master = data);
        }
    }, 2700000);

    //printer_data_promise generation
    //when server starts wait a few seconds before making requests due to result loading
    let printer_result;
    printer_data_promise("WHERE ip IS NOT NULL ORDER BY length(floor) DESC, floor DESC", pool).then(response => {
        printer_result = response;
    });
    range = moment_ranges.range(9, 16);
    setInterval(() => {
        let date = new Date();
        let day_name = moment().format('dddd');
        if (range.contains(date.getHours()) && (day_name !== 'Saturday' || day_name !== 'Sunday')) {
            console.log(`${day_name} printer data update - ${date.getHours()}`);
            printer_data_promise("WHERE ip IS NOT NULL ORDER BY length(floor) DESC, floor DESC", pool).then(response => {
                printer_result = response;
            });
        }
    },3600000);

    app.get('/', function (req, res) {
        console.log(colors.magenta('Navigating to main page -> /'));
          /*  for (let i = 0; i < printer_result.length; i++) {
                printer_result[i].requested = req.params.id;
            }*/
          console.log(printer_result);
            let floors = helpers.numberOfFloors(printer_result).number_of_floors;
            let critically_printers = helpers.critical_printers(printer_result);
            res.render('./navbar/main', {
                printers: printer_result,
                floors: floors,
                critical_printers: critically_printers
            });
    });

    //use 0 and 2nd params, this displays printer location on map
    app.get(/^\/floor\/(?:([^\/]+?))(\/(?:([^\/]+?)))?$/, (req, res) => {
        let floor_number = req.params[0].replace(/k/g,'');
        console.log(colors.magenta(`Navigating to route -> /floor/${floor_number}/${req.params[2]}`));
        printer_data_promise(`WHERE floor = '${floor_number}'`, pool).then(response => {
            helpers.requestedPrinterJoinToResponse(response, req);
            res.render(`./floors/${floor_number}-floor`, {
                floor_printers: response
            });
        })
    });

    app.get('/admin', function (req, res) {
        let sql_statement_get_snmp_adresses = 'SELECT * FROM printers_inc_supply.snmpadresses ORDER BY length(floor) DESC, floor DESC;';
        pool.getConnection((err, connection) => {
            connection.query(sql_statement_get_snmp_adresses, function (error, result) {
                if (error) throw error;
                let hosts = [];
                result.forEach(data => hosts.push(data.ip));
                helpers.admin_render(hosts, result, res);
            });
            connection.release();
        });
    });

    app.get('/floors', function (req, res) {
        let sql_statement_get = 'SELECT * FROM printers_inc_supply.snmpadresses ORDER BY length(floor) DESC, floor DESC;';
        pool.getConnection((err, connection) => {
            connection.query(sql_statement_get, function (error, result) {
                let floors_master = [];
                result.forEach(data => {
                    data.printer_ping = {alive: true};
                    floors_master.push(data)
                });
                let number_of_floors = helpers.numberOfFloors(floors_master).number_of_floors;
                if (error) throw error;
                res.render('./navbar/floors', {
                    floors: number_of_floors
                });
            });
            connection.release();
        });
    });

    //storage with optionated id
    app.get(/^\/storage(\/(?:([^\/]+?)))?$/,(req, res)=>{
        let sql_statement_get = `SELECT * FROM printers_inc_supply.inc_supply_status;`;
        pool.getConnection((err, connection) => {
            connection.query(sql_statement_get, (error, sql_data) => {
                if (error) throw error;
                let master_storage;
                let printer_param = req.params[0];

                if(printer_param === undefined) {
                    let toner_storage = helpers.arrayToObjectArray(helpers.uniqueCartridges(sql_data).unique_array);
                    master_storage = helpers.storageSorting(sql_data, toner_storage);
                }
                else {
                   master_storage = helpers.storageSorting(sql_data, printer_param);
                }
                res.render('./navbar/storage', {
                    storage: master_storage
                });
            });
            connection.release();
        });
    });

    app.get('/toner-usage-chart', function (req, res) {
        res.render('./navbar/charts', {
            chart: chart_master
        });
    });

    //TODO build this
    app.get('/details/:name/:ip', (req, res) => {
        let query = `WHERE  name = "${req.params.name}" AND ip= "${req.params.ip}"`;
        console.log(query);
        printer_data_promise(query, pool).then(response => {
            res.render('./data/printer-detail', {
                chart: chart_master,
                data: response
            })
        });
    });

    //get file
    app.get('/email', (req, res) => {
        console.log(colors.magenta('Routing to backend email sender view -> /email'));
        printer_data_promise("WHERE ip IS NOT NULL ORDER BY length(floor) DESC, floor DESC", pool).then(response => {
            helpers.critical_printers(response);

            let critical_toner = [];
            response.forEach(response => {
                if (response.name !== 'RequestTimedOutError' && response.cartridge.critical === true) critical_toner.push(response);
            });
            let all_is_good = false;
            if (critical_toner.length === 0) all_is_good = true;

            res.render('./email/email', {
                printers: critical_toner,
                date: moment().format('DD-MM-YYYY'),
                all_is_good: all_is_good
            });
        });
    });
};
