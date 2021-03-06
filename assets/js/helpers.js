const Handlebars = require('handlebars');
let database = require('./db/db.js');
const pool = database.db_define_database();
const colors = require('colors');
//TODO cleanup this file

module.exports.requestedPrinterJoinToResponse = (response, req) => {
    for (let i = 0; i < response.length; i++) {
        response[i].requested = req.params[2].replace('/','');
    }
    return response;
};

module.exports.handlebars = () => {
    Handlebars.registerHelper('json', function (context) {
        return JSON.stringify(context);
    });

    Handlebars.registerHelper("math", function (lvalue, operator, rvalue, options) {
        lvalue = parseFloat(lvalue);
        rvalue = parseFloat(rvalue);

        return {
            "+": lvalue + rvalue,
            "-": lvalue - rvalue,
            "*": lvalue * rvalue,
            "/": lvalue / rvalue,
            "%": lvalue % rvalue
        }[operator];
    });

    Handlebars.registerHelper('ifEquals', function (a, b, options) {
        if (a === b) {
            return options.fn(this);
        }
        return options.inverse(this);
    });
// less than or equal to
    Handlebars.registerHelper('lessOrEquals', function (a, b) {
        let next = arguments[arguments.length - 1];
        return (a >= b) ? next.fn(this) : next.inverse(this);
    });
    Handlebars.registerHelper('testHelper', function (property) {
        return 'foo: ' + Ember.get(this, property);
    });

    Handlebars.registerHelper('compare', function (lvalue, operator, rvalue, options) {

        var operators, result;

        if (arguments.length < 3) {
            throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
        }

        if (options === undefined) {
            options = rvalue;
            rvalue = operator;
            operator = "===";
        }

        operators = {
            '==': function (l, r) {
                return l == r;
            },
            '===': function (l, r) {
                return l === r;
            },
            '!=': function (l, r) {
                return l != r;
            },
            '!==': function (l, r) {
                return l !== r;
            },
            '<': function (l, r) {
                return l < r;
            },
            '>': function (l, r) {
                return l > r;
            },
            '<=': function (l, r) {
                return l <= r;
            },
            '>=': function (l, r) {
                return l >= r;
            },
            'typeof': function (l, r) {
                return typeof l == r;
            }
        };

        if (!operators[operator]) {
            throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);
        }

        result = operators[operator](lvalue, rvalue);

        if (result) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }

    });

};

module.exports.criticalPrinters = response => {
    console.log('passby');
    console.log(response);
        let critical_printers = [];
        for (let i = 1; i < response.length; i++) {
            let toner = response[i].cartridge;
            console.log(colors.magenta(toner));
            let critical_toner_level = 12;
            if (response[i].color) {
                if (toner.black.value < critical_toner_level ||
                    toner.cyan.value < critical_toner_level ||
                    toner.magenta.value < critical_toner_level ||
                    toner.yellow.value < critical_toner_level) {
                    critical_printers.push(response[i]);
                }
            } else {
                if (toner.black.value < critical_toner_level) {
                    critical_printers.push(response[i]);
                }
            }
        }

        return {critical_printers: critical_printers};
    };

module.exports.uniqueCartridges = (sql_data) => {
    let elementArray = [];
    for (let i = 0; i < sql_data.length; i++) {
        elementArray.push(sql_data[i].cartridge_name);
    }

    Array.prototype.contains = function (v) {
        for (let i = 0; i < this.length; i++) {
            if (this[i] === v) return true;
        }
        return false;
    };

    Array.prototype.unique = function () {
        let arr = [];
        for (let i = 0; i < this.length; i++) {
            if (!arr.includes(this[i])) {
                arr.push(this[i]);
            }
        }
        return arr;
    };
    let unique_array = (elementArray).unique();
    return {unique_array: unique_array};
};

module.exports.arrayToObjectArray = function toObject(array) {
    let object_array = [];
    for (let i = 0; i < array.length; ++i) {
        object_array.push({cartridge: array[i]});
    }
    return object_array;
};

module.exports.printerStorageSorting = (toner_storage, sql_data, selected_storage, selected_toner) => {

    for (let i = 0; i < toner_storage.length; i++) {
        toner_storage[i].printers = [];
        for (let y = 0; y < sql_data.length; y++) {

            if (toner_storage[i].cartridge === sql_data[y].cartridge_name) {
                (toner_storage[i].printers).push(sql_data[y].printer_name);
                toner_storage[i].storage = sql_data[y].cartridge_supply;
                toner_storage[i].selected_printer = selected_storage;
            }
        }
    }
    return toner_storage;
};

