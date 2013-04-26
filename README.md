# level 1 - A leveldb wrapper for nodejs



## Summary

It offers an **abstraction over the leveldb key value store** ([core](https://github.com/JosePedroDias/level1/blob/master/level1_core.md)),
a **command line interface** ([cli](https://github.com/JosePedroDias/level1/blob/master/level1_cli.md)),
an **http interface** ([http](https://github.com/JosePedroDias/level1/blob/master/level1_http.md)) and
an **http client** ([http client](https://github.com/JosePedroDias/level1/blob/master/level1_http_client.js), [example](https://github.com/JosePedroDias/level1/blob/master/level1_http_client_demo.html)) for cross-domain usage in web sites.

This project is a work in development, meaning the API is subject to change (eventually).
Don't use it in production sites just yet.

I haven't tested the project on Windows. It might break due to slash paths, but I'm not sure. If you do test it there and it works drop me a line.



## How to install for usage

Make sure you have a somewhat recent install of [node.js](http://nodejs.org/) >=0.8 should work just fine.
Then the following line should install level1 and its dependencies (leveldown compiles leveldb so it may take some minutes if you haven't installed this dependency yet):

    npm install level1


## How to do run the examples

Either clone the repository and run the **run*** samples from there

or

install via npm and copy the **run*** examples from github, removing the `./` prefix from `require('./level1')`.




## Ideas that I may pursuit next...

* add modify method (or extend search) to allow changing/deleting a subset of the items

* add sort/pagination, caching the overall query result

* expose the on events on http via socket.io

* support for binary files upload and download



## Feedback

If you're using level1 and have suggestions or if you're not using for lacking of feature x, please let me know.
