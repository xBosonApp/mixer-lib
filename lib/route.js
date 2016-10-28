
// 方便记录路由
module.exports.create_route_saver = create_route_saver;

function create_route_saver() {
	var route = [];

	var ret = function(r) {
		route.push(r);
		return r;
	}

	ret.getRoute = function() {
		return route;
	}

	ret.className = 'create_route_saver';

	return ret;
}