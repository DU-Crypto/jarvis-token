[![Build Status](https://travis-ci.org/dimerica-industries/node-cursor.png)](https://travis-ci.org/dimerica-industries/node-cursor)

# Description
Wrap your buffers! Fluid API! Other things!

# Usage
```javascript
return Cursor.create(2)
	.writeInt8(10)
	.writeUInt32BE(10)
	.buffer();
``` 

##Construction
```javascript
//both work
var a = new Cursor(buffer);
var b = Cursor(buffer);

//also accepts Buffer constructor arguments
var c = Cursor(10); //size
var d = Cursor([0x01, 0x02]); // octals
```
###Cloning
```javascript
//create a cursor pointing at the same buffer
//and the same index
var pos = curs.tell();
var cl = curs.clone();
pos == cl.tell(); //true

//create a cursor and immediately seek to a new pos
var pos = curs.rewind().tell();
var cl = curs.clone(100);
cl.tell() == pos; //false
```

##Reading

Cursor implements all of the `Buffer.readXXX` methods in addition to `toString`.

##Writing

Cursor implements all of the `Buffer.writeXXX` methods in addition to `write` and `fill`.

However, Cursor deviates from Buffer by not offering a `copy` method. Instead, use `copyFrom`

```javascript
//bytes from c2 are copied into c1
c1.copyFrom(c2);
```

##Extending
Sometimes it's beneficial to write have your own read/write primitives, while still providing access to the standard r/w operations.  In those cases, extending Cursor can help.

```javascript
var ProtocolCursor = Cursor.extend(
{
	readInt: function()
	{
		return this.readInt32BE();
	},
	
	writeInt: function(n)
	{
		return this.writeInt32BE(n);
	},
	
	readCrazyObject: function()
	{
		var len = this.readInt();
		var bytes = this.slice(len);
		
		//unpack your bytes
		...
	}
});

var obj = ProtocolCursor(buffer).readCrazyObject();
```


# License (MIT)
```
Copyright (c) 2013 Dimerica Industries, LLC

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
    
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
    
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```
