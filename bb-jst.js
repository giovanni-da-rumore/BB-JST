// Make bbJST global and require jQuery and Underscore; shamelessly stolen from Backbone's source code
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
    // View is a Backbone View object; templateName is the name of the template's script tag's id, minus 'tpl'; 
    // for options, you can specify the template's extension or path. 
    bbJST.template = function (templateName, view, options) {
        var self = this;
        var options = options || {};
        options.extension = options.extension || this.extension || false;
        options.directory = options.directory || this.directory || false;
        if (!(view instanceof Backbone.View)) {
            throw new Error("The argument 'view' must be a Backbone View object.");
        }
        // don't call Backbone.View.render until the template is loaded
        view.render = _.wrap(view.render, function(render) {
            if (!view.template) {
                return view;
            } else {
                return render.call(view);
            }
		});
    // Check if the template is already loaded onto the DOM    
        if (document.getElementById(templateName + '-tpl')) {
            return _.template($('#' + templateName + '-tpl').html());
        } else {
    // Make sure the template is loaded only once. This check is useful if, for example, you want to load many row templates in a 
    // table. Usually every row's bbJST.template() function will be called before their shared template is loaded into the DOM.
            if (alreadyLoading[templateName]) {
                // Wait until the shared template is loaded
                setTimeout(function () {
                    view.template =  _.template($('#' + templateName + '-tpl').html());
                    if (shouldRender(options.autoRender, self.autoRender)) view.render();
                },0);
            } else {        
                // Create a holder for the template and load it into said holder
                alreadyLoading[templateName] = true;
                var pathName = getPathName(templateName, options);
                $('body').append('<div id="'+templateName+'-tpl-holder"></div>');
                $('body').find('#'+templateName+'-tpl-holder').load(pathName, function () {
                    view.template =  _.template($('#' + templateName + '-tpl').html());
                    if (shouldRender(options.autoRender, self.autoRender)) view.render();
                });                
            }
        }
    };

    var getPathName = function (templateName, options) {
        var extension = options.extension || '.jst.ejs',
        directory = options.directory || '/templates/';
        return (options && options.path) ? options.path : directory + templateName + extension;
    };
    
    var shouldRender = function (passedRender, globalRender) {
        if (globalRender === false) return passedRender === true;
        return !(passedRender === false); 
    };
    
    return bbJST
});
