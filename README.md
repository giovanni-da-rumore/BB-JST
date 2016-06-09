#Backbone JST  (bbJST)

> Meant to work with Backbone Views, bbJST is a library for compiling [EJS templates](http://ejs.co/) in a manner syntactically similar to [Rails's JST object](https://github.com/rails/sprockets).


##Abstract/Intentions 

By following Rails's sleek syntax, this library aims to facilitate transitions from Rails to stand alone Backbone, as well as enable all coders to get a Backbone project off the ground with less initial work.
The code is light-weight, efficient and -- its most beneficial feature -- maintains the lucid expressiveness of Rails's JST object, as if one had the advantage of compiling EJS templates with its Assets Pipeline. 


##Exposition 

When writing Backbone within Rails, there's not much to loading a template. One can write:

```javascript
MyApp.Views.TextView = Backbone.View.extend({
    template: JST["text-read"],    
});
```

Yet without Rails the process becomes a bit more unwieldy. A common option is to use Require.js and load your template beforehand, with something like:

```javascript
define([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/text-read.html',
], function ($, _, Backbone, textViewTemplate) {
	var TextView = Backbone.View.extend({
		template: _.template(textViewTemplate),        
    })
});
```

You can imagine how -- while not entirely arduous -- somewhat annoying beginning each Backbone View (and file at that) with such repeated boilerplate code would be. Not to mention, all the code that comes with Require.js and the library's setup isn't really necessary for a fair amount of apps. 

Using **bbJST**, however, one is able to load a template by simply writing: 

```javascript
MyApp.Views.TextView = Backbone.View.extend({
    initialize: function () {
        this.template = bbJST.template("text-read", this);
    },
});
```

Compared to the Require way as well as a few other approaches that this author may or may not have used in the past (see below), the bbJST pattern could be called more elegant, efficient and readable. 

##Dependencies
- Underscore.js
- jQuery

##General Use 
to load a template, call `bb.JST.template(templateName, view, options)` in a Backbone View, again: 

The arguments are as follows:

####View 
The Backbone View in which the template is being loaded, usually `this`

####templateName
For this argument, bbJST follows a bit of convention over configuration. Ideally the templateName string
is the id of the script in which your template lives, minus the '-tpl' ending;
In addition, your file name should match the script's id, e.g:

> templates/text-read.jst.ejs

```html
<script type="text/template" id="text-read-tpl">
    <h1><%=Title%></h1>
    <% paragraphs.forEach(function (paragraph) {
        <p><%=paragraph%></p>    
    <%})%>
</script>
```

The library will automatically look for files whose name matches the templateName within a directory called 'templates'. bbJSt also operates under the assumption that it is loaded into your main html file and that your templates directory is adjacent to that file:

```
|-- app
    |-- js
        |-- collections
        |-- models
        |-- routers
        |-- views
        |-- app.js
    |--templates
        |--text-view.jst.ejs
        |--text-form.jst.ejs
    |-- index.html
```


####Options

bbJST takes an options object, with the following alterations available: 

- `extension`   a string, specifies the file extension, like .html, .tpl, .jst.ejs, default: `".jst.ejs"`
- `directory`   a string, specifies the name of the directory where the template is stored, default: `"/templates/"`
- `path` a string, specifies the project path to the template file, default `undefined`
- `autoRender` a boolean, determines whether the View's render function is invoked after the template is loaded, default: `true`


Some possible examples:

```javascript
MyApp.Views.PostForm = Backbone.View.extend({
    initialize: function () {
        this.template = bbJST.template('post-form', this, {extension: '.html', directory: './my_templates/post_templates/'});
    },
});
```

```javascript
MyApp.Views.PostForm = Backbone.View.extend({
    initialize: function () {
        this.template = bbJST.template('post-form', this, {path: '../other_templates/weirdly_named_template.html'});
    },
});
```

The directory, extension and autoRender options can also be assigned globally:

```javascript
    bbJST.directory = '/my_templates/';
    bbJST.autoRender = false;
```

##Under the Hood 

Essentially, bbJST works by appending a template holder to your root HTML file, loading your template into said holder and compiling the template with Underscore. The library knows to not reload your template if it already exists on the page. In addition, bbJST employs Underscore's `_.wrap` function to ensure that your View's render is not called until its template has been loaded. Upon completion, the code will automatically call render, unless otherwise specified.
 
 A final beneficial feature is bbJST's synchronicity: if you instantiate many different Views with a shared template, the code will still only make one request for that template, calling render on all of the other Views after the initial request is complete.  


***-Vale***
