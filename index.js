'use strict';

var _ = require('lodash');
var fs = require('fs');
var through = require('through2');
var LessDependency = require('./lib/less-dependency');

module.exports = function(options) {
    var dep = (options||{}).dependency || new LessDependency(options||{});

    var stream = through.obj(function(file, enc, callback) {
        var self = this;

        if (file.isNull()) {
            this.push(file);
            return callback();
        }

        dep.parseImports(file).then(function() {
            _.uniq(dep.accumulateDependentsOn(file.path)).forEach(function(fname) {
                var f = file.clone();
                f.path = fname;
                f.contents = file.isStream() ?
                        fs.createReadStream(fname) : fs.readFileSync(fname);
                this.push(f);
            }.bind(self));

            callback();
        });
    });
    return stream;
};
