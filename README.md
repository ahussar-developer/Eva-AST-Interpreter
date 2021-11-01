# Eva AST Interpreter 
Created during the Building an Interpreter from Scratch Course by Dimitri Soshnikov

Implemented an interpreter for a python-like language using Javascript. This fully implemented programming language, known as Eva, supports:
- Control Flow
- Syntactic Sugar
- Recursive calls
- Functional Programming
- Closures
- First-class Functions
- Lambda functions
- Classes: Class inheritance, super calls
- Modules and Imports
- OOP


To run the project:
- Download and unzip source code
- move into the eva directory
- chmod +x /bin/eva
- ./bin/eva -e 'one-time expression in s-expression'
    - example: ./bin/eva -e '(print((lambda (x) (* x x)) 2))'
- ./bin/eva -f ./filename.eva
    - this runs an eva file that is in the main eva directory
    -example: ./bin/eva -f ./test.eva