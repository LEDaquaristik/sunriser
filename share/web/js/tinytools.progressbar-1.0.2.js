/*!
	ProgressBar 1.0.2 - 2014-06-04
	jQuery Tiny Progress Bar
	(c) 2014, http://tinytools.codesells.com
	license: http://www.opensource.org/licenses/mit-license.php
*/

; (function ($, document, window) {
	var progressBar = 'progressBar';
	var progressBarGeneralSettings;

	if ($.progressBar) {
		return;
	}

	publicMethod = $.fn[progressBar] = $[progressBar] = function (options) {
		var settings = options;

		return this.each(function (i, obj) {
			initializeProgressBar(obj, settings);
		});
	};

	function setSettings(options) {
		var settings = $.extend({
			initializing: true,
			percent: 0,
			width: false,
			height: false,
			split: 1,
			backSplitLineColor: "#999",
			foreSplitLineColor: "#ddd",
			showPercent: true,

			//Events:
			onPercentChanged: false
		}, options);

		return settings;
	}

	function getSettings(internalElement) {
		return internalElement.closest('.ProgressBar').data('settings');
	}

	function initializeProgressBar(obj, settings) {
		var setting = setSettings({});
		setting = $.extend(setting, progressBarGeneralSettings);
		settings = $.extend(setting, settings);

		$(obj).addClass("ProgressBar");

		var content = '<p class="BackProgressBarPercent">50%</p>';
		content += '<canvas class="BackCanvas"></canvas>';
		content += '<div class="Bar">';
		content += '<p class="ForeProgressBarPercent">50%</p>';
		content += '<canvas class="ForeCanvas"></canvas>';
		content += '</div>';

		$(obj).append(content);
		$(obj).data("settings", settings);

		if (settings.width != false)
			$(obj).css('width', settings.width);
		else if ($(obj).width() == 0)
			$(obj).css('width', '200px');

		if (settings.height != false)
			$(obj).css('height', settings.height);
		else if ($(obj).height() == 0)
			$(obj).css('height', '20px');

		$(obj).children(".Bar").height($(obj).height());
		$(obj).find("p").css('line-height', $(obj).height().toString() + 'px');
		$(obj).find("canvas").prop('height', $(obj).height().toString());

		changePercentValue($(obj), settings.percent);

		settings.initializing = undefined;
		$(obj).data("settings", settings);

		$(window).resize(function () {
			$(obj).find("p").css('width', $(obj).width().toString() + 'px');
			$(obj).find("canvas").prop('width', $(obj).width().toString());
			drawSplitLines($(obj).find(".BackCanvas"), settings.backSplitLineColor, settings.split);
			drawSplitLines($(obj).find(".ForeCanvas"), settings.foreSplitLineColor, settings.split);
		}).resize();
	}

	function drawSplitLines(canvas, color, split) {
		if (split > 1) {
			var c = canvas.get(0);
			var ctx = c.getContext("2d");

			ctx.clearRect(0, 0, c.width, c.height);
			ctx.strokeStyle = color;
			ctx.lineWidth = 1;

			for (var i = 1; i < split; i++) {
				ctx.beginPath();
				ctx.moveTo(c.width / split * i, 0);
				ctx.lineTo(c.width / split * i, c.height);
				ctx.stroke();
				ctx.closePath();
			}
		}
	}

	$.fn.changePercent = function (newPercent) {
		changePercentValue(this, newPercent);
	}

	function changePercentValue(element, newPercent) {
		var currentSetting = getSettings($(element));

		if ($(element).hasClass('ProgressBar')) {
			var percentText = Math.min(Math.max(newPercent, 0), 100).toString() + "%";
			$(element).children(".Bar").css('width', percentText);

			$(element).find("p").text(currentSetting.showPercent == true ? percentText : "");

			if (currentSetting.initializing == undefined) {
				currentSetting.percent = newPercent;
				$(element).data("settings", currentSetting);
				trigger(currentSetting.onPercentChanged, newPercent, element);
			}
		}
	}

	publicMethod.getSettings = function (internalElement) {
		return internalElement.closest('.ProgressBar').data('settings');
	}

	publicMethod.percentChanged = function (value, caller) {
		trigger(getSettings(caller).onPercentChanged, value, caller);
	}

	function trigger(callback, value, caller) {
		if ($.isFunction(callback)) {
			callback.call(undefined, value, caller);
		}
	}
}(jQuery, document, window));