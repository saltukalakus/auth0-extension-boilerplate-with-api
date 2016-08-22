module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/build/";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var nconf = __webpack_require__(1);
	var Webtask = __webpack_require__(2);

	var server = null;
	var getServer = function getServer(req, res) {
	    if (!server) {
	        nconf.defaults({
	            AUTH0_DOMAIN: req.webtaskContext.secrets.AUTH0_DOMAIN,
	            EXTENSION_SECRET: req.webtaskContext.secrets.EXTENSION_SECRET,
	            WT_URL: req.webtaskContext.secrets.WT_URL,
	            NODE_ENV: 'development',
	            HOSTING_ENV: 'webtask',
	            CLIENT_VERSION: process.env.CLIENT_VERSION
	        });

	        // Start the server.
	        server = __webpack_require__(3);
	    }
	    return server(req, res);
	};

	module.exports = Webtask.fromExpress(function (req, res) {
	    return getServer(req, res);
	});

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = require("nconf");

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = require("webtask-tools");

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var express = __webpack_require__(4);
	var Webtask = __webpack_require__(2);
	var app = express();
	var api = express.Router();
	var jwtExpress = __webpack_require__(5);
	var auth0 = __webpack_require__(6);
	var metadata = __webpack_require__(7);

	app.use(__webpack_require__(8));

	app.use('/api', api);

	app.use(auth0({
	  clientName: 'Auth0 Extension with Api Boilerplate',
	  scopes: 'read:connections',
	  apiToken: {
	    payload: function payload(req, res, next) {
	      // Add extra info to the API token
	      req.userInfo.MoreInfo = "More Info";
	      next();
	    },
	    secret: function secret(req) {
	      return req.webtaskContext.data.EXTENSION_SECRET;
	    }
	  }
	}));

	app.get('/', function (req, res) {
	  var view = ['<html>', '  <head>', '    <title>Auth0 Extension</title>', '    <script type="text/javascript">', '       if (!sessionStorage.getItem("token")) {', '         window.location.href = "' + res.locals.baseUrl + '/login";', '       }', '    </script>', '  </head>', '  <body>', '    <p><strong>Token</strong></p>', '    <textarea rows="10" cols="100" id="token"></textarea>', '    <script type="text/javascript">', '       var token = sessionStorage.getItem("token");', '       if (token) {', '         document.getElementById("token").innerText = token;', '       }', '    </script>', '    <p><strong>API Token</strong></p>', '    <textarea rows="10" cols="100" id="apiToken"></textarea>', '    <script type="text/javascript">', '       var apiToken = sessionStorage.getItem("apiToken");', '       if (apiToken) {', '         document.getElementById("apiToken").innerText = apiToken;', '       }', '    </script>', '  </body>', '</html>'].join('\n');

	  res.header("Content-Type", 'text/html');
	  res.status(200).send(view);
	});

	// This endpoint would be called by webtask-gallery to dicover your metadata
	app.get('/meta', function (req, res) {
	  res.status(200).send(metadata);
	});

	////////////// API //////////////
	api.use(jwtExpress({
	  secret: function secret(req, payload, done) {
	    done(null, req.webtaskContext.data.EXTENSION_SECRET);
	  }
	}));

	api.get('/secured', function (req, res) {
	  if (!req.user) {
	    return res.sendStatus(401);
	  }

	  res.status(200).send({ user: req.user });
	});
	////////////// API //////////////

	module.exports = app;

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = require("express");

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = require("express-jwt");

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = require("auth0-oauth2-express");

/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = {
		"title": "Auth0 Extension Boilerplate with API",
		"name": "auth0-extension-boilerplate-with-api",
		"version": "1.1.0",
		"author": "auth0",
		"description": "This is a Hello World extension",
		"type": "application",
		"repository": "https://github.com/auth0/auth0-extension-boilerplate-with-api",
		"keywords": [
			"auth0",
			"extension"
		],
		"auth0": {
			"scopes": "read:connections"
		}
	};

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var express = __webpack_require__(4);
	var dev = express.Router();

	if ((process.env.NODE_ENV || 'development') === 'development') {
	  var token = __webpack_require__(9).randomBytes(32).toString('hex');

	  dev.use(function (req, res, next) {
	    req.webtaskContext = {
	      data: {
	        EXTENSION_SECRET: token // This will be automatically provisioned once the extensions is installed
	      }
	    };

	    next();
	  });

	  dev.use('/api', function (req, res, next) {
	    req.webtaskContext = {
	      data: {
	        EXTENSION_SECRET: token // This will be automatically provisioned once the extensions is installed
	      }
	    };

	    next();
	  });
	}

	module.exports = dev;

/***/ },
/* 9 */
/***/ function(module, exports) {

	module.exports = require("crypto");

/***/ }
/******/ ]);