module.exports.storageSorting = (sql_data, selected_storage, error) => {
    let toner_storage = exports.arrayToObjectArray(exports.uniqueCartridges(sql_data).unique_array);
    let sorted_storage = exports.printerStorageSorting(toner_storage, sql_data, selected_storage);
    if (error) {
        throw error;
    }

    let selected_toners = [];
    for (let i = 0; i < sorted_storage.length; i++) {
        for (let x = 0; x < (sorted_storage[i].printers).length; x++) {
            if ((sorted_storage[i].printers[x]) === sorted_storage[i].selected_printer) {
                selected_toners.push(sorted_storage[i].cartridge)
            }
        }
    }
    for (let i = 0; i < sorted_storage.length; i++) {
        sorted_storage[i].selected_toner = selected_toners;
    }
    return sorted_storage;
};

module.exports.criticalPrinters = (response) => {
    let critical_printers = [];
    for (let i = 0; i < response.length; i++) {
        if (response[i].alive === true) {
            let toner = response[i].cartridge;
            console.log(toner);
            let critical_toner_level = 15;
            if (response[i].color) {
                if (toner.black.value < critical_toner_level ||
                    toner.cyan.value < critical_toner_level ||
                    toner.magenta.value < critical_toner_level ||
                    toner.yellow.value < critical_toner_level) {
                    critical_printers.push(response[i]);
                }
            } else {
                if (toner.black.value < critical_toner_level) {
                    critical_printers.push(response[i]);
                }
            }
        }
    }
    return critical_printers;
};

module.exports.uniqueArray = (data) => {
    Array.prototype.unique = function (data) {
        let arr = [];
        for (let i = 0; i < data.length; i++) {
            if (!arr.includes(data[i])) {
                arr.push(data[i]);
            }
        }
        return arr;
    }
};


module.exports.uniquePrinterNames = () => {
    Array.prototype.unique = function () {
        let arr = [];
        for (let i = 0; i < this.length; i++) {
            if (!arr.includes(this[i])) {
                arr.push(this[i]);
            }
        }
        return arr;
    };
};
module.exports.isEmpty = (obj) => {
    // Speed up calls to hasOwnProperty
    let hasOwnProperty = Object.prototype.hasOwnProperty;
    // null and undefined are "empty"
    if (obj == null) return true;

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0) return false;
    if (obj.length === 0) return true;

    // If it isn't an object at this point
    // it is empty, but it can't be anything *but* empty
    // Is it empty?  Depends on your application.
    if (typeof obj !== "object") return true;

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (let key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }

    return true;
};

module.exports.critical_printers = response => {
    let critical_printers = [];
    for (let i = 0; i < response.length; i++){
        if (response[i].hasOwnProperty('cartridge')){
            let toner = response[i].cartridge;
            let critical_toner_level = 12;
            if (response[i].color) {
                if (toner.black.value < critical_toner_level   ||
                    toner.cyan.value < critical_toner_level    ||
                    toner.magenta.value < critical_toner_level ||
                    toner.yellow.value < critical_toner_level) {
                    response[i].cartridge.critical = true;
                    response[i].critical = true;
                    critical_printers.push(response[i]);
                }
            } else if (response[i].color === false && toner.black.value < critical_toner_level) {

                if (response[i].ip === '192.168.67.42' || response[i].ip === '192.168.67.3') {
                    response[i].cartridge.critical = false;
                    response[i].critical = false;
                }
                else {
                    response[i].cartridge.critical = true;
                    response[i].critical = true;
                    critical_printers.push(response[i]);
                }
            } else {
                response[i].cartridge.critical = false;
                response[i].critical = false;
            }
        }
    }
    return critical_printers;
};

/*
*   ADMIN PAGE
* */
const ping = require('ping');

module.exports.ipStatus = ip => {
    return new Promise(resolve => {
        ping.sys.probe(ip, isAlive => {
            let msg = isAlive ? {ip: ip, alive: true} : {ip: ip, alive: false};
            return resolve(msg);
        })
    });
};

module.exports.admin_render =
    async (array, result, res) => {
    let final_data = [];
    for (const item of array) {
        await exports.ipStatus(item).then(data => {
            result.forEach(query_result => {
                if (data.ip === query_result.ip) {
                    query_result.printer_ping = data;
                    final_data.push(query_result);
                }
            });
        });
    }
    let number_of_floors = [];
    final_data.forEach(data=>{ if(!number_of_floors.includes(final_data.floor)) number_of_floors.push(final_data.floor) });
    await res.render('./navbar/admin', {
        printers_all: final_data,
        floors: number_of_floors
    });
    return result;
};
/*
* MAIN PAGE
* */
const printer_data_promise = require('./oid-proccessing/printer-data-promise.js');
module.exports.printer_data = () => {
    let printer_result_init;
    printer_data_promise("WHERE ip IS NOT NULL ORDER BY length(floor) DESC, floor DESC", pool).then(response => {
        console.log(response);
        printer_result_init = response;
    });
    return printer_result_init
};

