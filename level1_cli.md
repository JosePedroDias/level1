# Command Line Interface


Use the Command Line Interface to experiment with the API and work fast.



Fire the CLI:

    node run_level1_cli.js mydb


Notes:

* The REPL returns a summary of the commands syntax when it doesn't understand the command.
* It also autocompletes the first command and reduce operations.


## Example of commands...

    » clear
    removes every item from KVS

    » add {"a":"b"}
    creates a new item with auto-generated key

    » put a {"c":"d", "e":[2,4]}
    set item with key a with given object

    » list
    list values

    » keys
    lists keys

    » values
    lists values

    » get a
    get the item with key a

    » del a
    delete item with key a

    » search "a" in v
    search for items having the attribute a

    » save having_a
    stores result of search to JSON file

    » count "a" in v
    count items having the attribute a

    » now
    timestamp of now

    » now -2d
    timestamp of 2 days ago

    » now 1m
    one minute is milisseconds

    » reduce unique name
    takes the last result of list/search and does a reduce on the set, returning the unique values for attribute name

    » save unique_names true
    stores result of reduce to JSON file

    » reduce min age
    takes the last result of list/search and does a reduce on the set, returning the minimum value of age (Number)




[back to main](https://github.com/JosePedroDias/level1/blob/master/README.md)
