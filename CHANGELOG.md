# CHANGELOG



## 0.4.2 - 2013/04/30

* core:
    * clear now uses db.batch() internally

* http:
    * support favicon.ico (not to be spammed to death by browsers)
    * / route returns basic stats



## 0.4.1 - 2013/04/26

* refactored the files into directories (was getting too crowded!)



## 0.4.0 - 2013/04/26

* improved the CLI
    
    * created `now [<time expression>]` command for computing timestamps (useful to pass in to search commands)
    * added `reduce <op> <option>*` operation with several useful algorithms (ex: unique attributes, unique values for attribute, top values for attribute, min value for attribute, etc.)
    * added `save <file> <fromReduce>` to store result to JSON file
    * added autocomplete for both command and reduce ops
