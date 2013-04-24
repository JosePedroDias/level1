# level 1 - A leveldb wrapper for nodejs



## Summary

It offers an **abstraction over the leveldb key value store** ([core](https://github.com/JosePedroDias/level1/blob/master/level1_core.md)),
a **command line interface** ([cli](https://github.com/JosePedroDias/level1/blob/master/level1_cli.md)),
an **http interface** ([http](https://github.com/JosePedroDias/level1/blob/master/level1_http.md)) and
an **http client** ([http client](https://github.com/JosePedroDias/level1/blob/master/level1_http_client.js), [example](https://github.com/JosePedroDias/level1/blob/master/level1_http_client_demo.html)) for cross-domain usage in web sites.



## Ideas that I may pursuit next...

* add modify method (or extend search) to allow changing/deleting a subset of the items

* add sort/pagination, caching the overall query result

* add a now('-2*d') -> timestamp now - 2 days for convenience in the CLI

* expose the on events on http via socket.io

* support for binary files upload and download



## Feedback

If you're using level1 and have suggestions or if you're not using for lacking of feature x, please let me know.
