# CHANGELOG

## 0.4 - 2013/04/26

* improved the CLI
    
    * created `now [<time expression>]` command for computing timestamps (useful to pass in to search commands)
    * added `reduce <op> <option>*` operation with several useful algorithms (ex: unique attributes, unique values for attribute, top values for attribute, min value for attribute, etc.)
    * added `save <file> <fromReduce>` to store result to JSON file
    * added autocomplete for both command and reduce ops
