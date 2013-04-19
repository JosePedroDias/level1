# HTTP Interface


Use the HTTP Interface to interact with the key value store from any location via HTTP GETS/POSTS.
Ỹou can manage several KVSs, as long as they're served from different node instances and network ports.


Fire the HTTP Server:

    node run_level1_http.js mydb



Use it...

    curl http://127.0.0.1:3000/clear

    curl http://127.0.0.1:3000/put --data "item={\"a\":\"b\"}"

    curl http://127.0.0.1:3000/put/a --data "item={\"c\":\"d\", \"e\":[2,4]}"

    curl http://127.0.0.1:3000/list

    curl http://127.0.0.1:3000/keys

    curl http://127.0.0.1:3000/values

    curl http://127.0.0.1:3000/get/a

    curl http://127.0.0.1:3000/del/a

    curl http://127.0.0.1:3000/search --data "filter=\"a\" in v"



[back to main](/JosePedroDias/level1/blob/master/README.md)
