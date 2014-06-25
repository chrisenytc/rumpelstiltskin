# ![Rumpelstiltskin](logo.png)

> The powerful framework for making awesome apis with node.js

[![Build Status](https://secure.travis-ci.org/chrisenytc/rumpelstiltskin.png?branch=master)](http://travis-ci.org/chrisenytc/rumpelstiltskin) [![GH version](https://badge-me.herokuapp.com/app/gh/chrisenytc/rumpelstiltskin.png)](http://badges.enytc.com/for/gh/chrisenytc/rumpelstiltskin)

## Getting Started

1º Clone Rumpelstiltskin repo

```bash
git clone https://github.com/chrisenytc/rumpelstiltskin.git
```

2º Enter in rumpelstiltskin directory
```bash
cd rumpelstiltskin
```

3º Install dependencies

```bash
npm install
```

4º Configure the settings in `api/config`

5º Build Rumpelstiltskin

```bash
make build
```

6º Start Rumpelstiltskin

```bash
npm start
```

Test your Rumpelstiltskin app

```bash
npm test
```

## Documentation

### Controllers

You can controllers for Rumpelstiltskin.js using javascript functions and create controller methods via prototype.

How to create controllers

Example:

```javascript

module.exports = function(app, config) {

    //Root Application
    var ApplicationController = app.getLib('appController');

    function IndexController() {
        ApplicationController.call(this);
    }

    util.inherits(IndexController, ApplicationController);

    IndexController.prototype.index = function index(req, res, next) {
        //Helpers
        var authConfig = app.getConfig('auth'),
            service = app.getService('utilsService'),
            model = app.getModel('User');
        //Send response
        return res.sendResponse(200, {welcome: 'Welcome to Rumpelstiltskin.js', config: authConfig});
    };

    return IndexController;
};

```

### Routes

Routes are used to connect the requests of users to your controllers/actions.

How to create routes

Example: 

```javascript

module.exports = {

    /*
     * Route => GET /
     */

    'get /': { // Http method: get, post, put and delete with route path
        controller: 'HomeCtrl', // Name of your controller file without .js extension
        action: 'index' // name of the method of your controller
    }

};

```

### Policies

Policies are versatile tools for you to protect your routes, you can, for example, allow only logged in users can access system that route.

How to create policies

Example:

`api/policies/isLogged.js`

```javascript
module.exports = function(req, res, next) {
    if(req.user) {
        return next();
    } else {
        return res.redirect('/login');
    }
};
```

Declare this policie in `api/policies.js`

Example:

```javascript

module.exports = {

    /*
     * Policie => HomeCtrl
     */

    HomeCtrl: { // Controller that will be protected by this policie
        '*': true, // All methods of this controller are public
        'index': 'isLogged', //  The method `index` is protected by `isLogged` policie
        'action': function(req, res, next) { // The method `index` is protected by this custom policie
            return next();
        }
    },

    PageCtrl: { // Controller that will be protected by this policie
        '*': false, // All methods of this controller are private
        'about': true // Only `about` method is public
    }
};
```

### Sockets

The Rumpelstiltskin uses socket.io, you need to follow some conventions to able to use it.

1. The file name and the method name will be used as socket path. e.g: `test.js` + `index` = `test/index`
2. You can listen or emit a message using that path. e.g: `on: function(data){}` or `emit: 'message-example'`
3. `this` variable has the scope of socket.io and can use all of its methods. e.g: `this.on('test/index', function(data){});`, `this.emit('test/index', 'message-example')` and more.

How to create Sockets

Example:

```javascript

module.exports = function(app, config) {

    function IndexSocket() {
        //inherits
    }

    IndexSocket.prototype.index = {
        on: function() {
            return this.emit('index/list', {config: config, service: app.getService('utilsService')});
        },
        emit: 'Hello Frontend!'
    };

    return IndexSocket;
};

```

### Services

Services are an abstraction layer that allows you to do all the heavy lifting here and let sockets clean.

Conventions:

- The name of the js file will be used as the name of the service. e.g: `app.getService('utilsService')`

How to create services

Example:

```javascript
module.exports = function utilsService() {
    return 'Hello World!';
};
```

### Models

The models in Carolyne.js uses the mongoose and follows the implementation of the example below:

How to create Models

Example:

```javascript
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * Taks Schema
 */
var TaskSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  title: {
    type: String,
    default: '',
    trim: true,
    required: true
  },
  slug: {
    type: String,
    trim: true,
    required: true,
    unique: true
  },
  content: {
    type: String,
    default: '',
    trim: true
  },
  closed: {
    type: Boolean,
    default: false
  }
});

//Exports model
module.exports = mongoose.model('Task', TaskSchema);
```

### Middlewares

You can add and manage middlewares very easily in Rumpelstiltskin.js and may activate it or deactivate it very easily and quickly.

The Rumpelstiltskin.js middleware follow the format below:

How to create middlewares

Example:

```javascript
module.exports = {

  /*
   * Set true if you want enable this middleware
   */
  enabled: false,
  fn: function (req, res, next) {
    //console.log('Called');
    next();
  }
};
```

### WebServices

WebServices are specific to provide static JSON files can be accessed via: `/ws/nameofjsonfile.json`

Conventions:

- All services are on route `/ws/`
- The name of the JSON file will be used as the name of the route. e.g: `/ws/nameofjsonfile`
- Routes can use the `.json` extension optionally. e.g: `/ws/nameofjsonfile.json`

The services accept any valid JSON.

How to create webservices

Example:

```json
[
  {
    "name": "Bella"
  },
  {
    "name": "Livia"
  }
]
```

### Extensions

If you want, you cant to extends the Rumpelstiltskin Core without change any files in the core.

You need to create extensions

How to create extensions

Example: 

`lib/extensions/extension.js`

```javascript

module.exports = {
    core: {
        extends: function(App) {
            //Middleware
            App.use(function(req, res, next) {
                return next();
            });
            //Route
            App.get('/customCtrl', function(req, res) {
                return res.send('Testing extension');
            });
        }
    }
};
```

How to create socket extensions

Example: 

`lib/extensions/socket.js`

```javascript

module.exports = {
    core: {
        extends: {
            socket: function(io) {
                //Socket Middleware
                io.use(function(req, next) {
                    return next();
                });
            }
        }
    }
};
```

### Settings

The Rumpelstiltskin works with environments, you can have multiple configurations in your application.

How to use Settings

The defaults environments are: `development`, `test` and `production`. You also create your own customized reports environments.

You can access the contents of environments using `app.getConfig('nameofconfigfile')`

Conventions:

- The name of the configuration files in `api/config/<env>` are the names used to get the contents of the settings in: `app.getConfig('nameofconfigfile')`


##### Custom Environments

How to create custom environments

1º Create `mycustomenv` folder in `api/config/`

2º Create config files in `api/config/mycustomenv`

3º Run your environment

```bash
NODE_ENV=mycustomenv node app
```

Example:

```bash
NODE_ENV=production node app
```

## Contributing

Please submit all issues and pull requests to the [chrisenytc/rumpelstiltskin](http://github.com/chrisenytc/rumpelstiltskin) repository!

## Support
If you have any problem or suggestion please open an issue [here](https://github.com/chrisenytc/rumpelstiltskin/issues).

## License 

The MIT License

Copyright (c) 2014, Christopher EnyTC

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
