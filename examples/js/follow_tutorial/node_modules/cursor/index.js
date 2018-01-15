var Cursor = function(buffer)
{
	if (!(this instanceof Cursor))
	{
		return new Cursor(buffer);
	}

	if (!(buffer instanceof Buffer))
	{
		buffer = new Buffer(buffer);
	}

	this._setBuffer(buffer);
	this.rewind();
};

Cursor.prototype._setBuffer = function(buffer)
{
	this._buffer = buffer;
	this.length = buffer.length;
};

Cursor.prototype.buffer = function()
{
	return this._buffer;
};

Cursor.prototype.tap = function(cb)
{
	cb(this);
	return this;
};

Cursor.prototype.clone = function(newIndex)
{
	var c = new this.constructor(this.buffer());
	c.seek(arguments.length === 0 ? this.tell() : newIndex);

	return c;
};

Cursor.prototype.tell = function()
{
	return this._index;
};

Cursor.prototype.seek = function(op, index)
{
	if (arguments.length == 1)
	{
		index = op;
		op = '=';
	}

	if (op == '+')
	{
		this._index += index;
	}
	else if (op == '-')
	{
		this._index -= index;
	}
	else
	{
		this._index = index;
	}

	return this;
};

Cursor.prototype.rewind = function()
{
	return this.seek(0);
};

Cursor.prototype.eof = function()
{
	return this.tell() == this.buffer().length;
};

Cursor.prototype.write = function(string, length, encoding)
{
	return this.seek('+', this.buffer().write(string, this.tell(), length, encoding));
};

Cursor.prototype.fill = function(value, length)
{
	if (arguments.length == 1)
	{
		length = this.buffer().length - this.tell();
	}
	
	this.buffer().fill(value, this.tell(), this.tell() + length);
	this.seek('+', length);

	return this;
};

Cursor.prototype.slice = function(length)
{
	if (arguments.length === 0)
	{
		length = this.length - this.tell();
	}

	var c = new this.constructor(this.buffer().slice(this.tell(), this.tell() + length));
	this.seek('+', length);

	return c;
};

Cursor.prototype.copyFrom = function(source)
{
	var buf = source instanceof Buffer ? source: source.buffer();
	buf.copy(this.buffer(), this.tell(), 0, buf.length);
	this.seek('+', buf.length);

	return this;
};

Cursor.prototype.concat = function(list)
{
	for (var i in list)
	{
		if (list[i] instanceof Cursor)
		{
			list[i] = list[i].buffer();
		}
	}

	list.unshift(this.buffer());

	var b = Buffer.concat(list);
	this._setBuffer(b);

	return this;
};

Cursor.prototype.toString = function(encoding, length)
{
	if (arguments.length === 0)
	{
		encoding = 'utf8';
		length = this.buffer().length - this.tell();
	}
	else if (arguments.length === 1)
	{
		length = this.buffer().length - this.tell();
	}

	var val = this.buffer().toString(encoding, this.tell(), this.tell() + length);
	this.seek('+', length);

	return val;
};

[
	[1, ['readInt8', 'readUInt8']],
	[2, ['readInt16BE', 'readInt16LE', 'readUInt16BE', 'readUInt16LE']],
	[4, ['readInt32BE', 'readInt32LE', 'readUInt32BE', 'readUInt32LE', 'readFloatBE', 'readFloatLE']],
	[8, ['readDoubleBE', 'readDoubleLE']]
].forEach(function(arr)
{
	arr[1].forEach(function(method)
	{
		Cursor.prototype[method] = function()
		{
			var val = this.buffer()[method](this.tell());
			this.seek('+', arr[0]);

			return val;
		};
	});
});

[
	[1, ['writeInt8', 'writeUInt8']],
	[2, ['writeInt16BE', 'writeInt16LE', 'writeUInt16BE', 'writeUInt16LE']],
	[4, ['writeInt32BE', 'writeInt32LE', 'writeUInt32BE', 'writeUInt32LE', 'writeFloatBE', 'writeFloatLE']],
	[8, ['writeDoubleBE', 'writeDoubleLE']]
].forEach(function(arr)
{
	arr[1].forEach(function(method)
	{
		Cursor.prototype[method] = function(val)
		{
			val = this.buffer()[method](val, this.tell());
			this.seek('+', arr[0]);

			return this;
		};
	});
});

//basic extend functionality to facilitate
//writing your own cursor while still providing
//access to low level r/w functionality
Cursor.extend = function(C, proto)
{
	var parent = this;

	if (arguments.length === 1)
	{
		proto = C;
		C = null;
	}

	proto = proto || {};

	C = C || function ctor(buffer)
	{
		if (!(this instanceof C))
		{
			return new C(buffer);
		}

		parent.call(this, buffer);
	};

	require('util').inherits(C, parent);

	C.extend = parent.extend;
	C.define = parent.define;

	for (var i in proto)
	{
		C.define(i, proto[i]);
	}

	return C;
};

Cursor.define = function(name, fn)
{
	var proto = this.prototype[name];

	this.prototype[name] = proto && function()
	{
		this.__super = proto;
		return fn.apply(this, arguments);
	} || fn;
};

module.exports = Cursor;
