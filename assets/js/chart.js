module.exports = (printer_data_saved) => {
    const colors = require('colors');
    let database = require('./db/db.js');
    const printer_oid_data = require('./oid-proccessing/oids.js');
    const pool = database.db_define_database();
    const moment = require('moment-business-days');
    const moment_range = require('moment-range');
    const moment_ranges = moment_range.extendMoment(moment);

    return new Promise((resolve, reject) => {
        let printer_page_source = [];
            printer_page_source.floors = [];
            printer_page_source.locations = [];

        pool.getConnection((err, connection) => {

            let sql_statmenet_get_target_statistics = 'SELECT * FROM printers_inc_supply.printer_cartridge_statistics;';
            connection.query(sql_statmenet_get_target_statistics, function (error, result, fields) {

                let sql_pages_printed_selection = `SELECT * FROM printers_inc_supply.pages_printed;`;
                connection.query(sql_pages_printed_selection, (pages_error, pages_result) => {

                    let sql_statement_get_supply = `SELECT * FROM printers_inc_supply.inc_supply_status;`;
                    connection.query(sql_statement_get_supply, (supply_error, supply_result) => {

                        if (printer_data_saved.length !== 0) {

                            //add "toner" array element to object
                            for (let i = 0; i < printer_data_saved.length; i++) {
                                console.log(printer_data_saved[i].name !== 'RequestFailedError' && printer_data_saved[i].hasOwnProperty('printer_ping'));
                                if (printer_data_saved[i].name !== 'RequestFailedError' && printer_data_saved[i].hasOwnProperty('printer_ping')) {
                                    if (printer_data_saved[i].printer_ping.alive) {
                                        printer_data_saved[i].toner = [];
                                        printer_data_saved[i].toner.push(printer_data_saved[i].cartridge['black'].name);
                                        if (printer_data_saved[i].color) {
                                            for (let x = 1; x < 4; x++) {
                                                printer_data_saved[i].toner.push(printer_data_saved[i].cartridge[printer_oid_data.colors_loop_info()[x].inc_name].name);
                                            }
                                        }
                                    }
                                }
                            }

                            /*
                            * CORE
                            * */
                            printer_data_saved.forEach(printer => {
                                if (printer.hasOwnProperty('printer_ping')) {
                                    if (printer.printer_ping.alive) {
                                        printer.toner_graph = [];
                                        printer.xgrid = [];
                                        printer.printers_with_same_toner = [];
                                        let data = [];
                                        data.value = [];
                                        data.dates = [];
                                        data.graph_data = [];


                                        result.forEach(database_element => {
                                            printer.toner.forEach(toner => {

                                                if (database_element.cartridge === toner &&
                                                    database_element.printer_name === printer.name &&
                                                    moment().format('MM') === moment(database_element.date).format('MM')) {

                                                    supply_result.forEach( database_supply_element => {
                                                        if(database_supply_element.cartridge_name === toner){
                                                            if(!printer.printers_with_same_toner.includes(database_supply_element.printer_name)){ printer.printers_with_same_toner.push(database_supply_element.printer_name)}
                                                        }
                                                    });
                                                    printer.printers_with_same_toners = printer.printers_with_same_toner.length > 0;

                                                    if (!data.dates.includes(moment(database_element.date).format('DD-MM-YYYY'))) data.dates.push(moment(database_element.date).format('DD-MM-YYYY'));




                                                    data.graph_data.push({
                                                        date: moment(database_element.date).format('DD-MM-YYYY'),
                                                        [database_element.color]: database_element.precentage,
                                                        [`toner_` + database_element.color]: database_element.cartridge
                                                    });
                                                }
                                            });
                                        });
                                        if (data.length = 0) {
                                            console.log('data is empty')
                                        }

                                        //combine data per printer
                                        let printer_objects = [];
                                        printer_objects.printer_name = printer.name;
                                        printer_objects.ip = printer.ip;
                                        printer_objects.color = printer.color;

                                        data.dates.forEach(date => {
                                            let single_date_object = [];
                                            data.graph_data.forEach(toner_object => {
                                                if (toner_object.date === date) {
                                                    toner_object.date = moment(date, 'DD-MM-YYYY').format('DD');
                                                    toner_object.date_big = moment(date, 'DD-MM-YYYY').format('DD-MM');
                                                    single_date_object.push(toner_object);
                                                }
                                            });

                                            let combined_single_date_object = {};
                                            single_date_object.forEach(object => Object.assign(combined_single_date_object, object));
                                            printer.toner_graph.push(combined_single_date_object);
                                        });

                                        //add week markers
                                        data.dates.forEach((date) => {
                                            if (moment(date, 'DD-MM-YYYY').format('dddd') === 'Monday') {
                                                printer.xgrid.push({
                                                    value: moment(date, 'DD-MM-YYYY').format('DD-MM'),
                                                    text: `${(moment(date, 'DD-MM-YYYY').format('W'))} Nädal`
                                                });
                                            }
                                        });


                                        /*
                                        *   LOCATIONS
                                        * */
                                        if (!printer_page_source.locations.includes(printer.location) && printer.location !== undefined) printer_page_source.locations.push(printer.location);

                                        /*
                                        *   FLOORS
                                        * */
                                        if (!printer_page_source.floors.includes(printer.floor) && printer.floor !== undefined) printer_page_source.floors.push(printer.floor);


                                        /*
                                        * PAGES PRINTED
                                        * */

                                        let pages = [];
                                        printer.graph = [];

                                        //from pages-printed.sql
                                        pages_result.forEach(printed_pages => {
                                            if (printer.ip === printed_pages.ip && moment(printed_pages.date).format('MM') === moment().format('MM')) {
                                                pages.push({
                                                    date: moment(printed_pages.date).format('DD-MM-YYYY'),
                                                    print_count: printed_pages.pages_printed
                                                });
                                            }
                                        });

                                        //generates graph data for page_print
                                        if (pages.length > 0) {
                                            for (let i = 0; i < pages.length; i++) {
                                                printer.graph.push({
                                                    pages_printed: parseInt(pages[i].print_count) - parseInt(pages[0].print_count),
                                                    date: pages[i].date
                                                });
                                            }
                                            printer.pages_printed_in_month = parseInt(pages[pages.length - 1].print_count) - parseInt(pages[0].print_count);
                                        } else {
                                            console.log(colors.red('print_count is empty array'))
                                        }

                                        /*
                                        * CRITICAL
                                        * */
                                        const critical_toner_level = 12;
                                        const printer_ignored = ['192.168.67.42', '192.168.67.3', '192.168.67.42', '192.168.3.195', '192.168.52.23', '10.129.128.108'];
                                        const color_toners = ['cyan', 'magenta', 'yellow'];
                                        printer.critical_toners = [];

                                        if (printer.hasOwnProperty('cartridge') && !printer_ignored.includes(printer.ip)) {
                                            if (printer.cartridge.black.value < critical_toner_level) {
                                                printer.critical_toners.push(printer.cartridge.black);
                                                printer.critical = true;
                                            }
                                            if (printer.color) {
                                                color_toners.forEach(toner => {
                                                    if (printer.cartridge[toner].value < critical_toner_level) {
                                                        printer.critical_toners.push(printer.cartridge[toner]);
                                                        printer.critical = true;
                                                    }
                                                });
                                            }
                                        }
                                        printer_page_source.push(printer);
                                    }
                                }
                            });
                        } else {
                            console.log(colors.red('printer_data_saved has no data'));
                        }
                        return resolve(printer_page_source);
                    })
                });
                connection.release();
            });
        });
    });
};



