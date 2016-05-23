// 数据工具包, 对各种数据类型的包装器
var log = require('logger-lib');


module.exports.fromTxt = function(txt) {
	var ret = {};

	// 原始文本
	ret.txt = notchange(txt);

	// 返回解析后的 OBJECT, 失败返回 null
	ret.obj = jsonTxtToObj(txt);

	// 返回 xml 字符串, 失败返回 null
	ret.xml = objToXmlTxt(null, jsonTxtToObj(txt));

	return ret;
};


module.exports.fromObj = function(obj) {
	var ret = {};

	// 解析对象为 JSON 字符串
	ret.txt = objToJsonTxt(obj);

	// 作为 JSON 字符串并返回解析后的 OBJECT, 失败返回 null
	ret.obj = notchange(obj);

	// 返回 xml 字符串, 失败返回 null
	ret.xml = objToXmlTxt(obj);

	return ret;
};


module.exports.fromXml = function(xmltxt) {
  // throw new Error("unsupport");
	var ret = {};

	// 作为 JSON 字符串并返回解析后的 OBJECT, 失败返回 null
	ret.obj = xmlTxtToObj(xmltxt);

	// 返回 xml 字符串, 失败返回 null
	ret.xml = notchange(xmltxt);

	// 解析对象为 JSON 字符串
	ret.txt = objToJsonTxt(null, xmlTxtToObj(xmltxt));

	return ret;
};


function objToXmlTxt(_o, _prefn) {
	return _cache(function() {
    if (_prefn) _o = _prefn();
		return __toXmlTxt(_o);
	});
}


function xmlTxtToObj(xmltxt) {
	return _cache(function() {
		return __parseXml(xmltxt);
	});
}


function objToJsonTxt(o, _prefn) {
	return _cache(function() {
    if (_prefn) o = _prefn;
		return JSON.stringify(o);
	});
}


function jsonTxtToObj(jtxt) {
	return _cache(function() {
		try {
			return JSON.parse(jtxt);
		} catch(Err) {
			log.debug('mixer-lib.util.data 解析JSON错误:', jtxt);
			return null;
		}
	});
}


function notchange(o) {
	return function() {
		return o;
	};
}


/// 因为是不可变对象, 所以允许缓存
function _cache(cb) {
	var _cache = null;
	var nocache = true;

	return function() {
		if (nocache) {
			_cache = cb();
			nocache = false;
		}
		return _cache;
	}
}


function __toXmlTxt(_o) {
	var ret = [];
	var _ = function(s) { s && ret.push(s); return _; };

	var xmlinfo = _o.xml || { "_attr_": {"version":"1.0","encoding":"utf-8"} };
	_('<?xml')(wattr(xmlinfo))('?>');
	delete _o.xml;
	pobj(_o);

  return ret.join('');


	function pobj(o) {
		var attr = o._attr_ && wattr(o);

		for (var n in o) {
			if (n == '_attr_') {
				continue;

			} else if (!o[n]) {
				_("<")(n)(attr)("/>");

      } else {
        ctype(n, attr, o[n]);
      }

			// } else if (o[n].constructor == Array) {
		 //  	for (var i=0; i<o.length; ++i) {
		 //  		wtag(n, attr, o[n][i]);
		 //  	}

		 //  } else {
			// 	if (o[n])	{
			// 		if (typeof o[n] == 'object') {
			// 			wtag(n, attr, function() { pobj(o[n]); });
			// 		}
			// 		else wtag(n, attr, function() { _(o[n]); });
			// 	}
		 //  }
		}
	}

  function ctype(n, attr, o) {
    if (typeof o == 'string') {
      wtag(n, attr, o);
    }
    else if (o.constructor == Array) {
      wtag(n, attr, function() { 
        for (var i=0; i<o.length; ++i) {
          ctype(String(i), '', o[i]);
        }
      });
    }
    else if (o.constructor == Buffer) {
      wtag(n, attr, o.toString());
    }
    else if (typeof o == 'object') {
      wtag(n, attr, function() { pobj(o); });
    } else {
      wtag(n, attr, o);
    }
  }

	function wtag(name, attr, content) {
		_("<")(name)(attr)(">");
		if (content) {
			if (typeof content == 'function') {
				content();
			} else {
				_(content);
			}
		}
		_("</")(name)(">");
	}

	function wattr(o) {
		var ret1 = [];
		var _1 = function(s) { ret1.push(s); return _1; };
		var a = o._attr_;

		for (var n in a) {
			_1(' ')(n)('="')(a[n])('"');
		}
		return ret1.join('');
	}
}


