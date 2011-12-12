// To work with navigators which have no console
(function (a) {
	a.log = function () {
		if (window.console && window.console.log) {
			console.log.apply(window.console, arguments)
		}
	};
	a.fn.log = function () {
		a.log(this);
		return this
	}
})(jQuery);

(function (a) {
	a.error = function () {
		if (window.console && window.console.error) {
			console.error.apply(window.console, arguments)
		}
	};
	a.fn.error = function () {
		a.error(this);
		return this
	}
})(jQuery);