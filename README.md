This is a very simple server that allows clients to proxy the favicons of any website.

Assuming you want to retrieve the favicon for http://mozilla.org, for instance, you can use:

    http://localhost:3000/http/mozilla.org.ico

## Quick Start

At the terminal, run:

    $ git clone git://github.com/toolness/favicon-proxy.git
    $ cd favicon-proxy
    $ cp config.js.sample config.js
    $ npm install

This should get you set up for development. To run the tests, try:

    $ npm test

Now you can run the development server with:

    $ node_modules/.bin/up -w -n 1 app.js

When deploying for production use, you'll probably want to change `config.js` and then use simply:

    $ node app.js
