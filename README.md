# level 1 - A leveldb wrapper for nodejs



## Summary

It offers an **tiny abstraction over the leveldb key value store**
([docs](https://github.com/JosePedroDias/level1/blob/master/docs/core.md)),
a **command line interface**
([docs](https://github.com/JosePedroDias/level1/blob/master/docs/cli.md),
 [example](https://github.com/JosePedroDias/level1/blob/master/examples/server/cli.js)),
an **http interface**
([docs](https://github.com/JosePedroDias/level1/blob/master/docs/http.md),
 [example](https://github.com/JosePedroDias/level1/blob/master/examples/server/http.js),) and
an **http client**
([example 1](https://github.com/JosePedroDias/level1/blob/master/examples/client/http.html),
 [example 2](https://github.com/JosePedroDias/level1/blob/master/examples/client/img.html)) for cross-domain usage in web sites.

This project's code is [MIT licensed](http://www.tldrlegal.com/license/mit-license#).


### Disclaimer

This project is a work in development, meaning the API is subject to change (eventually).
Don't use it in production sites just yet.

I haven't tested the project on Windows. It might break due to slash paths, but I'm not sure. If you do test it there and it works drop me a line.



## When it is valuable?

* You need KISS persistence for a web experiment
* You want to do CRUD of JS objects
* You want easy KPIs



## How to install for usage

Make sure you have a somewhat recent install of [node.js](http://nodejs.org/) >=0.8 should work just fine.
Then the following line should install level1 and its dependencies (leveldown compiles leveldb so it may take some minutes if you haven't installed this dependency yet):

    npm install level1



## How to do run the examples

Either clone the repository and run the examples from there

or

install via npm and copy the examples from github, replacing the level1 require for `require('level1')`.



## Ideas that I may pursuit next...

* add modify method (or extend search) to allow changing/deleting a subset of the items

* add sort/pagination, caching the overall query result

* support an optional access control function to tweak which http requests are authorized to do which operations

* expose the on events on http via socket.io

* support for binary files upload and download



## Feedback

If you're using level1 and have suggestions or if you're not using for lacking of feature x, please let me know.
