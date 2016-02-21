

function create_http_app_chain(fn) {
	var next = not_set;

	if (!fn) fn = not_set;

	// 保持 方法的简洁
	var ret = function(req, res) {
		fn(req, res);
		next(req, res);
	};

	ret.append = function(_next_fn) {
		if (fn === not_set) {
			fn = _next_fn;
		} 
		else if (next === not_set) {
			next = create_http_app_chain(_next_fn);
		} 
		else {
			next.append(_next_fn);
		}
	}

	function not_set() {
		if (fn === not_set)
			console.warn("not set any app.");
	}

	return ret;
}