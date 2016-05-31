// require jQuery and Underscore, Shamelessly stolen from Backbone's source code
(function(factory) {

  // Establish the root object, `window` (`self`) in the browser, or `global` on the server.
  // We use `self` instead of `window` for `WebWorker` support.
  var root = (typeof self == 'object' && self.self == self && self) ||
            (typeof global == 'object' && global.global == global && global);

  // Set up bbJST appropriately for the environment. Start with AMD.
  if (typeof define === 'function' && define.amd) {
    define(['underscore', 'jquery', 'exports'], function(_, $, exports) {
      // Export global even in AMD case in case this script is loaded with
      // others that may still expect a global Backbone.
      root.bbJST = factory(root, exports, _, $);
    });

  // Next for Node.js or CommonJS. jQuery may not be needed as a module.
  } else if (typeof exports !== 'undefined') {
    var _ = require('underscore'), $;
    try { $ = require('jquery'); } catch(e) {}
    factory(root, exports, _, $);

  // Finally, as a browser global.
  } else {
    root.bbJST = factory(root, {}, root._, (root.jQuery || root.Zepto || root.ender || root.$));
  }

})(function(root, bbJST, _, $) {
    // keep track of templates that are already in the process of loaded
    var alreadyLoading = {}
    // view is a backbone view object; templateName is the name of the id within the template, minus 'tpl'; path is an option for specifying the file path, if it doesn't follow the bbJST convention
    bbJST.template = function (templateName, view, path) {
        var self = this;
        if (!(view instanceof Backbone.View)) {
            throw new Error('You must call bbJST on a Backbone View');
        }
        // don't call Backbone.View.render until the template is loaded
        view.render = _.wrap(view.render, function(render) {
            if (!view.template) {
                return view;
            } else {
                return render.call(view);
            }
		});
    // check it the template it already loaded    
        if (document.getElementById(templateName + '-tpl')) {
            return _.template($('#' + templateName + '-tpl').html());
        } else {
    // make sure the template is only loaded once; this check is useful if, for example, you want to load many row templates for a 
    // table. Without this check, many, if not all, of the table's rowViews will load the same template and you will have many redundant ajax calls.
            if (alreadyLoading[templateName]) {
                setTimeout(function () {
                    view.template =  _.template($('#' + templateName + '-tpl').html());
                    view.render();
                },0);
            } else {
                
                // create a holder for the template and load it into said holder
                alreadyLoading[templateName] = true;
                var pathName = getPathName(templateName, path);
                $('body').append('<div id="'+templateName+'-tpl-holder"></div>');
                $('body').find('#'+templateName+'-tpl-holder').load(pathName, function () {
                    view.template =  _.template($('#' + templateName + '-tpl').html());
                    view.render();
                });                
            }
        }
    };

    var getPathName = function (templateName, path) {
        return (path) ? path : './templates/' + templateName + '.jst.ejs';
    };
    
    return bbJST
});