function __parseXml(txt) {
  var _i    = 0;
  var ret   = {};
  var tmp   = [];
  var name  = null;
// console.log("__parseXml 未完成");

  p(ret, 0);
  return ret;

  function p(currRef, f) {
    var tag = null;
    var cf = 0;

    while (_i < txt.length) {
// if (issp()) console.log('f', txt[_i], f)

      switch (f) {

        case 0: // begin new tag
          skipSpace(0,0);
          if (txt[_i] == '<') {
            if (txt[_i + 1] == '!') {
              f = 10;
              cf = 0;
              break;
            }
            if (txt[_i + 1] == '/') {
              f = 5;
              break;
            }
            if (txt[_i + 1] == '?') ++_i;
            f = 1;
            skipSpace(1, -1);
          }
          break;

        case 1: // tag name
          if (issp() /*txt[_i] == ' '*/) {
            skipSpace(0, -1);
            if (tmp.length > 0) {
              if (txt[_i + 1] != '>') {
                f = 3;
                tag = saveName();
                currRef[tag] = {};
// console.log('settag1', tag);
              }
            } else if (tag) {
              f = 3;
            }
          } else if (txt[_i] == '>') {
            if (txt[_i - 1] == '/' || txt[_i - 1] == '?') {
              tmp.pop();
              f = 0;
            } else {
              f = 2;
              skipSpace(1, -1);
            }
            if (!tag) {
              tag = saveName();
              currRef[tag] = {};
// console.log('settag2', tag);
            }
          } else {
            // if (issp()) throw new Error("不应该有空格");
// console.log('settag >>', "'", txt[_i], "'");
            tmp.push(txt[_i]);
          }
          break;

        case 3: // tag attribute name
          if (txt[_i] == '=') {
            f = 4;
            saveName();
            skipSpace(1, -1);
// console.log('[name]', name)
          } else if (txt[_i] != ' ') {
            tmp.push(txt[_i]);
          }
          break;

        case 4: // tag attribute value
          if (txt[_i] == '"') {
            if (tmp.length > 0) {
              pushAttr();
              f = 1;
            }
          } else {
            tmp.push(txt[_i]);
          }
          break;

        case 2: // tag body
          if (txt[_i] == '<') {
            if (txt[_i + 1] == '!') {
              f = 10;
              cf = 2;
              break;
            }

            if (txt[_i + 1] == '/') {
              f = 5;
              break;
            }

// console.log('pppp1', tag)
            // f = 1;
            tmp = [];
            skipSpace(1, 0);
            p(currRef[tag], 1);
            
          } else {
            f = 6;
          }
          break;

        case 6: // string body
          if (txt[_i] == '<') {
            if (txt[_i + 1] == '!') {
              f = 10;
              cf = 6;
              break;
            }
            f = 2;
            --_i;
          } else {
            tmp.push(txt[_i]);
          }
          break;

        case 5: // tag end
          if (txt[_i] == '>') {
            return;
          }
          break;

        case 10:
          if (txt[_i] == '-' && 
              txt[_i+1] == '-' &&
              txt[_i+2] == '>' ) {
            _i += 3;
            f = cf;
            skipSpace(1, -1);
          }
          break;
      }
      ++_i;
    }

    function pushAttr() {
      if (!currRef[tag]._attr_) currRef[tag]._attr_ = {};
      currRef[tag]._attr_[name] = tmp.join('');
// console.log('[val]', tmp.join(''))
      tmp = [];
    }
  }


  function skipSpace(_in, _out) {
    _i += _in;
    while (issp()) { ++_i; }
    _i += _out;
  }

  function issp() {
    return txt[_i] == ' ' 
        || txt[_i] == "\n" 
        || txt[_i] == "\t" 
        || txt[_i] == "\r";
  }

  function saveName() {
    name = tmp.join('');
    tmp = [];   
    return name;
  }
}