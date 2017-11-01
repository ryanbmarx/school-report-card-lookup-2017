# School Report Card 2017

A [Tarbell](http://tarbell.io) project that publishes to a P2P HTML Story.

ABOUT THIS PROJECT
------------------

This is a 2017 version of the school report cards. It displays basic-level results by grade, from 3rd (parcc) through 11th (SATs). The data in this project comes from a relational DB hosted in an Amazon EC2 instance and is delivered by AJAX. The data is formatted and served to a JS function which creates, inserts and display a school profile. (Getting the source data from ISBE into the DB is an entirely other story. Ooof!)

1) User types a school name into the search bar.

2) The autocomplete/typeahead tool Awesomplete is handing a list of potential schools from an ajax request to our database. As the user continues type, this list is updated.

3) When the user makes a selection, the school ID is pulled from the autocomplete dataset and is sent to a different ajax request to retrieve a datafile from our database.

4) The resulting data file is fed through a transform function, which forces it into the specific data format needed by the displayProfile function.

5) The displayProfile function works its magic and shows off the report card for that school.


Assumptions
-----------

* Python 2.7
* Tarbell 1.0.\*
* Node.js
* grunt-cli (See http://gruntjs.com/getting-started#installing-the-cli)

Custom configuration
--------------------

You should define the following keys in either the `values` worksheet of the Tarbell spreadsheet or the `DEFAULT_CONTEXT` setting in your `tarbell_config.py`:

* p2p\_slug
* headline 
* seotitle
* seodescription
* keywords
* byline

Note that these will clobber any values set in P2P each time the project is republished.  

Building front-end assets
-------------------------

This blueprint creates configuration to use [Grunt](http://gruntjs.com/) to build front-end assets.

When you create a new Tarbell project using this blueprint with `tarbell newproject`, you will be prompted about whether you want to use [Sass](http://sass-lang.com/) to generate CSS and whether you want to use  [Browserify](http://browserify.org/) to bundle JavaScript from multiple files.  Based on your input, the blueprint will generate a `package.json` and `Gruntfile.js` with the appropriate configuration.

After creating the project, run:

    npm install

to install the build dependencies for our front-end assets.

When you run:

    grunt

Grunt will compile `sass/styles.scss` into `css/styles.css` and bundle/minify `js/src/app.js` into `js/app.min.js`.

If you want to recompile as you develop, run:

    grunt && grunt watch

This blueprint simply sets up the the build tools to generate `styles.css` and `js/app.min.js`, you'll have to explicitly update your templates to point to these generated files.  The reason for this is to make you think about whether you're actually going to use an external CSS or JavaScript file and avoid a request for an empty file if you don't end up putting anything in your custom stylesheet or JavaScript file.

To add `app.min.js` to your template file:

    
    <script src="js/app.min.js"></script>
    