/**
 * jQuery core - v1.0
 * auth: shenmq
 * E-mail: mqshen@126.com
 * website: shenmq.github.com
 */

(function( $, undefined ) {
    "use strict";
	
	var matched, browser;

	// Use of jQuery.browser is frowned upon.
	// More details: http://api.jquery.com/jQuery.browser
	// jQuery.uaMatch maintained for back-compat
	jQuery.uaMatch = function( ua ) {
	    ua = ua.toLowerCase();

	    var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
	        /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
	        /(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
	        /(msie) ([\w.]+)/.exec( ua ) ||
	        ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
	        [];

	    return {
	        browser: match[ 1 ] || "",
	        version: match[ 2 ] || "0"
	    };
	};

	matched = jQuery.uaMatch( navigator.userAgent );
	browser = {};

	if ( matched.browser ) {
	    browser[ matched.browser ] = true;
	    browser.version = matched.version;
	}

	// Chrome is Webkit, but Webkit is also Safari.
	if ( browser.chrome ) {
	    browser.webkit = true;
	} else if ( browser.webkit ) {
	    browser.safari = true;
	}

	jQuery.browser = browser;

// prevent duplicate loading
// this is only a problem because we proxy existing functions
// and we don't want to double proxy them
$.lily = $.lily || {};
if ( $.lily.version ) {
	return;
}

jQuery.fn.extend({
	bind: function( types, data, fn ) {
		this.off( types, null, fn );
		return this.on( types, null, data, fn );
	}
});

$.extend( $.lily, {
	minInterval: 1000,
    browser: function(browser) {
		var ua = navigator.userAgent.toLowerCase();
		var match = /(chrome)[ \/]([\w.]+)/.exec(ua) || /(webkit)[ \/]([\w.]+)/.exec(ua) || /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) || /(msie) ([\w.]+)/.exec(ua) || ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) || [];

		if (browser == 'version')
		{
			return match[2];
		}

		if (browser == 'webkit')
		{
			return (match[1] == 'chrome' || match[1] == 'webkit');
		}
		return match[1] == browser;
	},
    oldIE: function() {
			if ($.lily.browser('msie') && parseInt($.lily.browser('version'), 10) < 9) {
				return true;
			}
			return false;
	},
	ajax: function(options, errorCallback) {
		//console.log(options);
		//try{initAutoOutTimer();}catch(e){};
		var startTime = (new Date()).getTime()
		var option = $.extend(options, {cache:false, dataType:'json',traditional: true});
		if(option.data) {
			$.extend(option.data, $.lily.collectCsrfData())
		}
		else {
			option.data =  $.lily.collectCsrfData()
		}

		option.complete = function(xhr) {
		    if (xhr.status == 302) {
                location.href = xhr.getResponseHeader("Location");
            }
		}

        option.success = function(data) {

			if(data.returnCode != '0' && data.returnCode != '000000') {
			    if(data.returnCode === 302 ) {
			        window.location.href = data.redirect;
			    }
			    else {
			    	$.lily.showTips(data.errorMsg);
					if(errorCallback) {
						errorCallback(data);
					}
			    }
			}
			else {
				var currentTime = (new Date()).getTime();
				var timeInterval = currentTime - startTime ;
                if(options.processResponse) {
                    if(timeInterval < $.lily.minInterval) {
                        setTimeout(function() {options.processResponse(data) }, $.lily.minInterval - timeInterval);
                    }
                    else {
                        options.processResponse(data)
                    }
                }
			}
		}
				
		return $.ajax(option);
	},
	
	formatPostData: function(data) {
		$.extend(data, $.lily.collectCsrfData())
	},
	
	collectCsrfData: function() {
		var data = {}
        $('#csrfForm > input').each(function(){
        	data[this.name] = this.value
        });
		return data; 
	},
	collectCsrfDataStr: function() {
		var data = ""
        $('#csrfForm > input').each(function(){
        	data += '' + this.name + '=' + this.value +''
        });
		return data; 
	},
    generateUID : function() {
        var guid = "";
        for (var i = 1; i <= 32; i++){
            var n = Math.floor(Math.random()*16.0).toString(16);
            guid += n;
            if((i==8)||(i==12)||(i==16)||(i==20))
                guid += "-";
        }
        return guid;
    },

    changeData: function($targetElement, data) {
        $('[data-toggle=remote],[data-toggle=datepick]' , $targetElement).each(function () {
    		var $this = $(this)
            var name = $this.attr("name")
            var value = data[name]
            if(value === undefined || value === 'null')
                return
            if(this.nodeName !== 'INPUT' && this.nodeName !== 'SELECT')
                $this.text(value)
            else
                $this.val(value)
    	})
 
    },
    collectRequestData: function(sourceElement) {
        var orginRequestData = {}

        $('[data-toggle=remote],[data-toggle=datepick],input' , sourceElement).each(function () {
    		var $this = $(this)
            if($this.attr("type") == "checkbox" && !$this.attr("checked"))
                return
            var value = "";
            if(this.nodeName !== 'INPUT' && this.nodeName !== 'SELECT' && this.nodeName != 'TEXTAREA') {
                value = $this.text()
            }
            else {
                value = $this.val().trim()
            }
            if(value && !$.lily.format.isEmpty(value) ){
                var name = $this.attr("name")
                if(name.endsWith("[]")){
                    name = name.substring(0, name.length - 2)
        	        if(orginRequestData[name]) {
                    	orginRequestData[name].push(value)
        	        }
        	        else {
        	        	orginRequestData[name] = []
        	        	orginRequestData[name].push(value)
        	        }
                }
                else {
                    orginRequestData[name] = value
                }
            }
    	})

        $('[data-toggle="select"]', sourceElement).each(function() {
        	var $this = $(this)
        	var orginStatues = $(this).attr("data-orgin-statues")
        	var selected = false;
        	if(orginStatues == "selected") {
        		if($this.hasClass("selected"))
        			return
        		selected = false;
        	}
        	else {
        		if(!$this.hasClass("selected"))
        			return
        		selected = true;
        	}
        	var contentValue = $this.attr("data-content")
        	var requestName = $this.attr("name")
        	if(!selected)
        		requestName += "Del"
        	
            var $parent = $this.closest('[data-toggle="select-radio"]')

            if($parent.length > 0) {
            	orginRequestData[requestName] = contentValue
                return
            } 
        	if(orginRequestData[requestName]) {
            	orginRequestData[requestName].push(contentValue)
        	}
        	else {
        		orginRequestData[requestName] = []
        		orginRequestData[requestName].push(contentValue)
        	}
        })
        return orginRequestData
    },
    showWait : function(target) {
    	var waitObj = $('<a class="wait" href="javascript:;">nbsp;</a>');

    	waitObj.css({
    		width: target.width(),
    		height: target.height(),
    		'float': target.css("float"),
            padding: target.css("padding"),
    		margin: target.css("margin")
    	})
        if(target.css("display") == 'inline-block')
            waitObj.css({
                display: target.css("display"),
                "vertical-align": "top"
            })
    	target.hide();
    	waitObj.insertAfter(target);
    },
    hideWait: function(target) {
    	target.next('.wait').remove();
    	target.css("display", "")
    },

    fillHtml: function($obj, data) {
        var name = $obj.attr("name")
        if(!name)
            return 
        var dateType = "text"
        if(name.endsWith("Date")){
            dateType = "date"
            name = name.substring(0, name.length - 4)
        }
        var nameArray = name.split(".")
        var value = data
        for(var i in nameArray){
            value = value[nameArray[i]]
            if(!value)
                break
        }
        if(!value)
            return
        if(dateType == "date")
            value = value.substring(0, 10)
        if(value)
		    $obj.html(value)
    },

    showWarring: function($obj, highlightColor, duration) {
        var highlightBg = highlightColor || "#FFFF9C"
        var animateMs = duration || 1000 // edit is here
        var originalBg = $obj.css("background-color")
        if (!originalBg || originalBg == highlightBg)
            originalBg = "#FFFFFF"; // default to white
        $obj.css("backgroundColor", highlightBg)
            .animate({ backgroundColor: originalBg }, animateMs, null, function () {
                $obj.css("backgroundColor", originalBg); 
            });
    },

    hexDigits: new Array("0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"), 

    rgb2hex: function(rgb) {
        rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        if(rgb && rgb.length > 2)
            return $.lily.hex(rgb[1]) + $.lily.hex(rgb[2]) + $.lily.hex(rgb[3]);
    },

    hex: function(x) {
        return isNaN(x) ? "00" : $.lily.hexDigits[(x - x % 16) / 16] + $.lily.hexDigits[x % 16];
    },
    showTips: function(str, t) {
        if(arguments.length == 1) t = 3000;
        var obj = $('<div class="modal-warn">' + str + '</div>')
        $('body').append(obj);
     	setTimeout(function(){obj.remove()}, t)
    }
});
})( jQuery ); 

!function(){

    "use strict";

    var Collapse = function(element, options) {
        this.$element = $(element)
        this.options = $.extend({}, $.fn.collapse.defaults, options)
        this.$trigger      = $('[data-toggle="collapse"][href="#' + element.id + '"],' +
                                   '[data-toggle="collapse"][data-target="#' + element.id + '"]')
        if (this.options.parent) {
            this.$parent = this.getParent()
        }
    }

    Collapse.prototype = {
        constructor: Collapse,

        dimension: function () {
            var hasWidth = this.$element.hasClass('width')
            return hasWidth ? 'width' : 'height'
        },

        show: function () {
            if (this.transitioning || this.$element.hasClass('in')) return

            var activesData
            var actives = this.$parent && this.$parent.children('.panel').children('.in, .collapsing')

            if (actives && actives.length) {
              activesData = actives.data('bs.collapse')
              if (activesData && activesData.transitioning) return
            }

            var startEvent = $.Event('show.bs.collapse')
            this.$element.trigger(startEvent)
            if (startEvent.isDefaultPrevented()) return

            if (actives && actives.length) {
              Plugin.call(actives, 'hide')
              activesData || actives.data('bs.collapse', null)
            }

            var dimension = this.dimension()

            this.$element
              .removeClass('collapse')
              .addClass('collapsing')[dimension](0)
              .attr('aria-expanded', true)

            this.$trigger
              .removeClass('collapsed')
              .attr('aria-expanded', true)

            this.transitioning = 1

            var complete = function () {
              this.$element
                .removeClass('collapsing')
                .addClass('collapse in')[dimension]('')
              this.transitioning = 0
              this.$element
                .trigger('shown.bs.collapse')
            }

            if (!$.support.transition) return complete.call(this)

            var scrollSize = $.camelCase(['scroll', dimension].join('-'))

            this.$element
              .one('bsTransitionEnd', $.proxy(complete, this))
              .emulateTransitionEnd(Collapse.TRANSITION_DURATION)[dimension](this.$element[0][scrollSize])
        },

        hide: function () {
            if (this.transitioning || !this.$element.hasClass('in')) return

            var startEvent = $.Event('hide.bs.collapse')
            this.$element.trigger(startEvent)
            if (startEvent.isDefaultPrevented()) return

            var dimension = this.dimension()

            this.$element[dimension](this.$element[dimension]())[0].offsetHeight

            this.$element
              .addClass('collapsing')
              .removeClass('collapse in')
              .attr('aria-expanded', false)

            this.$trigger
              .addClass('collapsed')
              .attr('aria-expanded', false)

            this.transitioning = 1

            var complete = function () {
              this.transitioning = 0
              this.$element
                .removeClass('collapsing')
                .addClass('collapse')
                .trigger('hidden.bs.collapse')
            }

            if (!$.support.transition) return complete.call(this)

            this.$element
              [dimension](0)
              .one('bsTransitionEnd', $.proxy(complete, this))
              .emulateTransitionEnd(Collapse.TRANSITION_DURATION)
        },

        toggle: function () {
            this[this.$element.hasClass('in') ? 'hide' : 'show']()
        },

        getParent: function () {
            return $(this.options.parent)
              .find('[data-toggle="collapse"][data-parent="' + this.options.parent + '"]')
              .each($.proxy(function (i, element) {
                var $element = $(element)
                this.addAriaAndCollapsedClass(getTargetFromTrigger($element), $element)
              }, this))
              .end()
        }


    }
    function getTargetFromTrigger($trigger) {
      var href 
      var target = $trigger.attr('data-target') 
        || (href = $trigger.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') // strip for ie7
      return $(target) 
    }

    function Plugin( option ) {
        return this.each(function () {
            var $this = $(this), 
                data = $this.data('collapse'), 
                options = typeof option == 'object' && option;
            if (!data) {
                $this.data('collapse', (data = new Collapse(this, options)));
           }
           if (option == 'toggle')
               data.toggle();
        });
    }
    
    $.fn.collapse             = Plugin
    $.fn.collapse.Constructor = Collapse 

    $.fn.collapse.defaults = {
        loadingText: 'loading...'
    }
    

    $(document).on('click.collapse.data-api', '[data-toggle^=collapse]', function (e) {
        var href;
        var $trigger = $(e.target)
        if('collapse' != $trigger.attr("data-toggle") ) {
            $trigger = $trigger.closest('[data-toggle="collapse"]');
        }
        var target = $trigger.attr('data-target')
              || (href = $trigger.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') // strip for ie7
        $(target).collapse("toggle")
        e.preventDefault(); 
        e.stopPropagation();

    })
}(window.jQuery);

!function(){

    "use strict";

    var Form = function(element, options) {
        this.$element = $(element)
        this.$submitButton = this.$element.find('[data-toggle^=submit]')
        this.options = $.extend({}, $.fn.form.defaults, options)
        this.$element.validator()
        var self = this
        this.$backdrop           = null
        this.$body               = $(document.body)
        if(this.$element.attr("ajax")) this.options.ajax = true
        this.$element.submit(function(e) {
            if(!self.checkData()) {
                e.preventDefault();
                e.stopPropagation();
                return
            }
        });
    }

    Form.prototype = {
        constructor: Form,

        showBackdrop: function() {
            this.$backdrop = $('<div class="modal-backdrop in" ><div class="loading-container"><div class="loading">加载中···</div></div></div>').appendTo(this.$body)
        },

        removeBackdrop: function () {
            this.$backdrop && this.$backdrop.remove()
            this.$backdrop = null
        },

        checkData: function() {
            var needConfirm = this.$submitButton.attr("data-confirm");
            if(needConfirm) {
                var r=confirm(needConfirm);
                if (!r) {
                    return false;
                }
            }

            if(this.options.loadingBackdrop) {
                this.showBackdrop()
            }

            this.oldText = this.$submitButton.text()


            var disableText = this.$submitButton.attr("data-disable-with")
            this.$submitButton.prop("disabled",true)
            if(disableText)
                this.$submitButton.text(disableText)
            var checkResult = this.$element.data('validator').check();
            if(this.options.customerCheck && !this.options.customerCheck()) {
                checkResult.passed = false
            }
            if(!checkResult.passed) {
                this.resetButton()
                return false;
            }

            if(this.options.formCheck && !this.options.formCheck()) {
                this.resetButton()
                return false;
            }
            return checkResult.requestData
        },

        resetButton: function() {
            var disableText = this.$submitButton.attr("data-disable-with")
            this.$submitButton.prop("disabled", false)
            if(disableText)
                this.$submitButton.text(this.oldText)
        },

        submit: function() {

            var self = this
            var requestData = self.checkData()
            if(!requestData) {
                return
            }
            var disableText = this.$submitButton.attr("data-disable-with")

            function processResponse(responseData) {
                var e  = $.Event('lily.form:submit', { responseData: responseData})
                self.$element.trigger(e)
                if(!self.options.unRefresh) {
                    self.resetForm()
                }
            }

            $('#page_back_field').val("1")

            function resetButton(data) {
                self.$submitButton.prop("disabled", false)
                self.removeBackdrop()
                if(disableText)
                    self.$submitButton.text(self.oldText)
                if(data.token)
                    $('[name=csrf_token]').val(data.token)
            }

            var pjaxContainer = this.$element.attr("data-pjax");
            if(pjaxContainer) {
                $.pjax({
                    type: 'POST',
                    url: this.$element.attr("action"),
                    container: pjaxContainer,
                    data: requestData
                })
            }
            else if(this.options.ajax) {
                $.lily.ajax({url: this.$element.attr("action"),
                    data: requestData,
                    dataType: 'json',
                    type: 'POST',
                    processResponse: processResponse
                }, resetButton)

            } else {
                this.$element.submit()
            }
        },

        resetForm: function() {
            var disableText = this.$submitButton.attr("data-disable-with")
            this.$submitButton.prop("disabled", false)
            if(disableText) 
                this.$submitButton.text(this.oldText)
            if(this.$element.attr("data-save"))
                return
            this.$element[0].reset()
        }

    }

    $.fn.form = function ( option ) {
        return this.each(function () {
            var $this = $(this), 
                data = $this.data('form'), 
                options = typeof option == 'object' && option;
            if (!data) {
                //var form = $this.closest("form")
                $this.data('form', (data = new Form($this, options)));
           }
           if (option == 'submit') 
               data.submit();
        });
    }
    
    $.fn.form.defaults = {
        loadingText: 'loading...',
        ajax: false,
        loadingBackdrop: false
    }
    
    $.fn.form.Constructor = Form 

    $(document).on('click.form.data-api', '[data-toggle^=submit]', function (e) {
        var $btn = $(e.target)
        var $form = $btn.closest("form")
        $form.form("submit")
        e.preventDefault();
        e.stopPropagation();
    })
}(window.jQuery);




/**
 * jQuery format - v1.0
 * auth: shenmq
 * E-mail: shenmq@yuchengtech.com
 * website: shenmq.github.com
 *
 */
 
(function( $, undefined ) {
	"use strict";

	if(!Function.bind) {

		Function.prototype.update = function(array, args) {
			var arrayLength = array.length, length = args.length;
		    while (length--) 
		    	array[arrayLength + length] = args[length];
		    return array;
		}
		Function.prototype.merge = function(array, args) {
		    array = Array.prototype.slice.call(array, 0);
		    return Function.update(array, args);
		}
		
		Function.prototype.bind = function(context) {
			if (arguments.length < 2 && typeof arguments[0] === "undefined") return this;
			var __method = this, args = Array.prototype.slice.call(arguments, 1);
			return function() {
				var a = Function.merge(args, arguments);
				return __method.apply(context, a);
			}
		}
	}

	/**
	 * 连续count个当前字符串连接
	 * @param {int} count
	 * @returns {string} 
	 */
	String.prototype.times = function(count) {
    	return count < 1 ? '' : new Array(count + 1).join(this);
  	}

    String.prototype.endsWith = function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    }
	
	/**
	 * 字符串左补0到指定位数
	 * @param {int} width
	 * @returns {string} 
	 */
	String.prototype.leftPadZero = function( width ) {
		var pad = width - this.length;
		if ( pad > 0 ){
			return ("0".times(pad) + this); 
		}else{
			return this;	
		}
	};
	
	String.prototype.blank = function() {
	    return /^\s*$/.test(this);
	}
	
	/**
	 * 将日期对象根据指定的格式格式化为字符串
	 * @param {string} format 日期格式
	 * @returns {string}
	 */
	Date.prototype.format = function( format ){
		if ( !format ){
			format = $.lily.format.DATE_FORMAT;
		}
		return format.replace(
			$.lily.format.REGEXP_DATE,
			function(str){
				switch ( str.toLowerCase() ){
					case 'yyyy': return this.getFullYear();
					case 'mm': return (this.getMonth() + 1).toString().leftPadZero(2);
					case 'dd': return this.getDate().toString().leftPadZero(2);
					case 'hh': return this.getHours().toString().leftPadZero(2);
					case 'mi': return this.getMinutes().toString().leftPadZero(2);
					case 'ss': return this.getSeconds().toString().leftPadZero(2);
					case 'ms': return this.getMilliseconds().toString().leftPadZero(3);
				}
			}.bind(this)
		);
	};
	
	/**
	 * 比较日期是否为同一天
	 * @param {Date} compareDate 要比较的日期
	 * @returns {boolean} 
	 */
	Date.prototype.isSameDay = function( compareDate ) {
        if(typeof compareDate != 'object')
            return false;
		return ( this.getFullYear() === compareDate.getFullYear() && 
            this.getMonth() === compareDate.getMonth() && 
            this.getDate() === compareDate.getDate() );
	};
	
	/**
	 * 比较日期大小,如果compareDate较大则返回true
	 * @param {Date} compareDate 要比较的日期
	 * @returns {boolean} 
	 */
	Date.prototype.isBefore= function( compareDate ) {
		var sDate = this;
		var eDate = compareDate;
		var flag = true;
		if (flag && sDate.getFullYear() > eDate.getFullYear()) {
			flag = false;
		}
		if (flag && sDate.getFullYear() == eDate.getFullYear()
				&& sDate.getMonth() > eDate.getMonth()) {
			flag = false;
		}
		if (flag && sDate.getFullYear() == eDate.getFullYear()
				&& sDate.getMonth() == eDate.getMonth()
				&& sDate.getDate() > eDate.getDate()) {
			flag = false;
		}
		return flag;
	};
	/**
	 * 取得当前日期的下一天
	 * @returns {Date} 
	 */
	Date.prototype.nextDay = function( ) {
		return new Date(Date.parse(this)+86400000);
	};

    Date.prototype.minus = function(date) {
        var interval = this.getTime() - date.getTime();
        return interval / 86400000;
    };
	
	
	
	$.lily.format = $.lily.format || {};
	
	$.extend( $.lily.format, {
		
		/*
		* 常量
		*/
		AREA_CODE : {11:"北京",12:"天津",13:"河北",14:"山西",15:"内蒙古",21:"辽宁",22:"吉林",23:"黑龙江",31:"上海",32:"江苏",33:"浙江",34:"安徽",35:"福建",36:"江西",37:"山东",41:"河南",42:"湖北",43:"湖南",44:"广东",45:"广西",46:"海南",50:"重庆",51:"四川",52:"贵州",53:"云南",54:"西藏",61:"陕西",62:"甘肃",63:"青海",64:"宁夏",65:"新疆",71:"台湾",81:"香港",82:"澳门",91:"国外"},
		MONEY_NUMS : new Array("零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"), 
		MONEY_DIGITS : new Array("", "拾", "佰", "仟"), 
		MONEY_BIGUNITS : new Array("", "万", "亿", "万亿","仟兆"),
		MONEY_SHOWNAME : new Array("分", "角", "圆"),
		
		MONEY_POSTFIX : "整",
		DATETIME_FORMAT : "yyyymmddhhmiss",
		TIME_FORMAT : "hhmiss",
		TIME_FORMAT_DISPLAY : "hh:mi:ss",
		DATE_FORMAT : "yyyy-mm-dd",
		DATE_FORMAT_DISPLAY : "yyyy年mm月dd日",
		DATE_FORMAT_SHORT : "yyyy-mm-dd",
		
		/**
		* 正则表达式定义
		*/
		REGEXP_INTEGER : new RegExp(/^[0-9]+$/),
		REGEXP_FLOAT : new RegExp(/^([0-9]+(\.+))[0-9]+$/),
		REGEXP_DECIMAL : new RegExp(/^([0-9]+(\.?))?[0-9]+$/),
		REGEXP_MONEY : new RegExp(/^[0-9]*\.?[0-9]{0,2}$/),
		REGEXP_COMMA : new RegExp('\,',["g"]),
		REGEXP_NEGSIGN : new RegExp('\-',["g"]),
		REGEXP_DOT : new RegExp('\\.',["g"]),
		REGEXP_EMAIL : new RegExp(/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/),
		REGEXP_DATE : new RegExp(/(yyyy|mm|dd|hh|mi|ss|ms)/gi),
		REGEXP_PHONE : new RegExp(/^((0\d{2,3})-)(\d{7,8})(-(\d{1,6}))?$/),
		REGEXP_MOBILE : new RegExp(/^(0|1[3|4|5|7|8])[0-9]{9}$/),
		REGEXP_FAX : new RegExp(/^((\d{3,4})[ \-])(\d{7,8})([ \*\-](\d{1,6}))?$/),
		// 验证身份证上的出生时间
		REGEXP_DATEFORMAT : new RegExp(/^[1|2]\d{3}((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3([0|1])))$/),
		REGEXP_POSITIVENUMBER : new RegExp(/^[1-9][0-9]*$/),		
		REGEXP_ODDNUMBER : new RegExp(/^[A-Za-z0-9]*$/),
		isEmpty: function(s) {
			return ( s == null || s.length === 0 );
		},

		isInteger: function(s) {
			return ( $.lily.format.REGEXP_INTEGER.test(s) );
		},
		
		/**
		* 判断输入变量是否是大于0的整数
		* @param {string} s 要检查的变量值
		* @returns {boolean} 是否为大于0的整数
		*/
		isPositiveNumber: function(s) {
			return ( $.lily.format.REGEXP_POSITIVENUMBER.test(s) );
		},

        isSameStart: function(one, another, index) {
            if(one.length < index || another < index)
                return false
            return one.substring(0,index) == another.sbustring(0, index)
        },
		
		/**
		* 判断输入变量是否是英文字母、数字、或者英文字母和数字的组合
		* @param {string} s 要检查的变量值
		* @returns {boolean} 是否是英文字母、数字、或者英文字母和数字的组合
		*/
		isOddNumber: function(s) {
			return ( $.lily.format.REGEXP_ODDNUMBER.test(s) );
		},
		
		/**
		* 判断输入变量是否是浮点数（即小数点后有数字）
		* @param {string} s 要检查的变量值
		* @returns {boolean} 是否为浮点数
		*/
		isFloat: function( s ){
		    return ( $.lily.format.REGEXP_FLOAT.test(s) );
		},

		/**
		* 检查字符串是否为正数（整数或浮点数)
		* @param {string} s 字符串
		* @returns {boolean} 是否为正数（整数或浮点数)
		*/
		isDecimal: function(s) {
		    return ( $.lily.format.REGEXP_DECIMAL.test(s) );
		},

		/**
		* 检查字符串是否为合法的金额
		* @param {string} s 字符串
		* @returns {boolean} 是否为合法金额
		*/
		isMoney: function(s) {
		    return ( $.lily.format.REGEXP_MONEY.test(s) );
		},

		/**
		* 检查字符串是否为合法的固定电话号码
		* @param {string} s 字符串
		* @returns {boolean} 是否为合法固定电话号码
		*/
		isPhone: function(s) {
			return ( $.lily.format.REGEXP_PHONE.test(s) || $.lily.format.REGEXP_MOBILE.test(s));
		},

		/**
		* 检查字符串是否为合法的传真
		* @param {string} s 字符串
		* @returns {boolean} 是否为合法传真
		*/
		isFax: function(s) {
			return ( $.lily.format.REGEXP_FAX.test(s) );
		},
		
		/**
		* 检查字符串是否为合法的手机号码
		* @param {string} s 字符串
		* @returns {boolean} 是否为合法手机号码
		*/
		isMobile: function(s) {
		    return ( $.lily.format.REGEXP_MOBILE.test(s) );
		},

		/**
		* 检查字符串是否全部为中文
		* @param {string} s 字符串
		* @returns {boolean} 是否全部为中文
		*/
		isChinese: function(s) {
		    for (var index = 0, len = s.length; index < len; index++) {
		        var charCode = s.charCodeAt(index);
		        if ( ( charCode < 19968 ) || (charCode > 40869) ) {
		            return false;
		        }
		    }
		    return true;
		},

		/**
		* 检查字符串是否为合法的Email
		* @param {string} s 字符串
		* @returns {boolean} 是否为合法Email
		*/
		isEmail: function(s) {
		    if(s.length>50){
		        return false;
		    }
		    return ( $.lily.format.REGEXP_EMAIL.test(s) );
		},
		
		/**
		 * 检查日期格式是否正确
		 */
		isDate:function(date){
			return ($.lily.format.REGEXP_DATEFORMAT.test(date));
		},
		
		/**
		* 检查字符串是否为合法的身份证号码
		* @param {string} s 字符串
		* @returns {boolean} 是否为合法身份证号码
		*/
		isIDNumber: function( s ){
		    // 检查长度是否合法
		    switch(s.length){
		        case 15: case 18:{ 
		            break;
		        }
		        default:{
		            return false;
		        }
		    }
		    // 检查是否为数字
		    var testInt = ( s.length==15 ) ? s : s.substr(0,17) ;
		    if( !$.lily.format.isInteger(testInt) ) {
		        return false;
		    }
		    // 检查区域代码是否合法
		    var areaCode = parseInt( s.substr(0,2), 10);
		    if( !$.lily.format.AREA_CODE[areaCode] ) {
		        return false;
		    }
		    ///^([1-2]\d{3})(0?[1-9]|10|11|12)([1-2]?[0-9]|0[1-9]|30|31)$/ig
		    // 检查出生日期是否合法
		    var birthDay = ( s.length==15 ) ? ("19" + s.substr(6,6) ): s.substr(6,8);
		    if ( !$.lily.format.isDate( birthDay, $.lily.format.DATE_FORMAT ) ){
		        return false;
		    }
		    // 检查校验位是否合法
		    if ( s.length==18 ){
		    	var testNumber = ( parseInt(s.charAt(0), 10) + parseInt(s.charAt(10), 10) ) * 7
		            + ( parseInt(s.charAt(1), 10) + parseInt(s.charAt(11), 10) ) * 9
		            + ( parseInt(s.charAt(2), 10) + parseInt(s.charAt(12), 10) ) * 10
		            + ( parseInt(s.charAt(3), 10) + parseInt(s.charAt(13), 10) ) * 5
		            + ( parseInt(s.charAt(4), 10) + parseInt(s.charAt(14), 10) ) * 8
		            + ( parseInt(s.charAt(5), 10) + parseInt(s.charAt(15), 10) ) * 4
		            + ( parseInt(s.charAt(6), 10) + parseInt(s.charAt(16), 10) ) * 2
		            + parseInt(s.charAt(7), 10) * 1
		            + parseInt(s.charAt(8), 10) * 6
		            + parseInt(s.charAt(9), 10) * 3 ;
		        if ( s.charAt(17) != "10X98765432".charAt( testNumber % 11 ) ){
		            return false;
		        }
		    }
		    return true;
		},
		
		
		
		parseDate: function( dateString, format ){
			var year=2000,month=0,day=1,hour=0,minute=0,second=0;
			format = format ||  $.lily.format.DATE_FORMAT;
			var matchArray = format.match( $.lily.format.REGEXP_DATE );
			for (var i = 0; i < matchArray.length; i++ ) {
				var postion =format.indexOf( matchArray[i] );
				switch (matchArray[i]) {
					case "yyyy":{
						year = parseInt( dateString.substr(postion,4), 10 );
						break;
					}
					case "mm":{
						month = parseInt( dateString.substr(postion,2), 10 )-1;
						break;
					}
					case "dd":{
						day = parseInt( dateString.substr(postion,2), 10 );
						break;
					}
					case "hh":{
						hour = parseInt( dateString.substr(postion,2), 10 );
						break;
					}
					case "mi":{
						minute = parseInt( dateString.substr(postion,2), 10 );
						break;
					}
					case "ss":{
						second = parseInt( dateString.substr(postion,2), 10 );
						break;
					}
				}
			}
			return new Date(year,month,day,hour,minute,second);
		},
		
		formatDate: function(date, outFormat ) {
			if(date === '' || date == null){
				return '';
			}
			else {
				var parsedDate = date
				if(typeof date === "string") 
					parsedDate = $.lily.format.parseDate( date, $.lily.format.DATE_FORMAT )
				if(typeof date === 'number')
					parsedDate = new Date(date)
					
				
				if( outFormat && typeof outFormat === "string" ) {
					return parsedDate.format( outFormat );
				}
				else {
					return parsedDate.format( $.lily.format.DATE_FORMAT_SHORT );	
				}
			}
		},
		
		formatTime: function( data, format ){
			var parsedDate = $.lily.format.parseDate( data, $.lily.format.TIME_FORMAT );
			if( format && typeof outFormat === "string" ) {
				return parsedDate.format( format );
			}
			else {
				return parsedDate.format( $.lily.format.TIME_FORMAT_DISPLAY );	
			}
		},
        
        formatInputTime: function(e) {
            var pattern = /^\s*(\d{1,2})(?:[.:]?([0-5]\d?)?)?(?:[.:]?([0-5]\d?)?)?(?:\s*([ap])(?:\.?m\.?)?|\s*[h]?)?\s*$/i 
            var t, n, r, i, s, o, u, a, f;
            a = "" + e;
            if (e instanceof Date) 
                r = e.getHours(), s = e.getMinutes(), u = e.getSeconds()
            else {
                i = a.match(pattern)
                f = i[0], 
                r = i[1], 
                s = i[2], 
                u = i[3], 
                n = i[4], 
                r = parseInt(r, 10), 
                s = parseInt(s != null ? s : "0", 10), 
                u = parseInt(u != null ? u : "0", 10), 
                t = n != null ? n.match(/a/i) : void 0, 
                o = n != null ? n.match(/p/i) : void 0, 
                1 <= r && r <= 11 && o && (r += 12), 
                r === 12 && t && (r = 0) 
            }
            var hour = r != null ? r : 0
            var minute = s != null ? s : 0
            var second = u != null ? u : 0
            if (!(0 <= (r = hour) && 
                r <= 23 && 
                0 <= (i = minute) && 
                i <= 59 && 0 <= (s = second) && 
                s <= 59)) 
                throw Error("invalid time (" + hour + ", " + minute + ", " + second + ")");
            var ampm, hour12;
            ampm = hour < 12 ? "am" : "pm", 
            hour === 0 ? hour12 = 12 : hour > 12 ? hour12 = hour - 12 : hour12 = hour
            function normalizeFormat(e) {
                return e < 10 ? "0" + e : "" + e
            }
            n = [normalizeFormat(minute), 
                    normalizeFormat(second)], 
            second === 0 && (n.pop(), minute === 0 && n.pop()) 
            n.length && (n = ":" + n.join(":")) 
            return "" + hour12 + n + ampm
        },

		formatDateTime: function( data, format ){
			var parsedDate = $.lily.format.parseDate( data, $.lily.format.DATETIME_FORMAT );
			if( format && typeof outFormat === "string" ){
				return parsedDate.format( format );
			}
			else {
				return parsedDate.format( $.lily.format.DATE_FORMAT_SHORT +" "+ $.lily.format.TIME_FORMAT_DISPLAY );	
			}
		},
		
		removeComma: function(str){
			return str.replace($.lily.format.REGEXP_COMMA,'');
		},
		removeNegSign: function(str){
			return str.replace($.lily.format.REGEXP_NEGSIGN,'');
		},
		
		addComma: function(str) {
			if (str.length > 3) {
				var mod = str.length % 3;
				var output = (mod > 0 ? (str.substring(0,mod)) : '');
				for (var i=0 ; i < Math.floor(str.length / 3); i++) {
					if ((mod === 0) && (i === 0))
						output += str.substring(mod+ 3 * i, mod + 3 * i + 3);
					else
						output += ',' + str.substring(mod + 3 * i, mod + 3 * i + 3);
				}
				return (output);
			}
			else 
				return str;
		},

		prepareCashString: function( cash, dot, digits ) {
			if (cash === undefined) cash = '0';
			if (dot === undefined) dot = true;
			if (digits === undefined) digits = 2;
			
			if (typeof cash !== 'string') {
				cash = cash.toString();
			}
			cash = $.lily.format.removeComma(cash);
			
			//TODO检查是否金额
			// 处理包含正负符号的情况
			var prefix = cash.charAt(0);
			if ( prefix == "-" || prefix == "+" ){
				return prefix + $.lily.format.prepareCashString( cash.substr(1), dot, digits );
			}
			
			if (cash.indexOf('.') != -1) {
				dot = true;	//如果输入串本身包含小数点，则忽略dot参数的设置，认为是真实金额大小
			}
			var integerCash, decimalCash;
			if (!dot) {
				if (cash.length <= digits) {
					cash = cash.leftPadZero(digits+1);
				}
				integerCash = cash.substring(0, cash.length - digits);
				decimalCash = cash.substring(cash.length - digits);
			} 
			else {
				var dotPos = cash.indexOf('.');
				if (dotPos != -1) {
					integerCash = cash.substring(0, dotPos);
					decimalCash = cash.substring(dotPos + 1);
				} 
				else {
					integerCash = cash;
					decimalCash = '';
				}
				if (integerCash.length === 0)
					integerCash = '0';
				if (decimalCash.length < digits) {
					decimalCash += '0'.times(digits - decimalCash.length);
				} 
				else {
					decimalCash = decimalCash.substring(0, digits);		//TODO 考虑四舍五入
				}
			}
			
			//去掉头部多余的0
			while (integerCash.charAt(0) == '0' && integerCash.length>1) {
				integerCash = integerCash.substring(1);
			}
			cash = integerCash + '.' + decimalCash;
			
			return cash;
		},
		
		convertIntegerToChineseCash: function(cash){
			if ( cash == "0" ) 
				return "";
		    var S = ""; //返回值 
		    var p = 0; //字符位置index 
		    var m = cash.length % 4; //取模 
		
		    // 四位一组得到组数 
		    var k = (m > 0 ? Math.floor(cash.length / 4) + 1 : Math.floor(cash.length / 4)); 
		    // 外层循环在所有组中循环 
		    // 从左到右 高位到低位 四位一组 逐组处理 
		    // 每组最后加上一个单位: "[万亿]","[亿]","[万]" 
		    for (var i = k; i > 0; i--)  {
		        var L = 4; 
		        if (i == k && m !== 0) {
		            L = m;
		        }
		        // 得到一组四位数 最高位组有可能不足四位 
		        var s = cash.substring(p, p + L);
		        var l = s.length;
		
		        // 内层循环在该组中的每一位数上循环 从左到右 高位到低位 
		        for (var j = 0;j < l;j++) {
		            var n = parseInt(s.substring(j, j+1), 10);
		            if (n === 0) {
		                if ((j < l - 1) && (parseInt(s.substring(j + 1, j + 1+ 1), 10) > 0) //后一位(右低) 
		                    && S.substring(S.length-1,S.length) != $.lily.format.MONEY_NUMS[n]) {
		                    S += $.lily.format.MONEY_NUMS[n];
		                }
		            }
		            else {
		                //处理 1013 一千零"十三",  1113一千一百"一十三" 
		//                if (!(n == 1 && (S.substring(S.length-1,S.length) == $.lily.format.MONEY_NUMS[0] | S.length == 0) && j == l - 2)) 
		//                {
		                    S += $.lily.format.MONEY_NUMS[n];
		//                }
		                S +=  $.lily.format.MONEY_DIGITS[l - j - 1];
		            }
		        }
		        p += L;
		        // 每组最后加上一个单位: [万],[亿] 等 
				if (i < k) {
					//不是最高位的一组 
					if (s>0) {
		                //如果所有 4 位不全是 0 则加上单位 [万],[亿] 等 
		                S += $.lily.format.MONEY_BIGUNITS[i - 1];
		            }
		        }
		        else {
		            //处理最高位的一组,最后必须加上单位 
		            S += $.lily.format.MONEY_BIGUNITS[i - 1];
		        }
		    }
			return S + $.lily.format.MONEY_SHOWNAME[2];
		},
		
		convertDecimalToChineseCash: function( cash ){
			var returnCash = "";
			if ( cash == "00" ){
				returnCash = $.lily.format.MONEY_POSTFIX;
			}
			else {
				for( var i = 0;i < cash.length; i++ ){
					if( i >= 2 ){break;}
					var intValue = parseInt(cash.charAt(i), 10);
					switch( i ) {
						case 0:
							if ( intValue !== 0 ){
								returnCash += $.lily.format.MONEY_NUMS[intValue] + $.lily.format.MONEY_SHOWNAME[1];
							}
							break;
						case 1:
							returnCash += $.lily.format.MONEY_NUMS[intValue] + $.lily.format.MONEY_SHOWNAME[0];
							break;
						default:
							break;
					}
				}
			}
			return returnCash;	
		},
		
		toPercentRate: function (rate){
			if($.lily.format.isEmpty(rate) ){
				return '';
			}
			if ( parseFloat(rate) === 0 ) {
				return '';
			}
			var temp = parseFloat(rate);
			return temp*100+"%";
		},
		
		toChineseCash: function( cash ){
			cash=$.lily.format.removeComma(cash);
			if ( $.lily.format.isEmpty(cash)|| !$.lily.format.isMoney(cash) ) {
				return '';
			}
			var noCommaCash = $.lily.format.prepareCashString(cash);
			if ( parseFloat(cash) === 0 ) {
				return '';
			}
			if( $.lily.format.isInteger( noCommaCash ) ) {
				return $.lily.format.convertIntegerToChineseCash(noCommaCash);
			}	
			var dotIndex = noCommaCash.indexOf('.');
			var integerCash = noCommaCash.substring( 0, dotIndex );
			var decimalCash = noCommaCash.substring( dotIndex + 1 );
			var result = "";
			if (!$.lily.format.isEmpty(integerCash) ){
				result += $.lily.format.convertIntegerToChineseCash(integerCash);
			}
			if ( !$.lily.format.isEmpty(decimalCash) ){
				result += $.lily.format.convertDecimalToChineseCash(decimalCash);
			}
			return result;
		},

		toGiftBonus: function( cash ){
		    return "赠送 " + cash + " 积分";
        },
		
		toCashWithComma: function( cash, dot, digits ) {
			if (cash != null && typeof cash !== "string") {
				cash = cash.toString();
			}
			if(cash === '' || cash == null){
				return '';
			}
			else {
				var temp = $.lily.format.prepareCashString( cash, dot, digits );
				
				var dotPos = temp.indexOf('.');
				var integerCash = temp.substring(0, dotPos);
				var decimalCash = temp.substring(dotPos + 1);
			
				// 处理包含正负符号的情况
				var prefix = integerCash.charAt(0);
				if ( prefix == "-" || prefix == "+" ) {
					temp = prefix + $.lily.format.addComma(integerCash.substring(1)) + '.' + decimalCash;
				} 
				else {
					temp = $.lily.format.addComma(integerCash) + '.' + decimalCash;
				}
				return temp;
			}
		},
		
		/**
		 * 日期校验函数
		 * 
		 * **/
		checkDate:function(startDate,endDate,dur,minDate,maxDate){
			if($.lily.format.isEmpty(startDate)&&$.lily.format.isEmpty(endDate))
				return true;
			
			var sDate;
			var eDate;
			
			//如果只传入开始日期则默认判断结束日期是否在minDate之前，minDate为空则默认为一年前的当天。
			if(!$.lily.format.isEmpty(startDate)){
				if(startDate.length == 8){
					sDate = new Date(startDate.substr(0,4)+'/'+startDate.substr(4,2)+'/'+startDate.substr(6,2));
				}else{
					sDate = new Date(startDate.replace(/-/g,   "/"));
				}
				if($.lily.format.isEmpty(minDate)) {
					if(sDate.isBefore(new Date($.lily.format.getLastMonth($.lily.sessionData.session_sysDate,'12').replace(/-/g,   "/")))) 
						return '开始日期必须在一年以内！';
				}else {
					if(sDate.isBefore(new Date(minDate.replace(/-/g,   "/"))))
						return ('开始日期不能早于'+minDate+'！');
				}	
			}
			
			//如果只传入结束日期则默认判断结束日期是否在maxDate之前，maxDate为空则默认为当天。
			if(!$.lily.format.isEmpty(endDate)){
				if(endDate.length == 8){
					eDate = new Date(endDate.substr(0,4)+'/'+endDate.substr(4,2)+'/'+endDate.substr(6,2));
				}else{
					eDate = new Date(endDate.replace(/-/g,   "/"));
				}
				if($.lily.format.isEmpty(maxDate)) {
					if (!eDate.isBefore(new Date($.lily.sessionData.session_sysDate.replace(/-/g,   "/"))))
						return '结束日期不能超过今天！';
				}else {
					if (!eDate.isBefore(new Date(maxDate.replace(/-/g,   "/"))))
						return ('结束日期不能超过'+maxDate+'！');
				}
			}
			
			if(!sDate.isBefore(eDate)){
				return '开始日期不能大于结束日期！';
			}
			var durMonth ;
			if($.lily.format.isEmpty(dur)){
				durMonth = 3;
			}else{
				durMonth = parseInt(dur, 10);
			}
			if(sDate.isBefore(new Date($.lily.format.getLastMonth( endDate,durMonth).replace(/-/g,   "/")))){
				return ('开始日期和结束日期之间的间隔不能超过'+durMonth+'月');
			}
			return true;
		},
		

		 /**
		 * 以天为单位获取日期
		 * @param {string} startDate指定日期，days间隔天数。
		 * @returns {string} 
		 * **/
		getLastDay:function(startDate,days){
			if(!($.lily.format.isEmpty(startDate))){
				return $.lily.format.formatDateToString((new Date(startDate.replace(/-/g,   "/"))).prevDay(days));
			}else{
				return $.lily.format.formatDateToString((new Date($.lily.sessionData.session_date.replace(/-/g,   "/"))).prevDay(days));
			}
		},
		/**
		 * 以月为单位获取日期,
		 * @param {string} startDate指定日期，decMonth间隔月份。
		 * @returns {string} 
		 * **/
		getLastMonth:function(startDate,decMonth){
			var $startDate = startDate;
			if($.lily.format.isEmpty($startDate)){
				$startDate = new Date($.lily.sessionData.session_date.replace(/-/g,   "/"));
			}else {
				if(startDate.length == 8){
					$startDate = new Date(startDate.substr(0,4)+'/'+startDate.substr(4,2)+'/'+startDate.substr(6,2));
				}else{
					$startDate = new Date(startDate.replace(/-/g,   "/"));
				}
			}
			var decMon =parseInt(decMonth, 10);
			var month = $startDate.getMonth()+1;
			var day = $startDate.getDate();
			var year = $startDate.getFullYear();
			var monthHasDay = new Array([0],[31],[28],[31],[30],[31],[30],[31],[31],[30],[31],[30],[31]);
			while(decMon >=12){
				decMon -=12;
				year -=1;
			}
			if(month<=decMon){
				year -=1;
				month = 12-(decMon-month);
			}else{
				month -=decMon;
			}
			if((year%4 === 0 && year%100 !== 0)||(year%100 === 0 && year%400 === 0)){  
				monthHasDay[2] = 29;  
		     }
			day = monthHasDay[month] >= day ? day : monthHasDay[month];
			var stringDate = year+'-'+(month<10 ? "0" + month : month)+'-'+(day<10 ? "0"+ day : day);
			return stringDate;
		}
	});
})(jQuery);

+function ($) {
  'use strict';

  // MODAL CLASS DEFINITION
  // ======================

  var Modal = function (element, options) {
    this.options             = options
    this.$body               = $(document.body)
    this.$element            = $(element)
    this.$dialog             = this.$element.find('.modal-dialog')
    this.$backdrop           = null
    this.isShown             = null
    this.originalBodyPad     = null
    this.scrollbarWidth      = 0
    this.ignoreBackdropClick = false

    if (this.options.remote) {
      this.$element
        .find('.modal-content')
        .load(this.options.remote, $.proxy(function () {
          this.$element.trigger('loaded.bs.modal')
        }, this))
    }
  }

  Modal.VERSION  = '3.3.4'

  Modal.TRANSITION_DURATION = 300
  Modal.BACKDROP_TRANSITION_DURATION = 150

  Modal.DEFAULTS = {
    backdrop: true,
    keyboard: true,
    show: true
  }

  Modal.prototype.toggle = function (_relatedTarget) {
    return this.isShown ? this.hide() : this.show(_relatedTarget)
  }

  Modal.prototype.show = function (_relatedTarget) {
    var that = this
    var e    = $.Event('show.bs.modal', { relatedTarget: _relatedTarget })

    this.$element.trigger(e)

    if (this.isShown || e.isDefaultPrevented()) return

    this.isShown = true

    this.checkScrollbar()
    this.setScrollbar()
    this.$body.addClass('modal-open')

    this.escape()
    this.resize()

    this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))

    this.$dialog.on('mousedown.dismiss.bs.modal', function () {
      that.$element.one('mouseup.dismiss.bs.modal', function (e) {
        if ($(e.target).is(that.$element)) that.ignoreBackdropClick = true
      })
    })

    this.backdrop(function () {
      var transition = $.support.transition && that.$element.hasClass('fade')

      if (!that.$element.parent().length) {
        that.$element.appendTo(that.$body) // don't move modals dom position
      }

      that.$element
        .show()
        .scrollTop(0)

      that.adjustDialog()

      if (transition) {
        that.$element[0].offsetWidth // force reflow
      }

      that.$element
        .addClass('in')
        .attr('aria-hidden', false)

      that.enforceFocus()

      var e = $.Event('shown.bs.modal', { relatedTarget: _relatedTarget })

      transition ?
        that.$dialog // wait for modal to slide in
          .one('bsTransitionEnd', function () {
            that.$element.trigger('focus').trigger(e)
          })
          .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
        that.$element.trigger('focus').trigger(e)
    })
  }

  Modal.prototype.hide = function (e) {
    if (e) e.preventDefault()

    e = $.Event('hide.bs.modal')

    this.$element.trigger(e)

    if (!this.isShown || e.isDefaultPrevented()) return

    this.isShown = false

    this.escape()
    this.resize()

    $(document).off('focusin.bs.modal')

    this.$element
      .removeClass('in')
      .attr('aria-hidden', true)
      .off('click.dismiss.bs.modal')
      .off('mouseup.dismiss.bs.modal')

    this.$dialog.off('mousedown.dismiss.bs.modal')

    $.support.transition && this.$element.hasClass('fade') ?
      this.$element
        .one('bsTransitionEnd', $.proxy(this.hideModal, this))
        .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
      this.hideModal()
  }

  Modal.prototype.enforceFocus = function () {
    $(document)
      .off('focusin.bs.modal') // guard against infinite focus loop
      .on('focusin.bs.modal', $.proxy(function (e) {
        if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
          this.$element.trigger('focus')
        }
      }, this))
  }

  Modal.prototype.escape = function () {
    if (this.isShown && this.options.keyboard) {
      this.$element.on('keydown.dismiss.bs.modal', $.proxy(function (e) {
        e.which == 27 && this.hide()
      }, this))
    } else if (!this.isShown) {
      this.$element.off('keydown.dismiss.bs.modal')
    }
  }

  Modal.prototype.resize = function () {
    if (this.isShown) {
      $(window).on('resize.bs.modal', $.proxy(this.handleUpdate, this))
    } else {
      $(window).off('resize.bs.modal')
    }
  }

  Modal.prototype.hideModal = function () {
    var that = this
    this.$element.hide()
    this.backdrop(function () {
      that.$body.removeClass('modal-open')
      that.resetAdjustments()
      that.resetScrollbar()
      that.$element.trigger('hidden.bs.modal')
    })
  }

  Modal.prototype.removeBackdrop = function () {
    this.$backdrop && this.$backdrop.remove()
    this.$backdrop = null
  }

  Modal.prototype.backdrop = function (callback) {
    var that = this
    var animate = this.$element.hasClass('fade') ? 'fade' : ''

    if (this.isShown && this.options.backdrop) {
      var doAnimate = $.support.transition && animate

      this.$backdrop = $('<div class="modal-backdrop ' + animate + '" />')
        .appendTo(this.$body)

      this.$element.on('click.dismiss.bs.modal', $.proxy(function (e) {
        if (this.ignoreBackdropClick) {
          this.ignoreBackdropClick = false
          return
        }
        if (e.target !== e.currentTarget) return
        this.options.backdrop == 'static'
          ? this.$element[0].focus()
          : this.hide()
      }, this))

      if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

      this.$backdrop.addClass('in')

      if (!callback) return

      doAnimate ?
        this.$backdrop
          .one('bsTransitionEnd', callback)
          .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
        callback()

    } else if (!this.isShown && this.$backdrop) {
      this.$backdrop.removeClass('in')

      var callbackRemove = function () {
        that.removeBackdrop()
        callback && callback()
      }
      $.support.transition && this.$element.hasClass('fade') ?
        this.$backdrop
          .one('bsTransitionEnd', callbackRemove)
          .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
        callbackRemove()

    } else if (callback) {
      callback()
    }
  }

  // these following methods are used to handle overflowing modals

  Modal.prototype.handleUpdate = function () {
    this.adjustDialog()
  }

  Modal.prototype.adjustDialog = function () {
    var modalIsOverflowing = this.$element[0].scrollHeight > document.documentElement.clientHeight

    this.$element.css({
      paddingLeft:  !this.bodyIsOverflowing && modalIsOverflowing ? this.scrollbarWidth : '',
      paddingRight: this.bodyIsOverflowing && !modalIsOverflowing ? this.scrollbarWidth : ''
    })
  }

  Modal.prototype.resetAdjustments = function () {
    this.$element.css({
      paddingLeft: '',
      paddingRight: ''
    })
  }

  Modal.prototype.checkScrollbar = function () {
    var fullWindowWidth = window.innerWidth
    if (!fullWindowWidth) { // workaround for missing window.innerWidth in IE8
      var documentElementRect = document.documentElement.getBoundingClientRect()
      fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left)
    }
    this.bodyIsOverflowing = document.body.clientWidth < fullWindowWidth
    this.scrollbarWidth = this.measureScrollbar()
  }

  Modal.prototype.setScrollbar = function () {
    var bodyPad = parseInt((this.$body.css('padding-right') || 0), 10)
    this.originalBodyPad = document.body.style.paddingRight || ''
    if (this.bodyIsOverflowing) this.$body.css('padding-right', bodyPad + this.scrollbarWidth)
  }

  Modal.prototype.resetScrollbar = function () {
    this.$body.css('padding-right', this.originalBodyPad)
  }

  Modal.prototype.measureScrollbar = function () { // thx walsh
    var scrollDiv = document.createElement('div')
    scrollDiv.className = 'modal-scrollbar-measure'
    this.$body.append(scrollDiv)
    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
    this.$body[0].removeChild(scrollDiv)
    return scrollbarWidth
  }


  // MODAL PLUGIN DEFINITION
  // =======================

  function Plugin(option, _relatedTarget) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.modal')
      var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
      if (typeof option == 'string') data[option](_relatedTarget)
      else if (options.show) data.show(_relatedTarget)
    })
  }

  var old = $.fn.modal

  $.fn.modal             = Plugin
  $.fn.modal.Constructor = Modal


  // MODAL NO CONFLICT
  // =================

  $.fn.modal.noConflict = function () {
    $.fn.modal = old
    return this
  }


  // MODAL DATA-API
  // ==============

  $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
    var $this   = $(this)
    var href    = $this.attr('href')
    var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) // strip for ie7
    var option  = $target.data('bs.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data())

    if ($this.is('a')) e.preventDefault()

    $target.one('show.bs.modal', function (showEvent) {
      if (showEvent.isDefaultPrevented()) return // only register focus restorer if modal will actually get shown
      $target.one('hidden.bs.modal', function () {
        $this.is(':visible') && $this.trigger('focus')
      })
    })
    Plugin.call($target, option, this)
  })

}(jQuery);
+function ($) {
  'use strict';

  // COLLAPSE PUBLIC CLASS DEFINITION
  // ================================

  var Menu = function (element, options) {
    this.element = element
    this.options = options
  }

  Menu.VERSION  = '0.0.1'

  Menu.TRANSITION_DURATION = 350

  Menu.DEFAULTS = {
    toggle: false 
  }


  Menu.prototype.show = function () {
    this.hide()
    var self = this
    this.fire("menu:activate", function() { 
        $(document).on("keydown.menu", self.show())
        $(document).on("click.menu", self.hide())
        this.performTransition(function() { 
            $('body').addClass("menu-active")
            self.addClass("active")
            self.find(".js-menu-content[aria-hidden]").attr("aria-hidden", "false")
        })
        this.fire("menu:activated", { async: true})
    })
  }

  Menu.prototype.hide = function () {
    this.fire("menu:deactivate", function() { 
        $(document).off(".menu")
        var self = this 
        this.performTransition(function() {
            $('body').removeClass("menu-active")
            self.removeClass("active")
            self.find(".js-menu-content[aria-hidden]").attr("aria-hidden", "true")
        })
        this.fire("menu:deactivated", { async: true }) 
    })
  }

  Menu.prototype.toggle = function () {
  }

  // Menu PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('lily.menu')
      var options = $.extend({}, Menu.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data && options.toggle && /show|hide/.test(option)) options.toggle = false
      if (!data) $this.data('lily.menu', (data = new Menu(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.menu

  $.fn.menu             = Plugin
  $.fn.menu.Constructor = Menu


  // Menu NO CONFLICT
  // ====================

  $.fn.menu.noConflict = function () {
    $.fn.menu = old
    return this
  }


  // Menu DATA-API
  // =================
  $(document).on("click", ".js-menu-container", function(e) {
    //var target = $(e.target).closest(".js-menu-target");
    e.preventDefault()
    //var menu = $(this).data('lily.menu')
    if($.lily.activeMenu === this) {
        $(this).menu('hide')
    } else {
        $(this).menu('show')
    }
  })

  $(document).on("click", ".js-menu-container .js-menu-close", function(e) {
    var target = $(e.target).closest(".js-menu-container");
    e.preventDefault()
    //var menu = $(this).data('lily.menu')
    if($.lily.activeMenu === this) {
        target.menu('hide')
    } else {
        target.menu('show')
    }
  })

}(jQuery);

!function(){

    "use strict";

    var Page = function(element, options) {
        this.$element = $(element);
        this.options = $.extend({}, $.fn.page.defaults, options);
        this.init();
    }

    Page.prototype = {
        constructor: Page,

        init: function() {
            var self = this;
            this.$element.unbind("scroll")
            this.$element.scroll(function() {
                if(!self.hasMore) {
                    return;
                }
                if(self.$element.scrollTop() == $(document).height() - self.$element.height()) {
                    self.nextPage()
                }
            });
        },

        resetUrl: function(url) {
            this.options.url = url;
            this.reset();
        },
        

        reset: function() {
            this.hasMore = true;
            this.page = 0;
            this.lastFlowNo = '';
            this.$appendTo = $(this.options.appendTo);
            this.$appendTo.empty();
            this.nextPage();
        },

        nextPage: function() {
            if(this.loading)
                return;
            $(".loading").show();
            this.loading = true;
            var self = this;
            function processResponse(responseData) {
                self.$appendTo.append($(responseData.content));
                self.page += 1;
                if(self.options.type === 'page') {
                    self.totalElement = responseData["page.total"];
                } else {
                    self.lastFlowNum = responseData.lastFlowNum;
                    if(self.lastFlowNum === '') {
                        self.hasMore = false;
                    }
                }
                if(self.options.summary && responseData.summary && responseData.summary.length > 0) {
                    $(self.options.summary).empty().append($(responseData.summary))
                }
                if(self.options.type === 'page' && self.totalElement === 0) { 
                    self.$appendTo.parent().addClass("no-data") 
                } else {
                    if(self.page * self.options.size > self.totalElement || !self.totalElement) {
                        self.hasMore = false;
                        self.$appendTo.append('<div class="no-more "><span>暂无更多数据</span></div>');
                    }
                }
                $(".loading").hide();
                self.loading = false;
				if(self.options.appendRequestData) {
                    if($.isArray(self.options.appendRequestData)) {
                        var temp = {}
                        for(var i = 0;i < self.options.appendRequestData.length; ++i) {
                            var name = self.options.appendRequestData[i]
                            temp[name] = responseData[name]
                        }
                        self.requestData = $.extend(self.requestData, temp)
                    } else {
                        var name1 = self.options.appendRequestData
                        var temp1 = {}
                        temp1[name1] = responseData[name1]
                        self.requestData = $.extend(self.requestData, temp1)
                    }
                }
            }
            var requestData ;
            if(self.options.type === 'page') {
                requestData = $.extend({"page.page": this.page , "page.size" : self.options.size}, this.requestData);
            } else {
                requestData = $.extend({"lastFlowNum": this.lastFlowNum}, this.requestData);
            }
            $.lily.ajax({url: this.options.url,
                data: requestData,
                dataType: 'json',
                type: this.options.method,
                processResponse: processResponse
            })
        }
    }

    $.fn.page = function ( option ) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('page'),
                options = typeof option == 'object' && option;
            if (data) {
                $this.data('page', null);
                data = null;
            }
            $this.data('page', (data = new Page(this, options)));
            data.reset();
        });
    }

    $.fn.page.defaults = {
        loadingText: 'loading...',
        type: 'page',
        method: 'POST',
        size: 10
    }

    $.fn.page.Constructor = Page

}(window.jQuery);


!function($) {

	"use strict";

	var Timeago = function(element, options) {
        this.$element = $(element)
		this.options = $.extend({}, $.fn.timeago.defaults, options)
        this.init()
    }

	Timeago.prototype = {
		constructor: Timeago,

		localization: { // Default regional settings
            suffixAgo: "之前",
            suffixFromNow: "从现在开始",
            seconds: "刚刚",
            minute: "一分钟前",
            minutes: "%d分钟前",
            hour: "一小时前",
            hours: "%d 小时前",
            day: "一天前",
            days: "%d天前",
            month: "一个月前",
            months: "%d月前",
            year: "一年前",
            years: "%d年前"
        },

        init: function() {
            var thisTime = this.$element.attr("data-time")
            if(!thisTime)
                return
            this.time = $.lily.format.parseDate(thisTime, "yyyy-mm-dd hh:mi:ss")
            this.update()
            function refresh() {
                $('time.timeago').timeago()
            }
            var refresh_el = $.proxy(refresh, this);

            if(!$.lily.timeagoRefresh) {
                $.lily.timeagoRefresh = true
                setInterval(refresh_el, this.options.refreshMillis);
            }
        },
        update: function() {
            var interval = new Date().getTime() - this.time
            var seconds = Math.abs(interval) / 1000
            var minutes = seconds / 60
            var hours = minutes / 60
            var days = hours / 24
            var years = days / 365

            function substitute(string, value) {
                return string.replace(/%d/i, value)
            }
            var $l = this.localization

            var words = seconds < 45 && substitute($l.seconds, Math.round(seconds)) ||
                seconds < 90 && substitute($l.minute, 1) ||
                minutes < 45 && substitute($l.minutes, Math.round(minutes)) ||
                minutes < 90 && substitute($l.hour, 1) ||
                hours < 24 && substitute($l.hours, Math.round(hours)) ||
                hours < 42 && substitute($l.day, 1) ||
                days < 30 && substitute($l.days, Math.round(days)) ||
                days < 45 && substitute($l.month, 1) ||
                days < 365 && substitute($l.months, Math.round(days / 30)) ||
                years < 1.5 && substitute($l.year, 1) ||
                substitute($l.years, Math.round(years))

            this.$element.text(words)
        }
        
    }

	$.fn.timeago = function(option) {
		return this
				.each(function() {
					var $this = $(this), data = $this.data('timeago'), options = typeof option == 'object' && option
					if (!data)
						$this.data('timeago', (data = new Timeago(this, options)))
                    else
                        data.update()
				})
	}


	$.fn.timeago.defaults = {
        refreshMillis: 60000
	}

	$.fn.timeago.Constructor = Timeago 

}(window.jQuery);

/**
 * jQuery file uploader - v1.0
 * auth: shenmq
 * E-mail: mqshen@126.com
 * website: shenmq.github.com
 *
 */

!function(){
    "use strict"

    var FileUploader = function(element, options) {
        this.$element = $(element)
        this.options = $.extend({}, $.fn.fileuploader.defaults, options)
        this.init()
    }


    FileUploader .prototype = {
        constructor: FileUploader,

        init: function() {
            var self = this
            this.$target = $('[type=file]', this.$element)
            this.$target.change(function(e) {
                self.fileupload(e)
            })
        },

        progress: function(e) {
            var pc = parseInt((e.loaded / e.total * 100), 10);
            this.$progress.css("width", pc + '%')
        },

        fileUploadCallback: function (data, $fileObj) {
			if(data.returnCode != '0' && data.returnCode != '000000') {
                $.lily.showTips(data.errorMsg);
                $fileObj.remove()
                return;
			}
            if(this.options.thumbnail) {
                $('[type=hidden]', $fileObj).val(data.content)
                this.$progress.css("width", '100%')
                $fileObj.removeClass("uploading")
            }
        },

        fileupload: function() {
            this.file = this.$target.get(0).files[0]
            this.isImage = this.file.type.indexOf("image") > -1
            var $fileObj;
            if(this.options.thumbnail) {
                var $attachmentsContainer = this.$element

                var fieldName = this.options.name;
                if(this.options.multiple) {
                    fieldName += '[' + $attachmentsContainer.children().length + ']'
                }
                var fileObj = '<li class="image uploading selected" data-toggle="select" name="attachment">'
                    + '<input type="hidden" name="' + fieldName + '" data-validate=\'{"name": "图片"}\'>'
                    + '<span class="js-remove" data-toggle="remove" ></span>'

                if(!this.isImage) {
                    fileObj += '<div class="icon"><img src="/static/images/filetype/file.png" class="file_icon" width="32" height="32"></div>'
                }

                $fileObj = $(fileObj)

                var $progressBar = $('<div class="progress"></div>')
                this.$progress = $('<div>')
                $progressBar.append(this.$progress)

                $fileObj.append($progressBar)

                this.$image = $('<img class="thumbnail">')
                if(this.isImage)
                    $fileObj.prepend(this.$image)
                $attachmentsContainer.prepend($fileObj)
            }
            else {
                this.$image = $('img' , this.$element)
            }

            this.uploadFile($fileObj)
        },

        uploadFile: function($fileObj) {
            var self = this
            var xhr = new XMLHttpRequest();
	    	if (xhr.upload ) {

                if(this.isImage) {
                    var imageReader = new FileReader();
                    imageReader.onload = (function() {
                        return function(e) {
                            self.$image.attr("src", e.target.result)
                        };
                    })(this.file);
                    imageReader.readAsDataURL(this.file);
                }

                var dataType = 'json'
                if(this.options.dataType)
                    dataType = this.options.dataType
	    		// progress bar
                if(this.options.thumbnail) {
	    		    xhr.upload.addEventListener("progress",
                        function(e){
                            self.progress(e)
                        },
                        false);
                }

	    		// file received/failed
	    		xhr.onreadystatechange = function() {
	    			if (xhr.readyState == 4) {
                        if(xhr.status == 200) {
                            var responseText = xhr.responseText
                            if(dataType === 'json')
                                responseText = $.parseJSON(responseText)
                            self.fileUploadCallback(responseText, $fileObj)
                        }
	    			}
	    		};

	    		// start upload
	    		xhr.open("POST", this.options.url, true);
                xhr.setRequestHeader("Content-type", this.file.type)
	    		xhr.setRequestHeader("X_FILENAME", encodeURIComponent(this.file.name));
	    		xhr.setRequestHeader("accept", "application/json")
	    		xhr.send(this.file);
	    	}
        }
    }

    $.fn.fileuploader = function (option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('fileuploader') ,
                options = typeof option == 'object' && option
            if (!data) $this.data('fileuploader', (data = new FileUploader(this, options)))
        })
    }

    $.fn.fileuploader.defaults = {
        thumbnail: true
    }

    $.fn.fileuploader.Constructor = FileUploader


    $(document).on('click.button.data-api', '[data-toggle^=remove]', function (e) {
        var $btn = $(e.target)
        if (!$btn.hasClass('js-remove')) $btn = $btn.closest('.js-remove')
        $btn.parent().remove()
    })
}( jQuery );


/* ========================================================================
 * Bootstrap: button.js v3.3.5
 * http://getbootstrap.com/javascript/#buttons
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // BUTTON PUBLIC CLASS DEFINITION
  // ==============================

  var Button = function (element, options) {
    this.$element  = $(element)
    this.options   = $.extend({}, Button.DEFAULTS, options)
    var $parent = this.$element.closest('[data-toggle="buttons"]')
    this.maxSelector = $parent.attr("data-max-selected")
    this.isLoading = false
  }

  Button.VERSION  = '3.3.5'

  Button.DEFAULTS = {
    loadingText: 'loading...'
  }

  Button.prototype.setState = function (state) {
    var d    = 'disabled'
    var $el  = this.$element
    var val  = $el.is('input') ? 'val' : 'html'
    var data = $el.data()

    state += 'Text'

    if (data.resetText == null) $el.data('resetText', $el[val]())

    // push to event loop to allow forms to submit
    setTimeout($.proxy(function () {
      $el[val](data[state] == null ? this.options[state] : data[state])

      if (state == 'loadingText') {
        this.isLoading = true
        $el.addClass(d).attr(d, d)
      } else if (this.isLoading) {
        this.isLoading = false
        $el.removeClass(d).removeAttr(d)
      }
    }, this), 0)
  }

  Button.prototype.toggle = function () {
      var changed = true
      var $parent = this.$element.closest('[data-toggle="buttons"]')

      if ($parent.length) {
        var $input = this.$element.find('input')
        if ($input.prop('type') == 'radio') {
          $parent.find('.active').removeClass('active')
          if ($input.prop('checked')) {
            $input.prop('checked', false)
          } else {
            this.$element.addClass('active')
          }
        } else if ($input.prop('type') == 'checkbox') {
          if(this.maxSelector && $parent.find('.active').length >= this.maxSelector && !this.$element.hasClass('active')) {
            return;
          }
          if (($input.prop('checked')) !== this.$element.hasClass('active')) changed = false
          this.$element.toggleClass('active')
        }
        $input.prop('checked', this.$element.hasClass('active'))
        if (changed) $input.trigger('change')
      } else {
        this.$element.attr('aria-pressed', !this.$element.hasClass('active'))
        this.$element.toggleClass('active')
      }
    }


  Button.prototype.active = function () {
    var changed = true
    var $parent = this.$element.closest('[data-toggle="buttons"]')

    if ($parent.length) {
      var $input = this.$element.find('input')
      if ($input.prop('type') == 'checkbox') {
        if (this.$element.hasClass('active')) {
          changed = false
        } else {
          this.$element.addClass('active')
        }
      }
      $input.prop('checked', this.$element.hasClass('active'))
      if (changed) $input.trigger('change')
    }
  }


  // BUTTON PLUGIN DEFINITION
  // ========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.button')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.button', (data = new Button(this, options)))

      if (option == 'toggle') data.toggle()
      else if (option == 'active') data.active()
      else if (option) data.setState(option)
    })
  }

  var old = $.fn.button

  $.fn.button             = Plugin
  $.fn.button.Constructor = Button


  // BUTTON NO CONFLICT
  // ==================

  $.fn.button.noConflict = function () {
    $.fn.button = old
    return this
  }


  // BUTTON DATA-API
  // ===============

  $(document)
    .on('click.bs.button.data-api', '[data-toggle="button"]', function (e) {
      var $btn = $(e.target)
      if (!$btn.hasClass('btn')) $btn = $btn.closest('.btn')
      Plugin.call($btn, 'toggle')
      if (!($(e.target).is('input[type="radio"]') || $(e.target).is('input[type="checkbox"]'))) e.preventDefault()
    })
    .on('focus.bs.button.data-api blur.bs.button.data-api', '[data-toggle^="button"]', function (e) {
      $(e.target).closest('.btn').toggleClass('focus', /^focus(in)?$/.test(e.type))
    })

}(jQuery);

/**
 * jQuery validator - v1.0
 * auth: shenmq
 * E-mail: shenmq@yuchengtech.com
 * website: shenmq.github.com
 *
 */

(function( $, undefined ){
    "use strict";

	$.lily.validator = $.lily.validator || {};

	$.extend( $.lily.validator, {
		/*
		 * 常量
		 */
		ACCOUNTNO_MIN : 15,			//账号最小长度
		ACCOUNTNO_MAX : 21, 		//账号最大长度
		CURRENCY_MAX : 18,			//金额最大长度
		CURRENCY_NO_DOT : false,	//后台存储的金额是否没有小数点


		failStop : false,			// 是否在第一次校验失败后就停止校验
		countByChar : true,
		tipContainer : null		//tipContainer
	});

	$.extend( $.lily.validator, {
		/*
		 * 多语言资源模板定义：其中{%name}表示被校验项的名称
		 */
		LANGUAGE_ACCOUNT : "{%name}为" + $.lily.validator.ACCOUNTNO_MIN + "位至" + $.lily.validator.ACCOUNTNO_MAX + "位的数字",
		LANGUAGE_SELECT : "请选择{%name}",
		LANGUAGE_REQUEST_INPUT : "请输入{%name}",
		LANGUAGE_DATA_ILLEGAL : "请输入合法的{%name}",
		LANGUAGE_SHORTER_THAN_MIN_LENGTH : "{%name}长度不能小于{%minLength}个字符",
		LANGUAGE_LONGER_THAN_MAX_LENGTH : "{%name}长度不能大于{%maxLength}个字符",
		LANGUAGE_LENGTH_NOT_EQUAL : "{%name}长度必须为{%length}",
		LANGUAGE_LESS_THAN_MIN_VALUE : "{%name}不能小于{%minValue}",
		LANGUAGE_GREATER_THAN_MAX_VALUE : "{%name}不能大于{%maxValue}",
		LANGUAGE_DATATYPE_NOT_INTEGER : "{%name}请输入数字",
		LANGUAGE_DATATYPE_NOT_DECIMAL : "{%name}请输入合法的浮点数",
		LANGUAGE_DATATYPE_NOT_CHINESE : "{%name}请输入中文",
		LANGUAGE_NOT_EQUAL : "两次输入的{%name}不相同",
		LANGUAGE_EQUAL : "两次输入的{%name}相同",
		LANGUAGE_GROUP_NOT_SAME : "需要全部输入或者全部留空",
		LANGUAGE_GROUP_NOT_ONE : "只需要输入其中一项",
		LANGUAGE_GROUP_NOT_SINGLE : "必须并且只需输入其中一项",
		LANGUAGE_GROUP_NO_INPUT : "需要至少输入其中一项",
		LANGUAGE_PHONE_ILLEGAL : "请输入合法的{%name}，格式为区号-电话号-分机号",
		LANGUAGE_CONFIRMPWD_NO_EQUALS : "确认密码必须和您的新密码相等",
		LANGUAGE_POSITIVENUMBER_ILLEGAL : "请输入合法的{%name}，格式为大于1的整数",
		LANGUAGE_STARTDATE_ILLEGAL : "{%name}不能晚于当前日期",
		LANGUAGE_ENDDATE_ILLEGAL : "日期范围不能超过3个月",
		LANGUAGE_LESS_THAN_START:"开始日期不能晚于结束日期"
	});

	$.extend( $.lily.validator, {
		/**
	     * 内置的数据类型定义
	     *       select  : 选择框
	     *       combox  : Liana.Combox组件
	     *       radio   : 单选按钮
	     *       checkbox : 选择框
	     *       file        : 文件选择
	     *       number  : 非负整数
	     *       decimal : 浮点数
	     *       currency    : 金额
	     *       chinese : 中文
	     *       email   : 电子邮件
	     *       date        : 日期
	     *       time        : HHMMSS 格式的时间
	     *       phone   : 固定电话（国内）
	     *       mobile  : 手机号（国内）
	     *       IDNumber: 身份证号码（国内）
	     * @private
	     * @type object 格式说明
	     *   currency:{
	     *       errorTemplet: // 错误信息模板
	     *       valueTester : ( function( value ){
	     *           // 测试函数，需返回true或false
	     *       }),
	     *       fieldTester : ( function( config ){
	     *           // 测试函数，需返回true或false
	     *       }),
	     *       afterPass : ( function( value, fieldConfig ){
	     *           // 测试返回true后的回调函数
	     *       }),
	     *       afterFail : ( function( value, fieldConfig ){
	     *           // 测试返回false后的回调函数
	     *       }),
	     *       output : ( function( fieldConfig ){
	     *           // 返回格式化后的数据
	     *       }),
	     *   },
	     */
	    _typeDefine:{
	        'accountNo':{
	            errorTemplet: $.lily.validator.LANGUAGE_ACCOUNT,
	            valueTester : ( function( value ) {
	                return ( $.lily.format.isInteger(value) &&  value.length >= $.lily.validator.ACCOUNTNO_MIN && value.length <= $.lily.validator.ACCOUNTNO_MAX);
	            }),
	            resetter: ( function( fieldConfig ) {
	            	if(fieldConfig.$element.data("accountSelect"))
	            		fieldConfig.$element.data("accountSelect").reset();
	            })
	        },
	        'chinese':{
	            errorTemplet: $.lily.validator.LANGUAGE_DATATYPE_NOT_CHINESE,
	            valueTester : ( function( value ){
	                return ( $.lily.format.isChinese(value) );
	            } )
	        },
	        'checkbox':{
	            output : ( function( fieldConfig ){
	                if(fieldConfig.$element.prop('checked'))
	                    return fieldConfig.$element.val();
	                return '';
	            } )
	        },
	        'combox':{
	            errorTemplet: $.lily.validator.LANGUAGE_SELECT,
	            fieldTester : ( function( fieldConfig ){
	                var combox = $('#' + fieldConfig.id).combox;
	                return ( combox.getValue() != null );
	            } ),
	            output : ( function( fieldConfig ){
	                var combox = $('#' + fieldConfig.id).combox;
	                return combox.getValue();
	            } )
	        },
	        'bonus':{
                errorTemplet:$.lily.validator.LANGUAGE_DATA_ILLEGAL,
                valueTester : ( function( value ){
                    var valueWithoutDot = $.lily.format.removeComma(value);
                    if ( valueWithoutDot.length > $.lily.validator.CURRENCY_MAX ){
                        return false;
                    }
                    return ( $.lily.format.isMoney( valueWithoutDot ) );
                } ),
                afterPass : ( function( value, fieldConfig, currentElement){
                	if ( fieldConfig.chineseDisplay ) {
                        $('#' + fieldConfig.chineseDisplay, currentElement).text(value);
                    }
                } ),
                afterFail : ( function( value, fieldConfig,currentElement ){
                    if ( fieldConfig.chineseDisplay ) {
                        $( fieldConfig.chineseDisplay, currentElement).val( "" );
                    }
                } ),
                output : ( function( fieldConfig ) {
                    var out = $.lily.format.removeComma( fieldConfig.$element.val() );
                    if ( $.lily.validator.CURRENCY_NO_DOT ){
                        out = $.lily.format.removeDot( out );
                    }
                    return out;
                } ),
                resetter: ( function( fieldConfig, currentElement) {
                	$('#' + fieldConfig.chineseDisplay, currentElement).text("");
                })
            },
            'giftBonus':{
                errorTemplet:$.lily.validator.LANGUAGE_DATA_ILLEGAL,
                valueTester : ( function( value ){
                    var valueWithoutDot = $.lily.format.removeComma(value);
                    if ( valueWithoutDot.length > $.lily.validator.CURRENCY_MAX ){
                        return false;
                    }
                    return ( $.lily.format.isMoney( valueWithoutDot ) );
                } ),
                afterPass : ( function( value, fieldConfig){
                    fieldConfig.$element.val('');
                    fieldConfig.$element.attr("placeholder", $.lily.format.toGiftBonus(value) );
                    fieldConfig.$element.attr("data-bonus", value);
                } ),
                afterFail : ( function( value, fieldConfig){
                    if ( fieldConfig.chineseDisplay ) {
                        $( fieldConfig.chineseDisplay).val( "" );
                    }
                } ),
                output : ( function( fieldConfig ) {
                    var value = fieldConfig.$element.val();
                    if(value) {
                        fieldConfig.$element.attr("data-edited", true);
                        return value;
                    }
                    return fieldConfig.$element.attr("data-bonus");
                } ),
                resetter: ( function( fieldConfig) {
                    fieldConfig.$element.attr("data-bonus", 0);
                    fieldConfig.$element.attr("placeholder", $.lily.format.toGiftBonus(0) );
                })
            },
	        'giftCurrency':{
	            errorTemplet:$.lily.validator.LANGUAGE_DATA_ILLEGAL,
	            valueTester : ( function( value ){
	                var valueWithoutDot = $.lily.format.removeComma(value);
	                if ( valueWithoutDot.length > $.lily.validator.CURRENCY_MAX ){
	                    return false;
	                }
	                return ( $.lily.format.isMoney( valueWithoutDot ) );
	            } ),
	            afterPass : ( function( value, fieldConfig, currentElement){
	            	if ( fieldConfig.chineseDisplay ) {
	            	    var chineseTarget = $('#' + fieldConfig.chineseDisplay, currentElement);
	            	    if(chineseTarget) {
	            	        var edited = chineseTarget.attr("data-edited")
	            	        if(!edited ) {
                                var integerCash = value;
	            	        	var dotIndex = value.indexOf('.');
	            	        	if(dotIndex > -1) {
                                	integerCash = value.substring( 0, dotIndex );
	            	        	}
	                            chineseTarget.attr("placeholder", $.lily.format.toGiftBonus(integerCash) );
	                            chineseTarget.attr("data-bonus", integerCash);
	            	        }
	            	    }
	                }
	            } ),
	            afterFail : ( function( value, fieldConfig,currentElement ){
	                if ( fieldConfig.chineseDisplay ) {
	                    $( fieldConfig.chineseDisplay, currentElement).val( "" );
	                }
	            } ),
	            output : ( function( fieldConfig ) {
	                var out = $.lily.format.removeComma( fieldConfig.$element.val() );
	                if ( $.lily.validator.CURRENCY_NO_DOT ){
	                    out = $.lily.format.removeDot( out );
	                }
	                return out;
	            } ),
	            resetter: ( function( fieldConfig, currentElement) {
	            	$('#' + fieldConfig.chineseDisplay, currentElement).text("");
	            })
	        },
            'currency':{
                errorTemplet:$.lily.validator.LANGUAGE_DATA_ILLEGAL,
                valueTester : ( function( value ){
                    var valueWithoutDot = $.lily.format.removeComma(value);
                    if ( valueWithoutDot.length > $.lily.validator.CURRENCY_MAX ){
                        return false;
                    }
                    return ( $.lily.format.isMoney( valueWithoutDot ) );
                } ),
                afterPass : ( function( value, fieldConfig, currentElement){
                    if ( fieldConfig.chineseDisplay ) {
                        $('#' + fieldConfig.chineseDisplay, currentElement).text( $.lily.format.toChineseCash(value) );
                    }
                    var formatCurrency = $.lily.format.toCashWithComma( value, true, 2 );
                    fieldConfig.$element.val(formatCurrency);
                } ),
                afterFail : ( function( value, fieldConfig,currentElement ){
                    if ( fieldConfig.chineseDisplay ) {
                        $( fieldConfig.chineseDisplay, currentElement).val( "" );
                    }
                } ),
                output : ( function( fieldConfig ) {
                    var out = $.lily.format.removeComma( fieldConfig.$element.val() );
                    if ( $.lily.validator.CURRENCY_NO_DOT ){
                        out = $.lily.format.removeDot( out );
                    }
                    return out;
                } ),
                resetter: ( function( fieldConfig, currentElement) {
                    $('#' + fieldConfig.chineseDisplay, currentElement).text("");
                })
            },
	        'date':{
	            valueTester : ( function(){
	                // 数据格式的校验由Liana.Calendar完成，此处不校验
	                return true;
	            } ),
	            output : ( function( fieldConfig ) {
	            	var fieldValue = fieldConfig.$element.val();
	                return fieldValue + " 00:00:00";
	            })
	        },
	        'decimal':{
	            errorTemplet:$.lily.validator.LANGUAGE_DATATYPE_NOT_DECIMAL,
	            valueTester : ( function( value ){
	                return ( $.lily.format.isDecimal(value) );
	            } )
	        },
	        'email':{
	            errorTemplet:$.lily.validator.LANGUAGE_DATA_ILLEGAL,
	            valueTester : ( function( value ){
	                return ( $.lily.format.isEmail(value) );
	            } )
	        },
	        'file':{
	            valueTester : ( function(){
	                // 文件类型校验使用自定义的正则表达式，此处不校验
	                return true;
	            } )
	        },
	        'IDNumber':{
	            errorTemplet:$.lily.validator.LANGUAGE_DATA_ILLEGAL,
	            valueTester : ( function( value ){
	                return ( $.lily.format.isIDNumber(value) );
	            } )
	        },
	        'number':{
	            errorTemplet:$.lily.validator.LANGUAGE_DATATYPE_NOT_INTEGER,
	            valueTester : ( function( value ){
	                return ( $.lily.format.isInteger(value) );
	            } )
	        },
	        'positiveNumber':{
	            errorTemplet:$.lily.validator.LANGUAGE_POSITIVENUMBER_ILLEGAL,
	            valueTester : ( function( value ){
	                return ( $.lily.format.isPositiveNumber(value) );
	            } )
	        },
	        'oddNumber':{
	            errorTemplet:$.lily.validator.LANGUAGE_DATA_ILLEGAL,
	            valueTester : ( function( value ){
	            	if($.lily.format.isEmpty(value)){
	            		return true;
	            	}
	                return ( $.lily.format.isOddNumber(value) );
	            } )
	        },
	        'radio':{
	            output : ( function( fieldConfig ){
	                var radioList = $("input:checked", fieldConfig.$element);
	                if ( radioList.length === 0 ){
	                    return null;
	                }
	                return radioList[0].value;
	            } )
	        },
	        'select':{
	            errorTemplet:$.lily.validator.LANGUAGE_SELECT,
	            valueTester : ( function( value ){
	                return ( !$.lily.format.isEmpty(value) );
	            } )
	        },
	        'time':{
	            errorTemplet:$.lily.validator.LANGUAGE_DATA_ILLEGAL,
	            valueTester : ( function( value ){
	                return ( $.lily.format.isTime(value) );
	            } )
	        },
	        'phone':{
	            errorTemplet:$.lily.validator.LANGUAGE_PHONE_ILLEGAL,
	            valueTester : ( function( value ){
	                return ( $.lily.format.isPhone(value) );
	            } )
	        },
	        'fax':{
	            errorTemplet:$.lily.validator.LANGUAGE_DATA_ILLEGAL,
	            valueTester : ( function( value ){
	                return ( $.lily.format.isFax(value) );
	            } )
	        },
	        'mobile':{
	            errorTemplet:$.lily.validator.LANGUAGE_DATA_ILLEGAL,
	            valueTester : ( function( value ){
	                if ($.lily.format.isEmpty(value)){
	                    return false;
	                }
	                return ( $.lily.format.isMobile(value) );
	            } )
	        },
	        'newPWD':{
	        	errorTemplet:$.lily.validator.LANGUAGE_DATATYPE_NOT_INTEGER,
	            valueTester : ( function( value ){
	            	//新密码必须是数字
	                return ( $.lily.format.isInteger(value) );
	            } )
	        },
	        'confirmPWD':{
	        	errorTemplet:$.lily.validator.LANGUAGE_CONFIRMPWD_NO_EQUALS,
	        	fieldTester: function(fieldConfig) {
	        		//判断起止日期不能超过3个月
	        		if (fieldConfig.newPwd) {
	        			var newPwd = $("#"+fieldConfig.newPwd, fieldConfig.currentElement).val();
	        			var confirmPwd = $("#"+fieldConfig.id, fieldConfig.currentElement).val();
	        			if (!$.lily.format.isInteger(confirmPwd))
	        				return false;
	        			else if(newPwd!=confirmPwd)
	        				return false;
	        			else
	        				return true;
	        		}
	        	}
	        },
	        'startDate':{
	        	errorTemplet:$.lily.validator.LANGUAGE_STARTDATE_ILLEGAL,
	        	valueTester: function(value) {
	        		//开始日期必须在一年以内
	        		return !$.perbank.isEmptyStr(value) && $.perbank.isInOneYear(value);
	        	}
	        },
	        'endDate':{
	        	errorTemplet:$.lily.validator.LANGUAGE_ENDDATE_ILLEGAL,
	        	fieldTester: function(fieldConfig) {
	        		//判断起止日期不能超过3个月
	        		if (fieldConfig.startDate) {
	        			var startDate = $("#"+fieldConfig.startDate, fieldConfig.currentElement).val();
	        			var endDate = $("#"+fieldConfig.id, fieldConfig.currentElement).val();
	        			if ($.perbank.isEmptyStr(startDate) || $.perbank.isEmptyStr(endDate))
	        				return false;
	        			else
	        				return $.perbank.isInThreeMonth(startDate, endDate);
	        		} else
	        			alert("要进行日期范围的校验，必须在结束日期配置中指定开始日期");
	        	}
	        },
	        'content' : {
	            output : ( function( fieldConfig ){
	                return fieldConfig.$element.val()
	            })
	        }
	    },

		_dataAccesser : function(fieldConfig) {

			if (fieldConfig.isExtra) {
				return null;
			}
			if(fieldConfig.type) {
				var typeDefine = $.lily.validator._typeDefine[fieldConfig.type];
				if ( typeDefine && typeDefine.output) {
					return typeDefine.output(fieldConfig);
				}
			}

			if (fieldConfig.$element == null) {
				alert( "Validator: Field["+fieldConfig.id+"] not found in html!" );
				return null;
			}
			var fieldValue = fieldConfig.$element.val();
			if(fieldConfig.formatType == "account") {
				fieldValue = fieldValue.substring(0,fieldValue.indexOf("["));
			}
			return fieldValue;
		},

		_errorHandler : function(errors) {
            errors;
		},

		_requiredValidator : function(fieldValue, fieldConfig) {

			//radio一定检查是否选中
			if (fieldConfig.type == 'radio' )  {
				var radioList = $("input:checked", fieldConfig.$element);
				if ( radioList.length === 0 ){
					this._errorCount++;
					return $.lily.validator._getErrorMessage( fieldConfig, $.lily.validator.LANGUAGE_SELECT, true );
				}
				return true;
			} else if(fieldConfig.type == 'checkbox') {
			    var checkboxList = $("input:checked", fieldConfig.$element.closest('div'));
                if ( checkboxList.length === 0 ){
                    this._errorCount++;
                    return $.lily.validator._getErrorMessage( fieldConfig, $.lily.validator.LANGUAGE_SELECT, true );
                }
                return true;
			}
			// 必输项校验
			if (fieldValue.blank() || fieldValue==fieldConfig.defaultValue) {
				if (this._ignoreBlank) {
					return false;
				}
				if (fieldConfig.require) {
					this._errorCount++;
					return $.lily.validator._getErrorMessage( fieldConfig, $.lily.validator.LANGUAGE_REQUEST_INPUT );
				}
				else {
					return false;	//如果没有输入内容，则不再进行后续检验
				}
			}
			return true;
		},

		_lengthValidator : function(fieldValue, fieldConfig) {

			if ( fieldConfig.minLength!=null || fieldConfig.maxLength!=null || fieldConfig.length!=null){
				var inputLength = 0;
				if ( $.lily.validator.countByChar ){
					// 按字符计算长度
					inputLength = fieldValue.length;
				}
				else {
					// 按字节计算长度（编码为UTF-8时）
					for (var index = 0, len = fieldValue.length; index < len; index++) {
						var charCode = fieldValue.charCodeAt(index);
						if (charCode < 0x007f) {
							inputLength ++;
						}
						else if ((0x0080 <= charCode) && (charCode <= 0x07ff)) {
							inputLength += 2;
						}
						else if ((0x0800 <= charCode) && (charCode <= 0xffff)) {
							inputLength += 3;
						}
				    }
				}
				if ( fieldConfig.length!=null && inputLength != fieldConfig.length ) {
					return $.lily.validator._getErrorMessage( fieldConfig, $.lily.validator.LANGUAGE_LENGTH_NOT_EQUAL );
				}
				if ( fieldConfig.minLength!=null && inputLength < fieldConfig.minLength ) {
					return $.lily.validator._getErrorMessage( fieldConfig, $.lily.validator.LANGUAGE_SHORTER_THAN_MIN_LENGTH );
				}
				if ( fieldConfig.maxLength!=null && inputLength > fieldConfig.maxLength ) {
					return $.lily.validator._getErrorMessage( fieldConfig, $.lily.validator.LANGUAGE_LONGER_THAN_MAX_LENGTH );
				}
			}
			return true;
		},

		_valueRangeValidator : function(fieldValue, fieldConfig) {
			if (fieldConfig.startDate!=null ){
				// 字符串去掉,并转换为浮点数
				var endDateValue = Date.parse(fieldValue.replace("-","/"));
				var startDateValue = Date.parse($("#"+fieldConfig.startDate, fieldConfig.currentElement).val().replace("-","/"));
				if (endDateValue < startDateValue ){
					return $.lily.validator._getErrorMessage( fieldConfig, $.lily.validator.LANGUAGE_LESS_THAN_START );
				}
			}
			if ( fieldConfig.minValue!=null || fieldConfig.maxValue!=null ){
				// 字符串去掉,并转换为浮点数
				var checkValue = parseFloat( fieldValue.replace( new RegExp('\,',["g"]),'') );
				if ( fieldConfig.minValue!=null && checkValue < fieldConfig.minValue ){
					return $.lily.validator._getErrorMessage( fieldConfig, $.lily.validator.LANGUAGE_LESS_THAN_MIN_VALUE );
				}
				if ( fieldConfig.maxValue!=null && checkValue > fieldConfig.maxValue ){
					return $.lily.validator._getErrorMessage( fieldConfig, $.lily.validator.LANGUAGE_GREATER_THAN_MAX_VALUE );
				}
			}
			return true;
		},

		_dataTypeValidator : function(fieldValue, fieldConfig, currentElement) {
			var result = true;
			if ( fieldConfig.type!=null ) {
				var typeDefine = $.lily.validator._typeDefine[fieldConfig.type];
				if ( typeDefine ){
					if ( typeDefine.valueTester ){
						result = typeDefine.valueTester(fieldValue);
					}
					else if ( typeDefine.fieldTester ){
						result = typeDefine.fieldTester(fieldConfig);
					}
					if ( result && typeDefine.afterPass ) {
						typeDefine.afterPass(fieldValue, fieldConfig, currentElement);
					}
					if ( !result ){
						if ( typeDefine.afterFail ) {
							typeDefine.afterFail(fieldValue, fieldConfig, currentElement);
						}
						return $.lily.validator._getErrorMessage( fieldConfig, typeDefine.errorTemplet );
					}
				}
				else {
					alert( "$.lily.Validator: Datatype["+fieldConfig.type+"] not supported!" );
				}
			}
			return true;
		},

		_regexpValidator : function(fieldValue, fieldConfig) {

			if ( fieldConfig.regexp!=null ){
				var result = ( new RegExp( fieldConfig.regexp ) ).test(fieldValue);
				if ( !result ) {
					return $.lily.validator._getErrorMessage( fieldConfig, $.lily.validator.LANGUAGE_DATA_ILLEGAL );
				}
			}
			return true;
		},

		_equalToValidator : function(fieldValue, fieldConfig ) {
			// 检查是否和指定域的值相等或不等
			if ( fieldConfig.equalTo || fieldConfig.notEqualTo ){
				var targetId = ( fieldConfig.equalTo ) ? fieldConfig.equalTo : fieldConfig.notEqualTo;

				var targetValue = $(targetId).val();
				if ( fieldConfig.equalTo && fieldValue != targetValue  ){
					return $.lily.validator._getErrorMessage( fieldConfig, $.lily.validator.LANGUAGE_NOT_EQUAL );
				}
				if ( fieldConfig.notEqualTo && fieldValue == targetValue  ){
					return $.lily.validator._getErrorMessage( fieldConfig, $.lily.validator.LANGUAGE_EQUAL );
				}
			}
			return true;
		},

        /*
		_checkerValidator : function(fieldValue, fieldConfig) {
			// 自定义的校验函数
			if ( fieldConfig.checker != null ){
				var chekerResult = eval(fieldConfig.checker + "(fieldConfig, fieldValue, currentElement)");
				if ( chekerResult !== true ){
					var errorTemplet = ( chekerResult === false ) ? $.lily.validator.LANGUAGE_DATA_ILLEGAL : chekerResult;
					return $.lily.validator._getErrorMessage( fieldConfig, errorTemplet );
				}
			}
			return true;
		},
        */

		_relatedValidator : function(fieldValue, fieldConfig) {

			if ($.isArray(fieldConfig.related) && this._relatedCheckDepth < 5) {
				this._relatedCheckDepth ++;
				try {
					this.checkFields(fieldConfig.related);
				}
				catch (e) {
					return false;
				}
				this._relatedCheckDepth --;
			}
			return true;
		},

		_commonReset: function(fieldConfig, currentElement) {
			if ( fieldConfig.type!=null ) {
				var typeDefine = $.lily.validator._typeDefine[fieldConfig.type];
				if ( typeDefine ){
					if ( typeDefine.resetter ) {
						typeDefine.resetter(fieldConfig, currentElement);
					}
				}
			}
		},

		/**
		* 根据模板生成要显示的错误信息
		* @private
		* @param {object} config 校验配置
		* @param {string} templet 信息模板
		* @returns {string} 生成的错误信息
		*/
		_getErrorMessage : function( config, templet, ignoreCustom ){

			// 使用自定义的提示信息模板
			if (!ignoreCustom && config.templet != null) {
				templet = config.templet;
			}

			if ( window.Ln ){
				templet = window.Ln.g( templet, config );
			}
			var result = templet;
			var dataBeginPos = 0;
			while ( true ){
				// 模板中使用%作为变量前缀
				dataBeginPos = result.indexOf( "{%", dataBeginPos );
				if ( dataBeginPos < 0 ){
					break;
				}
				var dataEndPos = result.indexOf( "}", dataBeginPos );
				var dataName = result.substring( dataBeginPos+2, dataEndPos );
				result = result.substring( 0, dataBeginPos ) + config[dataName] + result.substring( dataEndPos+1 );
			}
			return result;
		}
	});

	"use strict"

	var Validator = function (element, options) {
		this.$element = $(element);
		this.options = options;
		this._rules = [];
		var self = this;
		$('input,textarea,[data-validate]' , this.$element).each(function () {
			var $this = $(this);
			var dataValidate = $this.attr('data-validate');
			if(dataValidate) {
				var config = $.parseJSON(dataValidate);
                if(!config.name) {
                    config.name = $this.attr("placeholder");
                }
				config.$element = $this;
				self.addRule(config);
				if(!config.type || config.type !== 'accountNo') {
				    var checkFun = function() {
                        var result = self.checkRule(config);
                        if ( !result.passed ) {
                            if(self.options.showErrorInWindow & 1)
                                self.addErrors(result);
                            if(self.options.showErrorInWindow & 2)
                                self.showError($this, result.error)
                        }
                        else {
                            self.hideError($this)
                        }
                    }
					$this.blur(checkFun);
					if("bonus" === config.type || "giftCurrency" === config.type) {
					    $this.bind("change paste keyup", checkFun);
					}
				}
			}
		});
	}

	Validator.prototype = {
		constructor: Validator,

		addRule: function(config) {
			config.id = config.$element.attr("name")
			if ( !config.id ){
				alert( "Validator: Field id must be set!" );
				return;
			}

			config.key = config.id;

			this._rules.push(config);
		},

		check: function() {
			var errors = [];
			var requestData = {};
			var signData = [];
			for(var i = 0,size = this._rules.length;i < size; ++i) {
				var rule = this._rules[i];
				if(rule.$element.hasClass("disabled"))
					continue;
				var result = this.checkRule(rule);
				if ( result.passed ) {
                    if(result.data !== undefined && result.data !== null) {
					    requestData[rule.id] = result.data;
				    }
					this.hideError(rule.$element)
				}
				else {
					errors.push(result);
					if(this.options.showErrorInWindow & 1) {
						this.showError(rule.$element, result.error)
					}
          if(this.options.showErrorInWindow & 2){
						this.addErrorTag(rule.$element, result.error);
					}

				}
			}
			if (errors.length > 0 && this.options.showErrorInWindow & 1) {
				this.addErrors(errors);
			}

			return {
				passed: errors.length === 0,
				requestData: requestData,
				signData: signData
			};
		},

		hideError: function(element) {
            element.attr("placeholder", element.attr("old-placeholder"));
			element.removeClass("op-error shake");
		},

		showError: function(element, message) {
			this.hideError(element)

            if(!element.attr("old-placeholder"))
                element.attr("old-placeholder", element.attr("placeholder"))
            element.addClass('op-error shake').attr('placeholder', message);
			//element.after('<span class="error">' + message + '</span>')
		},
		addErrorTag: function(element, message) {
			this.hideError(element)
			element.addClass('op-error ').attr('placeholder', message);
		},

		addErrors: function(errors) {
			var errorMessage = '';
			if($.isArray(errors)) {
				for(var i = 0, length = errors.length && i < 3; i < length; ++i) {
					errorMessage += errors[i].error + '\n';
				}
				if(errors.length > 3) {
					errorMessage += '...';
				}
			}
			else {
				errorMessage += errors.error ;
			}
            $.lily.showTips(errorMessage);
			/*
			var htmlStr = "<ul>";

			if($.isArray(errors)) {
				for(var i = 0, length = errors.length; i < length; ++i) {
					htmlStr += '<li>' + errors[i].error + '</li>';
				}
			}
			else {
				htmlStr += '<li>' + errors.error + '</li>';
			}
			htmlStr += "</ul>";
			var errorHtmlObj = $(htmlStr);
			$.openWindow({
				backdrop: false,
				content: errorHtmlObj,
				allowMinimize: false,
				windowClass: 'error-show',
				showFun: null,
				closeFun: null,
				appendTo: 'body',
				autoClose: 2000
			});
			*/
		},

		checkRule: function(rule) {

			var key = rule.key;
			var dataAccesser = $.isFunction(rule.dataAccesser) ? rule.dataAccesser : this.options.dataAccesser;
			var validators = rule.validator;
			var ignoreCommonValidators = rule.ignoreCommonValidators;
			var enabled = rule.enabled;

			if (enabled === false) {
				return;
			}

			if (!$.isFunction(dataAccesser))
				return;

			var data = dataAccesser(rule);

			var commonValidators = this.options.commonValidators;
            var result;
			if (commonValidators && !ignoreCommonValidators) {
				var commonSize = commonValidators.length;
				for (var i=0; i<commonSize; i++) {
					var commonValidator = commonValidators[i];

					if ($.isFunction(commonValidator)) {
					    result = commonValidator.call(this, data, rule, this.$element);
						if (result === undefined || result == null || result === false) {
							return {
								passed: true,
								key : key,
								error : result,
								data : data,
								rule : rule
							};
						}
						if (result !== true) {
							return {
								passed: false,
								key : key,
								error : result,
								data : data,
								rule : rule
							};
						}
					}
				}
			}

			if (!$.isArray(validators)) {
				validators = [validators];
			}
			var size = validators.length
			for (var j=0; j<size; j++) {
				var validator = validators[j];

				if ($.isFunction(validator)) {
					result = validator(data, rule);
					if (result === undefined || result == null || result === false) {
						return {
							passed: true,
							key : key,
							error : result,
							data : data,
							rule : rule
						};
					}
					if (result !== true) {
						return {
							passed: false,
							key : key,
							error : result ,
							data : data,
							rule : rule
						};
					}
				}
			}
			return {
				passed: true,
				key : key,
				error : result,
				data : data,
				rule : rule
			};
		},

		reset: function() {
			for(var i = 0,size = this._rules.length;i < size; ++i) {
				var rule = this._rules[i];
				$.lily.validator._commonReset(rule, this.$element);
			}
		}
	}

	$.fn.validator = function ( option ) {
		return this.each(function () {
      		var $this = $(this),
      			data = $this.data('validator'),
      			options = $.extend({}, $.fn.validator.defaults, $this.data(), typeof option == 'object' && option);
      		if (!data)
      			$this.data('validator', (data = new Validator(this, options)));
    	});
	}

	$.fn.validator.defaults = {
		showErrorInWindow: 3,
		dataAccesser : $.lily.validator._dataAccesser ,
		errorHandler : $.lily.validator._errorHandler ,
		commonValidators : [
		    $.lily.validator._requiredValidator ,
		    $.lily.validator._lengthValidator ,
		    $.lily.validator._valueRangeValidator ,
		    $.lily.validator._dataTypeValidator ,
		    $.lily.validator._regexpValidator ,
		    $.lily.validator._equalToValidator ,
		    $.lily.validator._relatedValidator
		]
	}

	$.fn.validator.Constructor = Validator;

})( window.jQuery );

!function(){
    "use strict"

    var Editor = function(element, options) {
        this.$element = $(element)
        this.options = $.extend({}, $.fn.editor.defaults, options)
        this.init()
    }

    Editor.prototype = {
        constructor: Editor,

        init: function() {
            this.$box = $('<div class="editor_box"></div>')

            this.window = window;
            this.document = document;
            this.$editor = $('<div class="wysihtml5-sandbox" contenteditable="true" frameborder="0"></div>')
            this.$summaryContainer = $('<input type="hidden" data-validate=\'{"name": "摘要"}\' name="summary" />')
            if (this.options.css) {
                this.$editor.contents().find('head').append('<link rel="stylesheet" href="' + this.options.css + '" />');
            }
            this.$editor.css({
                'color': 'rgb(0, 0, 0)',
                'cursor': 'auto',
                'font-size': '15px',
                'font-style': 'normal',
                'font-variant': 'normal',
                'font-weight': 'normal',
                'line-height': '25px',
                'letter-spacing': 'normal',
                'text-align': 'start',
                'text-decoration': 'none',
                'text-indent': '0px',
                'text-rendering': 'auto',
                'word-break': 'normal',
                'word-wrap': 'break-word',
                'word-spacing': '0px'
            })

            this.$editor.addClass("wysiwyg_editor");
            this.$element.hide();
            // get html
            var html = '';
            html = this.$element.val();
            html = this.savePreCode(html);

            var editorContainer = $('<div>')

            this.$box.insertAfter(this.$element)
            this.$box.append(editorContainer)
            editorContainer.append(this.$editor)
            editorContainer.append(this.$element);
            editorContainer.append(this.$summaryContainer);
            editorContainer.addClass('wysihtml_container')
            html = this.paragraphy(html);
            this.$editor.html(html);

            this.keyup()
            this.keydown()
            this.paste()
            this.buildToolbar();
            // buttons response
            if (this.options.activeButtons !== false && this.options.toolbar !== false) {
                var observeFormatting = $.proxy(function() { this.observeFormatting(); }, this);
                this.$editor.click(observeFormatting).keyup(observeFormatting);
            }
            if (this.options.fixed) {
                this.observeScroll();
                $(document).scroll($.proxy(this.observeScroll, this));
            }
        },

        buildFileContainer: function() {
        },

        buildToolbar: function() {
            if (this.options.toolbar === false) {
                return false;
            }

            this.$toolbar = $('<div>').addClass('editor_toolbar');

            this.$box.prepend(this.$toolbar);

            $.each(this.options.buttons, $.proxy(function(i,key) {

                if (key === '|' ) {
                    this.$toolbar.append($('<div class="toolbar-separator" aria-disabled="true" role="separator" style="-webkit-user-select: none;">&nbsp;</div>'))
                }
                else if(typeof this.options.toolbar[key] !== 'undefined') {
                    var s = this.options.toolbar[key];

                    if (this.options.fileUpload === false && key === 'file') {
                        return true;
                    }
                    this.$toolbar.append(this.buildButton(key, s));
                }
            }, this));

        },
        buildButton: function(key, s) {

            //var button = $('<div class="toolbar-button" title="' + s.title + '" role="button" aria-pressed="false" id="+code" style="-webkit-user-select: none;">'
            //    + '<div class="toolbar-button-outer-box" style="-webkit-user-select: none;">'
            //    + '<div class="toolbar-button-inner-box" style="-webkit-user-select: none;"><div class="tr-icon tr-'
            //    + key + '" style="-webkit-user-select: none;"></div></div></div></div>');
            //var button = $('<a href="javascript:void(null);" title="' + s.title + '" class="editor_btn_' + key + '">' + s.title + '</a>');
            var button = $('<a href="javascript:void(null);" class="toolbar-button tr-icon tr-'
                            + key + '" title="' + s.title + '" role="button" aria-pressed="false" id="+code" style="-webkit-user-select: none;">'
                            + '</a>')

            if (typeof s.func === 'undefined') {
                button.click($.proxy(function() {
                    if ($.inArray(key, this.options.activeButtons) != -1) {
                        this.inactiveAllButtons();
                        this.setBtnActive(key);
                    }

                    if ($.lily.browser('mozilla')) {
                        this.$editor.focus();
                        //this.restoreSelection();
                    }

                    this.execCommand(s.exec, key);

                }, this));
            }
            else if (s.func !== 'show') {
                button.click($.proxy(function(e) {

                    this[s.func](e);

                }, this));
            }

            if (typeof s.callback !== 'undefined' && s.callback !== false) {
                button.click($.proxy(function(e) { s.callback(this, e, key); }, this));
            }

            return button;
        },

        paste: function() {
            this.$editor.bind('paste', $.proxy(function() {
                if (this.options.cleanup === false) {
                    return true;
                }

                this.pasteRunning = true;

                this.setBuffer();

                if (this.options.autoresize === true) {
                    this.saveScroll = this.document.body.scrollTop;
                }
                else {
                    this.saveScroll = this.$editor.scrollTop();
                }

                var frag = this.extractContent();

                setTimeout($.proxy(function() {
                    var pastedFrag = this.extractContent();
                    this.$editor.append(frag);

                    this.restoreSelection();

                    var html = this.getFragmentHtml(pastedFrag);
                    this.pasteCleanUp(html);
                    this.pasteRunning = false;

                }, this), 1);
            }, this));
        },
        keydown: function() {
            this.$editor.keydown($.proxy(function(e) {
                var key = e.keyCode || e.which;
                var parent = this.getParentNode();
                var current = this.getCurrentNode();
                var pre = false;
                var ctrl = e.ctrlKey || e.metaKey;

                if ((parent || current) && ($(parent).get(0).tagName === 'PRE' || $(current).get(0).tagName === 'PRE')) {
                    pre = true;
                }

                // callback keydown
                if (typeof this.options.keydownCallback === 'function') {
                    this.options.keydownCallback(this, e);
                }

                if (ctrl && this.options.shortcuts) {
                    if (key === 90) {
                        if (this.options.buffer !== false) {
                            e.preventDefault();
                            this.getBuffer();
                        }
                        else if (e.shiftKey) {
                            this.shortcuts(e, 'redo');  // Ctrl + Shift + z
                        }
                        else {
                            this.shortcuts(e, 'undo'); // Ctrl + z
                        }
                    }
                    else if (key === 77) {
                        this.shortcuts(e, 'removeFormat'); // Ctrl + m
                    }
                    else if (key === 66) {
                        this.shortcuts(e, 'bold'); // Ctrl + b
                    }
                    else if (key === 73) {
                        this.shortcuts(e, 'italic'); // Ctrl + i
                    }
                    else if (key === 74) {
                        this.shortcuts(e, 'insertunorderedlist'); // Ctrl + j
                    }
                    else if (key === 75) {
                        this.shortcuts(e, 'insertorderedlist'); // Ctrl + k
                    }
                    else if (key === 76) {
                        this.shortcuts(e, 'superscript'); // Ctrl + l
                    }
                    else if (key === 72) {
                        this.shortcuts(e, 'subscript'); // Ctrl + h
                    }
                }

                // clear undo buffer
                if (!ctrl && key !== 90) {
                    this.options.buffer = false;
                }

                // enter
                if (pre === true && key === 13) {
                    e.preventDefault();

                    var html = $(current).parent().text();
                    this.insertNodeAtCaret(this.document.createTextNode('\r\n'));
                    if (html.search(/\s$/) == -1) {
                        this.insertNodeAtCaret(this.document.createTextNode('\r\n'));
                    }
                    this.syncCode();
                    return false;
                }

                // tab
                if (this.options.shortcuts && !e.shiftKey && key === 9) {
                    if (pre === false) {
                        this.shortcuts(e, 'indent'); // Tab
                    }
                    else {
                        e.preventDefault();
                        this.insertNodeAtCaret(this.document.createTextNode('\t'));
                        this.syncCode();
                        return false;
                    }
                }
                else if (this.options.shortcuts && e.shiftKey && key === 9 ) {
                    this.shortcuts(e, 'outdent'); // Shift + tab
                }

                // safari shift key + enter
                if ($.lily.browser('webkit') && navigator.userAgent.indexOf('Chrome') === -1) {
                    return this.safariShiftKeyEnter(e, key);
                }
            }, this));
        },
        // SAFARI SHIFT KEY + ENTER
        safariShiftKeyEnter: function(e, key) {
            if (e.shiftKey && key === 13) {
                e.preventDefault();
                this.insertNodeAtCaret($('<span><br /></span>').get(0));
                this.syncCode();
                return false;
            }
            else {
                return true;
            }
        },
        // FORMAT EMPTY
        formatEmpty: function(e) {
            var html = $.trim(this.$editor.html());
            if ($.lily.browser('mozilla')) {
                html = html.replace(/<br>/i, '');
            }

            var thtml = html.replace(/<(?:.|\n)*?>/gm, '');

            if (html === '' || thtml === '') {
                e.preventDefault();
                var node = $(this.options.emptyHtml).get(0);
                this.$editor.html(node);
                this.setSelection(node, 0, node, 0);
                this.syncCode();
                return false;
            }
            else {
                this.syncCode();
            }
        },

        keyup: function() {
            this.$editor.keyup($.proxy(function(e) {
                var key = e.keyCode || e.which;

                if ($.lily.browser('mozilla') && !this.pasteRunning) {
                    this.saveSelection();
                }

                // callback as you type
                if (typeof this.options.keyupCallback === 'function') {
                    this.options.keyupCallback(this, e);
                }

                // if empty
                if (key === 8 || key === 46) {
                    return this.formatEmpty(e);
                }

                // new line p
                if (key === 13 && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
                    if ($.lily.browser('webkit')) {
                        this.formatNewLine(e);
                    }

                    // convert links
                    if (this.options.convertLinks) {
                        this.$editor.linkify();
                    }
                }
                this.syncCode();
            }, this));
        },
        observeScroll: function() {
            var scrolltop = $(document).scrollTop();
            var boxtop = this.$box.offset().top;
            var left = 0;

            if (scrolltop > boxtop) {
                var width = '100%';
                if (this.options.fixedBox) {
                    left = this.$box.offset().left;
                    width = this.$box.innerWidth();
                }

                this.fixed = true;
                this.$toolbar.css({ position: 'fixed', width: width, zIndex: 1005, top: this.options.fixedTop + 'px', left: left });
                this.$toolbar.addClass("fixed");
            }
            else {
                this.fixed = false;
                this.$toolbar.css({ position: 'relative', width: 'auto', zIndex: 1, top: 0, left: left });
                this.$toolbar.removeClass("fixed");
            }
        },
        observeFormatting: function() {
            var parent = this.getCurrentNode();

            this.inactiveAllButtons();

            $.each(this.options.activeButtonsStates, $.proxy(function(i,s) {
                if ($(parent).closest(i,this.$editor.get()[0]).length !== 0) {
                    this.setBtnActive(s);
                }

            }, this));

            var tag = $(parent).closest(['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'td']);

            if (typeof tag[0] !== 'undefined' && typeof tag[0].elem !== 'undefined' && $(tag[0].elem).size() !== 0) {
                var align = $(tag[0].elem).css('text-align');

                switch (align) {
                    case 'right':
                        this.setBtnActive('alignright');
                    break;
                    case 'center':
                        this.setBtnActive('aligncenter');
                    break;
                    case 'justify':
                        this.setBtnActive('justify');
                    break;
                    default:
                        this.setBtnActive('alignleft');
                    break;
                }
            }
        },
        savePreCode: function(html) {
            var pre = html.match(/<pre(.*?)>([\w\W]*?)<\/pre>/gi)
            if (pre !== null) {
                $.each(pre, $.proxy(function(i,s) {
                    var arr = s.match(/<pre(.*?)>([\w\W]*?)<\/pre>/i)
                    arr[2] = this.encodeEntities(arr[2])
                    html = html.replace(s, '<pre' + arr[1] + '>' + arr[2] + '</pre>')
                }, this))
            }
            return html
        },

        encodeEntities: function(str) {
            str = String(str).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
            return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
        },
        getParentNode: function() {
            return $(this.getCurrentNode()).parent()[0]

        },
        syncCode: function() {
            this.$element.val(this.$editor.html());
            this.$summaryContainer.val(this.$editor.text().substring(0, 60))
        },
        // Get elements, html and text
        getCurrentNode: function() {
            if (typeof this.window.getSelection !== 'undefined') {
                var selectedNode = this.getSelectedNode()
                if(selectedNode.tagName === 'BLOCKQUOTE')
                    return selectedNode;
                return this.getSelectedNode().parentNode;
            }
            else if (typeof this.document.selection !== 'undefined') {
                return this.getSelection().parentElement();
            }

        },
        pasteHtmlAtCaret: function (html) {
            var sel, range;
            if (this.document.getSelection) {
                sel = this.window.getSelection();
                if (sel.getRangeAt && sel.rangeCount) {
                    range = sel.getRangeAt(0);
                    range.deleteContents();
                    var el = this.document.createElement("div");
                    el.innerHTML = html;
                    var frag = this.document.createDocumentFragment(), node, lastNode;
                    while ((node = el.firstChild)) {
                        lastNode = frag.appendChild(node);
                    }
                    range.insertNode(frag);

                    if (lastNode) {
                        range = range.cloneRange();
                        range.setStartAfter(lastNode);
                        range.collapse(true);
                        sel.removeAllRanges();
                        sel.addRange(range);
                    }
                }
            }
            else if (this.document.selection && this.document.selection.type != "Control") {
                this.document.selection.createRange().pasteHTML(html);
            }
        },
        execRun: function(cmd, param) {
            if (cmd === 'formatblock' && $.lily.browser('msie')) {
                param = '<' + param + '>';
            }
            this.document.execCommand(cmd, false, param);
        },
        // BUFFER
        setBuffer: function()
        {
            this.saveSelection();
            this.options.buffer = this.$editor.html();
        },
        // SELECTION AND NODE MANIPULATION
        getFragmentHtml: function (fragment) {
            var cloned = fragment.cloneNode(true);
            var div = this.document.createElement('div');
            div.appendChild(cloned);
            return div.innerHTML;
        },

        extractContent: function() {
            var node = this.$editor.get(0);
            var frag = this.document.createDocumentFragment(), child;
            while ((child = node.firstChild)) {
                frag.appendChild(child);
            }

            return frag;
        },
        execCommand: function(cmd, param) {
            try {
                var parent;
                if (cmd === 'inserthtml') {
                    if ($.lily.browser('msie')) {
                        this.$editor.focus();
                        this.document.selection.createRange().pasteHTML(param);
                    }
                    else {
                        this.pasteHtmlAtCaret(param);
                    }
                    //this.calcHeight()
                }
                else if (cmd === 'unlink') {
                    parent = this.getParentNode();
                    if ($(parent).get(0).tagName === 'A') {
                        $(parent).replaceWith($(parent).text());
                    }
                    else {
                        this.execRun(cmd, param);
                    }
                }
                else if (cmd === 'JustifyLeft' || cmd === 'JustifyCenter' || cmd === 'JustifyRight' || cmd === 'JustifyFull') {
                    parent = this.getCurrentNode();
                    var tag = $(parent).get(0).tagName;

                    if (this.options.iframe === false && $(parent).parents('.redactor_editor').size() === 0) {
                        return false;
                    }

                    var tagsArray = ['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'TD'];
                    if ($.inArray(tag, tagsArray) != -1) {
                        var align = false;

                        if (cmd === 'JustifyCenter') {
                            align = 'center';
                        }
                        else if (cmd === 'JustifyRight') {
                            align = 'right';
                        }
                        else if (cmd === 'JustifyFull') {
                            align = 'justify';
                        }

                        if (align === false) {
                            $(parent).css('text-align', '');
                        }
                        else {
                            $(parent).css('text-align', align);
                        }
                    }
                    else {
                        this.execRun(cmd, param);
                    }
                }
                else if (cmd === 'formatblock' && param === 'blockquote') {
                    parent = this.getCurrentNode();
                    if ($(parent).get(0).tagName === 'BLOCKQUOTE') {
                        if ($.lily.browser('msie')) {
                            var node = $('<p>' + $(parent).html() + '</p>');
                            $(parent).replaceWith(node);
                        }
                        else {
                            this.execRun(cmd, 'p');
                        }
                    }
                    else if ($(parent).get(0).tagName === 'P') {
                        var parent2 = $(parent).parent();
                        if ($(parent2).get(0).tagName === 'BLOCKQUOTE') {
                            var currentNode = $('<p>' + $(parent).html() + '</p>');
                            $(parent2).replaceWith(currentNode);
                            this.setSelection(currentNode[0], 0, currentNode[0], 0);
                        }
                        else {
                            if ($.lily.browser('msie')) {
                                var blockquoterNode = $('<blockquote>' + $(parent).html() + '</blockquote>');
                                $(parent).replaceWith(blockquoterNode);
                            }
                            else {
                                this.execRun(cmd, param);
                            }
                        }
                    }
                    else {
                        this.execRun(cmd, param);
                    }
                }
                else if (cmd === 'formatblock' && (param === 'pre' || param === 'p')) {
                    parent = this.getParentNode();

                    if ($(parent).get(0).tagName === 'PRE') {
                        $(parent).replaceWith('<p>' +  this.encodeEntities($(parent).text()) + '</p>');
                    }
                    else {
                        this.execRun(cmd, param);
                    }
                }
                else {
                    if (cmd === 'inserthorizontalrule' && $.lily.browser('msie')) {
                        this.$editor.focus();
                    }

                    if (cmd === 'formatblock' && $.lily.browser('mozilla')) {
                        this.$editor.focus();
                    }

                    this.execRun(cmd, param);
                }

                if (cmd === 'inserthorizontalrule') {
                    this.$editor.find('hr').removeAttr('id');
                }

                this.syncCode();

                if (typeof this.options.execCommandCallback === 'function') {
                    this.options.execCommandCallback(this, cmd);
                }
            }
            catch (e) { }
        },
        saveSelection: function() {
            this.$editor.focus();

            this.savedSel = this.getOrigin();
            this.savedSelObj = this.getFocus();
        },
        getOrigin: function() {
            var sel;
            if (!((sel = this.getSelection()) && (sel.anchorNode != null))) {
                return null;
            }
            return [sel.anchorNode, sel.anchorOffset];
        },
        getFocus: function() {
            var sel;
            if (!((sel = this.getSelection()) && (sel.focusNode != null))) {
                return null;
            }
            return [sel.focusNode, sel.focusOffset];
        },

        setSelection: function (orgn, orgo, focn, foco) {
            if (focn == null) {
                focn = orgn;
            }
            if (foco == null) {
                foco = orgo;
            }
            if (!$.lily.oldIE()) {
                var sel = this.getSelection();
                if (!sel) {
                    return;
                }
                if (sel.collapse && sel.extend) {
                    sel.collapse(orgn, orgo);
                    sel.extend(focn, foco);
                }
                //IE 9
                else {
                    var r = this.document.createRange();
                    r.setStart(orgn, orgo);
                    r.setEnd(focn, foco);

                    try {
                        sel.removeAllRanges();
                    }
                    catch (e) {}

                    sel.addRange(r);
                }
            }
            else {
                var node = this.$editor.get(0);
                var range = node.document.body.createTextRange();

                this._moveBoundary(node.document, range, false, focn, foco);
                this._moveBoundary(node.document, range, true, orgn, orgo);
                return range.select();
            }
        },

        restoreSelection: function() {
            if (typeof this.savedSel !== 'undefined' &&
                this.savedSel !== null && this.savedSelObj !== null &&
                this.savedSel[0].tagName !== 'BODY') {
                if (this.options.iframe === false && $(this.savedSel[0]).closest('.redactor_editor').size() === 0) {
                    this.$editor.focus();
                }
                else {
                    if ($.lily.browser('opera')) {
                        this.$editor.focus();
                    }

                    this.setSelection(this.savedSel[0], this.savedSel[1], this.savedSelObj[0], this.savedSelObj[1]);

                    if ($.lily.browser('mozilla')) {
                        this.$editor.focus();
                    }
                }
            }
            else {
                this.$editor.focus();
            }
        },

        // Selection
        getSelection: function() {
            var doc = this.document;

            if (this.window.getSelection) {
                return this.window.getSelection();
            }
            else if (doc.getSelection) {
                return doc.getSelection();
            }
            else {
                return doc.selection.createRange();
            }
            return false;
        },
        getSelectedNode: function() {
            if (typeof this.window.getSelection !== 'undefined') {
                var s = this.window.getSelection();
                if (s.rangeCount > 0) {
                    return this.getSelection().getRangeAt(0).commonAncestorContainer;
                }
                else {
                    return false;
                }
            }
            else if (typeof this.document.selection !== 'undefined') {
                return this.getSelection();
            }
        },
        // BUTTONS MANIPULATIONS
        getBtn: function(key) {
            if (this.options.toolbar === false) {
                return false;
            }
            return $(this.$toolbar.find('a.editor_btn_' + key));
        },
        setBtnActive: function(key) {
            this.getBtn(key).addClass('editor_act');
        },
        setBtnInactive: function(key) {
            this.getBtn(key).removeClass('editor_act');
        },
        inactiveAllButtons: function() {
            $.each(this.options.activeButtons, $.proxy(function(i,s) {
                this.setBtnInactive(s);
            }, this));
        },
        formatNewLine: function() {
            var parent = this.getParentNode();

            if (parent.nodeName === 'DIV' && parent.className === 'editor_editor') {
                var element = $(this.getCurrentNode());

                if (element.get(0).tagName === 'DIV' && (element.html() === '' || element.html() === '<br>')) {
                    var newElement = $('<p>').append(element.clone().get(0).childNodes);
                    element.replaceWith(newElement);
                    newElement.html('<br />');
                    this.setSelection(newElement[0], 0, newElement[0], 0);
                }
            }
        },

        toggle: function() {

            var html = this.$element.val();
            if(this.$element.css("display") == "none") {
                var height = this.$editor.innerHeight();

                this.$editor.hide();

                html = this.$editor.html();
                //html = $.trim(this.formatting(html));

                this.$element.height(height).val(html).show().focus();

                this.setBtnActive('html');
                return
            }

            // set code
            this.$editor.html(html).show();

            if (this.$editor.html() === '') {
                this.setCode(this.options.emptyHtml);
            }

            this.$editor.focus();

            this.setBtnInactive('html');
            this.$editor.show()
            this.$element.hide();
        },
        imageUploadCallback: function(data) {
            if(data.returnCode != '0' && data.returnCode != '000000') {
                $.lily.showTips(data.errorMsg);
            } else {
                this._imageSet(data);
            }
        },
        _imageSet: function(json, link) {
            //this.restoreSelection()
            if (json !== false) {
                var html = ''
                if (link !== true) {
                    html = '<p><img src="' + json.imageUrl + '" /></p>'
                }
                else {
                    html = json
                }
                this.execCommand('inserthtml', html)
            }
            this.windowClose()
        },
        windowClose: function() {
            this.currentWindow.modal('hide')
        },
        showImage: function() {
            this.saveSelection()
            var contentStr = '<section class="publish-modal modal fade" id="image-modal">'
                             + '<form action="/activity" id="image-form" method="post">'
                             + '<div class="modal-dialog">'
                             + '<div class="modal-content">'
                             + '<div class="modal-title">'
                             + '<i>上传图片</i>'
                             + '<span data-dismiss="modal"></span>'
                             + '</div>'
                             + '<div class="modal-body">'
                             + '<div class="tab-content inline" id="modal_upload_image">'
                             + '<input type="file" name="file" id="file_upload_container" style="opacity:0;height:80;cursor:pointer;font-size:0;position:absolute;">'
                             + '<a href="javascript:;" class="btn btn-primary">选择图片</a>'
                             + '</div>'
                             + '</div>'
                             + '</div>'
                             + '</div>'
                             + '</form>'
                             + '</section>'

            var self = this
            function bindFileUpload($element) {
                $('[type="file"]', $element).bind("change", function(e) {
                    var $image = $(e.target)
                    var file = $image.get(0).files[0]
                    $.ajaxFileUpload('/upload/image',
                        file,
                        function (reponseData) {
                            self.imageUploadCallback(reponseData)
                        }
                    )
                })
            }
            this.currentWindow = $(contentStr)
            $('body').append(this.currentWindow )
            bindFileUpload(this.currentWindow )
            $('#image-modal').modal('show')
//            this.currentWindow = $.openWindow({
//                windowClass:'window',
//                backdrop: true,
//                allowMinimize: false,
//                btnClass: 'float-btn',
//                showFun: null,
//                title: '插入图片',
//                content: contentStr,
//                source: $(e.target),
//                afterFun: bindFileUpload
//            });
        },
        paragraphy: function (str) {
            str = $.trim(str)
            if (str === '' || str === '<p></p>') {
                return this.options.emptyHtml
            }
            if (this.options.convertDivs) {
                str = str.replace(/<div(.*?)>([\w\W]*?)<\/div>/gi, '<p>$2</p>')
            }

            var X = function(x, a, b) { return x.replace(new RegExp(a, 'g'), b); }
            var R = function(a, b) { return new X(str, a, b); }

            var blocks = '(table|thead|tfoot|caption|colgroup|tbody|tr|td|th|div|dl|dd|dt|ul|ol|li|pre|select|form|blockquote|address|math|style|script|object|input|param|p|h[1-6])'

            str += '\n'

            new R('<br />\\s*<br />', '\n\n')
            new R('(<' + blocks + '[^>]*>)', '\n$1')
            new R('(</' + blocks + '>)', '$1\n\n');
            new R('\r\n|\r', '\n'); // newlines
            new R('\n\n+', '\n\n'); // remove duplicates
            new R('\n?((.|\n)+?)$', '<p>$1</p>\n'); // including one at the end
            new R('<p>\\s*?</p>', ''); // remove empty p
            new R('<p>(<div[^>]*>\\s*)', '$1<p>');
            new R('<p>([^<]+)\\s*?(</(div|address|form)[^>]*>)', '<p>$1</p>$2');
            new R('<p>\\s*(</?' + blocks + '[^>]*>)\\s*</p>', '$1');
            new R('<p>(<li.+?)</p>', '$1');
            new R('<p>\\s*(</?' + blocks + '[^>]*>)', '$1');
            new R('(</?' + blocks + '[^>]*>)\\s*</p>', '$1');
            new R('(</?' + blocks + '[^>]*>)\\s*<br />', '$1');
            new R('<br />(\\s*</?(p|li|div|dl|dd|dt|th|pre|td|ul|ol)[^>]*>)', '$1');

            // pre
            if (str.indexOf('<pre') != -1) {
                new R('(<pre(.|\n)*?>)((.|\n)*?)</pre>', function(m0, m1, m2, m3)
                {
                    return new X(m1, '\\\\([\'\"\\\\])', '$1') + new X(new X(new X(m3, '<p>', '\n'), '</p>|<br />', ''), '\\\\([\'\"\\\\])', '$1') + '</pre>';
                });
            }
            return new R('\n</p>$', '</p>')
        },

        // REMOVE TAGS
        stripTags: function(html) {
            var allowed = this.options.allowedTags;
            var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
            return html.replace(tags, function ($0, $1) {
                return $.inArray($1.toLowerCase(), allowed) > '-1' ? $0 : '';
            });
        },

        // PASTE CLEANUP
        pasteCleanUp: function(html) {
            var parent = this.getParentNode();
            // clean up pre
            if ($(parent).get(0).tagName === 'PRE') {
                html = this.cleanupPre(html);
                this.pasteCleanUpInsert(html);
                return true;
            }

            // remove comments and php tags
            html = html.replace(/<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi, '');

            // remove nbsp
            html = html.replace(/(&nbsp;){2,}/gi, '&nbsp;');

            // remove google docs marker
            html = html.replace(/<b\sid="internal-source-marker(.*?)">([\w\W]*?)<\/b>/gi, "$2");

            // strip tags
            html = this.stripTags(html);

            // prevert
            html = html.replace(/<td><\/td>/gi, '[td]');
            html = html.replace(/<td>&nbsp;<\/td>/gi, '[td]');
            html = html.replace(/<td><br><\/td>/gi, '[td]');
            html = html.replace(/<a(.*?)href="(.*?)"(.*?)>([\w\W]*?)<\/a>/gi, '[a href="$2"]$4[/a]');
            html = html.replace(/<iframe(.*?)>([\w\W]*?)<\/iframe>/gi, '[iframe$1]$2[/iframe]');
            html = html.replace(/<video(.*?)>([\w\W]*?)<\/video>/gi, '[video$1]$2[/video]');
            html = html.replace(/<audio(.*?)>([\w\W]*?)<\/audio>/gi, '[audio$1]$2[/audio]');
            html = html.replace(/<embed(.*?)>([\w\W]*?)<\/embed>/gi, '[embed$1]$2[/embed]');
            html = html.replace(/<object(.*?)>([\w\W]*?)<\/object>/gi, '[object$1]$2[/object]');
            html = html.replace(/<param(.*?)>/gi, '[param$1]');
            html = html.replace(/<img(.*?)style="(.*?)"(.*?)>/gi, '[img$1$3]');

            // remove attributes
            html = html.replace(/<(\w+)([\w\W]*?)>/gi, '<$1>');

            // remove empty
            html = html.replace(/<[^\/>][^>]*>(\s*|\t*|\n*|&nbsp;|<br>)<\/[^>]+>/gi, '');
            html = html.replace(/<[^\/>][^>]*>(\s*|\t*|\n*|&nbsp;|<br>)<\/[^>]+>/gi, '');

            // revert
            html = html.replace(/\[td\]/gi, '<td>&nbsp;</td>');
            html = html.replace(/\[a href="(.*?)"\]([\w\W]*?)\[\/a\]/gi, '<a href="$1">$2</a>');
            html = html.replace(/\[iframe(.*?)\]([\w\W]*?)\[\/iframe\]/gi, '<iframe$1>$2</iframe>');
            html = html.replace(/\[video(.*?)\]([\w\W]*?)\[\/video\]/gi, '<video$1>$2</video>');
            html = html.replace(/\[audio(.*?)\]([\w\W]*?)\[\/audio\]/gi, '<audio$1>$2</audio>');
            html = html.replace(/\[embed(.*?)\]([\w\W]*?)\[\/embed\]/gi, '<embed$1>$2</embed>');
            html = html.replace(/\[object(.*?)\]([\w\W]*?)\[\/object\]/gi, '<object$1>$2</object>');
            html = html.replace(/\[param(.*?)\]/gi, '<param$1>');
            html = html.replace(/\[img(.*?)\]/gi, '<img$1>');


            // convert div to p
            if (this.options.convertDivs) {
                html = html.replace(/<div(.*?)>([\w\W]*?)<\/div>/gi, '<p>$2</p>');
            }

            // remove span
            html = html.replace(/<span>([\w\W]*?)<\/span>/gi, '$1');

            html = html.replace(/\n{3,}/gi, '\n');

            // remove dirty p
            html = html.replace(/<p><p>/gi, '<p>');
            html = html.replace(/<\/p><\/p>/gi, '</p>');

            // FF fix
            if ($.lily.browser('mozilla')) {
                html = html.replace(/<br>$/gi, '');
            }
            this.pasteCleanUpInsert(html);
        },

        pasteCleanUpInsert: function(html) {
            this.execCommand('inserthtml', html);

            if (this.options.autoresize === true) {
                $(this.document.body).scrollTop(this.saveScroll);
            }
            else {
                this.$editor.scrollTop(this.saveScroll);
            }
        },

        show: function() {
        },

        resetForm: function() {
        }
    }

    $.fn.editor = function ( option ) {
       return this.each(function () {
           var $this = $(this),
               data = $this.data('editor'),
               options = typeof option == 'object' && option
           if (!data) {
               $this.data('editor', (data = new Editor(this, options)));
           }
       });
    }
    var localization = {
        html: 'HTML',
        video: 'Insert Video',
        image: 'Insert Image',
        table: 'Table',
        link: 'Link',
        link_insert: 'Insert link',
        unlink: 'Unlink',
        formatting: 'Formatting',
        paragraph: 'Paragraph',
        quote: '引用',
        code: 'Code',
        header1: 'Header 1',
        header2: 'Header 2',
        header3: 'Header 3',
        header4: 'Header 4',
        bold:  '粗体',
        italic: '斜体',
        fontcolor: 'Font Color',
        backcolor: 'Back Color',
        unorderedlist: '无序列表',
        orderedlist: '有序列表',
        cancel: 'Cancel',
        insert: 'Insert',
        save: 'Save',
        _delete: '删除',
        insert_table: 'Insert Table',
        insert_row_above: 'Add Row Above',
        insert_row_below: 'Add Row Below',
        insert_column_left: 'Add Column Left',
        insert_column_right: 'Add Column Right',
        delete_column: 'Delete Column',
        delete_row: 'Delete Row',
        delete_table: 'Delete Table',
        rows: 'Rows',
        columns: 'Columns',
        add_head: 'Add Head',
        delete_head: 'Delete Head',
        title: 'Title',
        image_position: 'Position',
        none: 'None',
        left: 'Left',
        right: 'Right',
        image_web_link: 'Image Web Link',
        text: 'Text',
        mailto: 'Email',
        web: 'URL',
        video_html_code: 'Video Embed Code',
        file: 'Insert File',
        upload: 'Upload',
        download: 'Download',
        choose: 'Choose',
        or_choose: 'Or choose',
        drop_file_here: 'Drop file here',
        align_left: 'Align text to the left',
        align_center: 'Center text',
        align_right: 'Align text to the right',
        align_justify: 'Justify text',
        horizontalrule: 'Insert Horizontal Rule',
        deleted: '删除',
        anchor: 'Anchor',
        link_new_tab: 'Open link in new tab',
        underline: 'Underline',
        alignment: 'Alignment',
        outdent: '减少缩进',
        indent: '增加缩进'
    };


    $.fn.editor.defaults = {
        buttons: [
            'bold', 'italic', 'underline', '|',
            'unorderedlist', 'orderedlist', 'blockquote', '|',
            'image'],
        activeButtons: ['italic', 'bold', 'underline', 'unorderedlist', 'orderedlist', 'blockquote', 'image'],
        activeButtonsStates: {
            b: 'bold',
            strong: 'bold',
            i: 'italic',
            em: 'italic',
            del: 'deleted',
            strike: 'deleted',
            ul: 'unorderedlist',
            ol: 'orderedlist',
            u: 'underline',
            blockquote: 'blockquote'
        },
        toolbar: {
            html:
            {
                title: localization.html,
                func: 'toggle'
            },
            bold:
            {
                title: localization.bold,
                exec: 'bold'
            },
            italic:
            {
                title: localization.italic,
                exec: 'italic'
            },
            deleted:
            {
                title: '<strike>' + localization.deleted +  '</strike>' ,
                exec: 'strikethrough'
            },
            underline:
            {
                title: localization.underline,
                exec: 'underline'
            },
            unorderedlist:
            {
                title: localization.unorderedlist,
                exec: 'insertunorderedlist'
            },
            orderedlist:
            {
                title: localization.orderedlist,
                exec: 'insertorderedlist'
            },
            outdent:
            {
                title: localization.outdent,
                exec: 'outdent'
            },
            indent:
            {
                title: localization.indent,
                exec: 'indent'
            },
            image:
            {
                title: localization.image,
                func: 'showImage'
            },
            video:
            {
                title: localization.video,
                func: 'showVideo'
            },
            file:
            {
                title: localization.file,
                func: 'showFile'
            },
            blockquote:
            {
                title: localization.quote,
                exec: 'formatblock',
                className: 'redactor_format_blockquote'
            }
        },
        css: '/static/css/main.css',
        emptyHtml: '<p><br /></p>',
        allowedTags: ["form", "input", "button", "select", "option", "datalist", "output", "textarea", "fieldset", "legend",
                    "section", "header", "hgroup", "aside", "footer", "article", "details", "nav", "progress", "time", "canvas",
                    "code", "span", "div", "label", "a", "br", "p", "b", "i", "del", "strike", "u",
                    "img", "video", "source", "track", "audio", "iframe", "object", "embed", "param", "blockquote",
                    "mark", "cite", "small", "ul", "ol", "li", "hr", "dl", "dt", "dd", "sup", "sub",
                    "big", "pre", "code", "figure", "figcaption", "strong", "em", "table", "tr", "td",
                    "th", "tbody", "thead", "tfoot", "h1", "h2", "h3", "h4", "h5", "h6"],
        fixed: false,
        fixedBox: false,
        fixedTop: 5
    }
    $.fn.editor.Constructor = Editor

}(window.jQuery)

/*!
 * bootstrap-select v1.3.5
 * http://silviomoreto.github.io/bootstrap-select/
 *
 * Copyright 2013 bootstrap-select
 * Licensed under the MIT license
 */

!function($) {

    "use strict";

    $.expr[":"].icontains = function(obj, index, meta) {
        return $(obj).text().toUpperCase().indexOf(meta[3].toUpperCase()) >= 0;
    };

    var Selectpicker = function(element, options, e) {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        this.$element = $(element);
        this.$newElement = null;
        this.$button = null;
        this.$menu = null;

        //Merge defaults, options and data-attributes to make our options
        this.options = $.extend({}, $.fn.selectpicker.defaults, this.$element.data(), typeof options == 'object' && options);

        //If we have no title yet, check the attribute 'title' (this is missed by jq as its not a data-attribute
        if (this.options.title == null) {
            this.options.title = this.$element.attr('title');
        }

        //Expose public methods
        this.val = Selectpicker.prototype.val;
        this.render = Selectpicker.prototype.render;
        this.refresh = Selectpicker.prototype.refresh;
        this.setStyle = Selectpicker.prototype.setStyle;
        this.selectAll = Selectpicker.prototype.selectAll;
        this.deselectAll = Selectpicker.prototype.deselectAll;
        this.init();
    };

    Selectpicker.prototype = {

        constructor: Selectpicker,

        init: function() {
            this.$element.hide();
            this.multiple = this.$element.prop('multiple');
            var id = this.$element.attr('id');
            this.$newElement = this.createView();
            this.$element.after(this.$newElement);
            this.$menu = this.$newElement.find('> .dropdown-menu-container');
            this.$button = this.$newElement.find('> button');
            this.$searchbox = this.$newElement.find('input');

            if (id !== undefined) {
                var that = this;
                this.$button.attr('data-id', id);
                $('label[for="' + id + '"]').click(function(e) {
                    e.preventDefault();
                    that.$button.focus();
                });
            }

            this.checkDisabled();
            this.clickListener();
            this.liveSearchListener();
            this.render();
            this.liHeight();
            this.setStyle();
            this.setWidth();
            if (this.options.container) {
                this.selectPosition();
            }
            this.$menu.data('this', this);
            this.$newElement.data('this', this);
        },

        createDropdown: function() {
            //If we are multiple, then add the show-tick class by default
            var multiple = this.multiple ? ' show-tick' : '';
            var header = this.options.header ? '<div class="popover-title"><button type="button" class="close" aria-hidden="true">&times;</button>' + this.options.header + '</div>' : '';
            var searchbox = this.options.liveSearch ? '<div class="bootstrap-select-searchbox"><input type="text" class="input-block-level form-control" /></div>' : '';
            var drop =
                "<div class='btn-group bootstrap-select" + multiple + "'>" +
                    "<button type='button' class='btn dropdown-toggle' data-toggle='dropdown'>" +
                        "<div class='filter-option pull-left'></div>&nbsp;" +
                        "<div class='caret'></div>" +
                    "</button>" +
                    "<div class='dropdown-menu-container open'>" +
                        header +
                        searchbox +
                        "<ul class='dropdown-menu inner' role='menu'>" +
                        "</ul>" +
                    "</div>" +
                "</div>";

            return $(drop);
        },

        createView: function() {
            var $drop = this.createDropdown();
            var $li = this.createLi();
            $drop.find('ul').append($li);
            return $drop;
        },

        reloadLi: function() {
            //Remove all children.
            this.destroyLi();
            //Re build
            var $li = this.createLi();
            this.$menu.find('ul').append( $li );
            this.$newElement.find('.filter-option').html($($li.get(0)).text());
        },

        destroyLi: function() {
            this.$menu.find('li').remove();
        },

        createLi: function() {
            var that = this,
                _liA = [],
                _liHtml = '';

            this.$element.find('option').each(function() {
                var $this = $(this);

                //Get the class and text for the option
                var optionClass = $this.attr("class") || '';
                var inline = $this.attr("style") || '';
                var text =  $this.data('content') ? $this.data('content') : $this.html();
                var subtext = $this.data('subtext') !== undefined ? '<small class="muted text-muted">' + $this.data('subtext') + '</small>' : '';
                var icon = $this.data('icon') !== undefined ? '<i class="glyphicon '+$this.data('icon')+'"></i> ' : '';
                if (icon !== '' && ($this.is(':disabled') || $this.parent().is(':disabled'))) {
                    icon = '<span>'+icon+'</span>';
                }

                if (!$this.data('content')) {
                    //Prepend any icon and append any subtext to the main text.
                    text = icon + '<span class="text">' + text + subtext + '</span>';
                }

                if (that.options.hideDisabled && ($this.is(':disabled') || $this.parent().is(':disabled'))) {
                    _liA.push('<a style="min-height: 0; padding: 0"></a>');
                } else if ($this.parent().is('optgroup') && $this.data('divider') !== true) {
                    if ($this.index() === 0) {
                        //Get the opt group label
                        var label = $this.parent().attr('label');
                        var labelSubtext = $this.parent().data('subtext') !== undefined ? '<small class="muted text-muted">'+$this.parent().data('subtext')+'</small>' : '';
                        var labelIcon = $this.parent().data('icon') ? '<i class="'+$this.parent().data('icon')+'"></i> ' : '';
                        label = labelIcon + '<span class="text">' + label + labelSubtext + '</span>';

                        if ($this[0].index !== 0) {
                            _liA.push(
                                '<div class="div-contain"><div class="divider"></div></div>'+
                                '<dt>'+label+'</dt>'+
                                that.createA(text, "opt " + optionClass, inline )
                                );
                        } else {
                            _liA.push(
                                '<dt>'+label+'</dt>'+
                                that.createA(text, "opt " + optionClass, inline ));
                        }
                    } else {
                         _liA.push(that.createA(text, "opt " + optionClass, inline ));
                    }
                } else if ($this.data('divider') === true) {
                    _liA.push('<div class="div-contain"><div class="divider"></div></div>');
                } else if ($(this).data('hidden') === true) {
                    _liA.push('');
                } else {
                    _liA.push(that.createA(text, optionClass, inline ));
                }
            });

            $.each(_liA, function(i, item) {
                _liHtml += "<li rel=" + i + ">" + item + "</li>";
            });

            //If we are not multiple, and we dont have a selected item, and we dont have a title, select the first element so something is set in the button
            if (!this.multiple && this.$element.find('option:selected').length===0 && !this.options.title) {
                this.$element.find('option').eq(0).prop('selected', true).attr('selected', 'selected');
            }

            return $(_liHtml);
        },

        createA: function(text, classes, inline) {
            return '<a tabindex="0" class="'+classes+'" style="'+inline+'">' +
                 text +
                 '<i class="glyphicon glyphicon-ok icon-ok check-mark"></i>' +
                 '</a>';
        },

        render: function() {
            var that = this;

            //Update the LI to match the SELECT
            this.$element.find('option').each(function(index) {
               that.setDisabled(index, $(this).is(':disabled') || $(this).parent().is(':disabled') );
               that.setSelected(index, $(this).is(':selected') );
            });

            this.tabIndex();

            var selectedItems = this.$element.find('option:selected').map(function() {
                var $this = $(this);
                var icon = $this.data('icon') && that.options.showIcon ? '<i class="glyphicon ' + $this.data('icon') + '"></i> ' : '';
                var subtext;
                if (that.options.showSubtext && $this.attr('data-subtext') && !that.multiple) {
                    subtext = ' <small class="muted text-muted">'+$this.data('subtext') +'</small>';
                } else {
                    subtext = '';
                }
                if ($this.data('content') && that.options.showContent) {
                    return $this.data('content');
                } else if ($this.attr('title') !== undefined) {
                    return $this.attr('title');
                } else {
                    return icon + $this.html() + subtext;
                }
            }).toArray();

            //Fixes issue in IE10 occurring when no default option is selected and at least one option is disabled
            //Convert all the values into a comma delimited string
            var title = !this.multiple ? selectedItems[0] : selectedItems.join(", ");

            //If this is multi select, and the selectText type is count, the show 1 of 2 selected etc..
            if (this.multiple && this.options.selectedTextFormat.indexOf('count') > -1) {
                var max = this.options.selectedTextFormat.split(">");
                var notDisabled = this.options.hideDisabled ? ':not([disabled])' : '';
                if ( (max.length>1 && selectedItems.length > max[1]) || (max.length==1 && selectedItems.length>=2)) {
                    title = this.options.countSelectedText.replace('{0}', selectedItems.length).replace('{1}', this.$element.find('option:not([data-divider="true"]):not([data-hidden="true"])'+notDisabled).length);
                }
             }

            //If we dont have a title, then use the default, or if nothing is set at all, use the not selected text
            if (!title) {
                title = this.options.title !== undefined ? this.options.title : this.options.noneSelectedText;
            }

            this.$newElement.find('.filter-option').html(title);
        },

        setStyle: function(style, status) {
            if (this.$element.attr('class')) {
                this.$newElement.addClass(this.$element.attr('class').replace(/selectpicker|mobile-device/gi, ''));
            }

            var buttonClass = style ? style : this.options.style;

            if (status == 'add') {
                this.$button.addClass(buttonClass);
            } else if (status == 'remove') {
                this.$button.removeClass(buttonClass);
            } else {
                this.$button.removeClass(this.options.style);
                this.$button.addClass(buttonClass);
            }
        },

        liHeight: function() {
            var selectClone = this.$newElement.clone();
            selectClone.appendTo('body');
            var $menuClone = selectClone.addClass('open').find('> .dropdown-menu-container');
            var liHeight = $menuClone.find('li > a').outerHeight();
            var headerHeight = this.options.header ? $menuClone.find('.popover-title').outerHeight() : 0;
            var searchHeight = this.options.liveSearch ? $menuClone.find('.bootstrap-select-searchbox').outerHeight() : 0;
            selectClone.remove();
            this.$newElement.data('liHeight', liHeight).data('headerHeight', headerHeight).data('searchHeight', searchHeight);
        },

        setSize: function() {
            var that = this,
                menu = this.$menu,
                menuInner = menu.find('.inner'),
                selectHeight = this.$newElement.outerHeight(),
                liHeight = this.$newElement.data('liHeight'),
                headerHeight = this.$newElement.data('headerHeight'),
                searchHeight = this.$newElement.data('searchHeight'),
                divHeight = menu.find('li .divider').outerHeight(true),
                menuPadding = parseInt(menu.css('padding-top'), 10) +
                              parseInt(menu.css('padding-bottom'), 10) +
                              parseInt(menu.css('border-top-width'), 10) +
                              parseInt(menu.css('border-bottom-width'), 10),
                notDisabled = this.options.hideDisabled ? ':not(.disabled)' : '',
                $window = $(window),
                menuExtras = menuPadding + parseInt(menu.css('margin-top'), 10) + parseInt(menu.css('margin-bottom'), 10) + 2,
                menuHeight,
                selectOffsetTop,
                selectOffsetBot,
                posVert = function() {
                    selectOffsetTop = that.$newElement.offset().top - $window.scrollTop();
                    selectOffsetBot = $window.height() - selectOffsetTop - selectHeight;
                };
                posVert();
                if (this.options.header) menu.css('padding-top', 0);

            if (this.options.size == 'auto') {
                var getSize = function() {
                    var minHeight;
                    posVert();
                    menuHeight = selectOffsetBot - menuExtras;
                    that.$newElement.toggleClass('dropup', (selectOffsetTop > selectOffsetBot) && (menuHeight - menuExtras) < menu.height() && that.options.dropupAuto);
                    if (that.$newElement.hasClass('dropup')) {
                        menuHeight = selectOffsetTop - menuExtras;
                    }
                    if ((menu.find('li').length + menu.find('dt').length) > 3) {
                        minHeight = liHeight*3 + menuExtras - 2;
                    } else {
                        minHeight = 0;
                    }
                    menu.css({'max-height' : menuHeight + 'px', 'overflow' : 'hidden', 'min-height' : minHeight + 'px'});
                    menuInner.css({'max-height' : menuHeight - headerHeight - searchHeight- menuPadding + 'px', 'overflow-y' : 'auto', 'min-height' : minHeight - menuPadding + 'px'});
                };
                getSize();
                $(window).resize(getSize);
                $(window).scroll(getSize);
            } else if (this.options.size && this.options.size != 'auto' && menu.find('li'+notDisabled).length > this.options.size) {
                var optIndex = menu.find("li"+notDisabled+" > *").filter(':not(.div-contain)').slice(0,this.options.size).last().parent().index();
                var divLength = menu.find("li").slice(0,optIndex + 1).find('.div-contain').length;
                menuHeight = liHeight*this.options.size + divLength*divHeight + menuPadding;
                this.$newElement.toggleClass('dropup', (selectOffsetTop > selectOffsetBot) && menuHeight < menu.height() && this.options.dropupAuto);
                menu.css({'max-height' : menuHeight + headerHeight + searchHeight + 'px', 'overflow' : 'hidden'});
                menuInner.css({'max-height' : menuHeight - menuPadding + 'px', 'overflow-y' : 'auto'});
            }
        },

        setWidth: function() {
            if (this.options.width == 'auto') {
                this.$menu.css('min-width', '0');

                // Get correct width if element hidden
                var selectClone = this.$newElement.clone().appendTo('body');
                var ulWidth = selectClone.find('> .dropdown-menu-container').css('width');
                selectClone.remove();

                this.$newElement.css('width', ulWidth);
            } else if (this.options.width == 'fit') {
                // Remove inline min-width so width can be changed from 'auto'
                this.$menu.css('min-width', '');
                this.$newElement.css('width', '').addClass('fit-width');
            } else if (this.options.width) {
                // Remove inline min-width so width can be changed from 'auto'
                this.$menu.css('min-width', '');
                this.$newElement.css('width', this.options.width);
            } else {
                // Remove inline min-width/width so width can be changed
                this.$menu.css('min-width', '');
                this.$newElement.css('width', '');
            }
            // Remove fit-width class if width is changed programmatically
            if (this.$newElement.hasClass('fit-width') && this.options.width !== 'fit') {
                this.$newElement.removeClass('fit-width');
            }
        },

        selectPosition: function() {
            var that = this,
                drop = "<div />",
                $drop = $(drop),
                pos,
                actualHeight,
                getPlacement = function($element) {
                    $drop.addClass($element.attr('class')).toggleClass('dropup', $element.hasClass('dropup'));
                    pos = $element.offset();
                    actualHeight = $element.hasClass('dropup') ? 0 : $element[0].offsetHeight;
                    $drop.css({'top' : pos.top + actualHeight, 'left' : pos.left, 'width' : $element[0].offsetWidth, 'position' : 'absolute'});
                };
            this.$newElement.on('click', function() {
                getPlacement($(this));
                $drop.appendTo(that.options.container);
                $drop.toggleClass('open', !$(this).hasClass('open'));
                $drop.append(that.$menu);
            });
            $(window).resize(function() {
                getPlacement(that.$newElement);
            });
            $(window).on('scroll', function() {
                getPlacement(that.$newElement);
            });
            $('html').on('click', function(e) {
                if ($(e.target).closest(that.$newElement).length < 1) {
                    $drop.removeClass('open');
                }
            });
        },

        mobile: function() {
            this.$element.addClass('mobile-device').appendTo(this.$newElement);
            if (this.options.container) this.$menu.hide();
        },

        refresh: function() {
            this.reloadLi();
            this.render();
            this.setWidth();
            this.setStyle();
            this.checkDisabled();
            this.liHeight();
        },
        
        update: function() {
            this.reloadLi();
            this.setWidth();
            this.setStyle();
            this.checkDisabled();
            this.liHeight();
        },

        setSelected: function(index, selected) {
            this.$menu.find('li').eq(index).toggleClass('selected', selected);
        },

        setDisabled: function(index, disabled) {
            if (disabled) {
                this.$menu.find('li').eq(index).addClass('disabled').find('a').attr('href','#').attr('tabindex',-1);
            } else {
                this.$menu.find('li').eq(index).removeClass('disabled').find('a').removeAttr('href').attr('tabindex',0);
            }
        },

        isDisabled: function() {
            return this.$element.is(':disabled');
        },

        checkDisabled: function() {
            var that = this;

            if (this.isDisabled()) {
                this.$button.addClass('disabled').attr('tabindex', -1);
            } else {
                if (this.$button.hasClass('disabled')) {
                    this.$button.removeClass('disabled');
                }

                if (this.$button.attr('tabindex') == -1) {
                    if (!this.$element.data('tabindex')) this.$button.removeAttr('tabindex');
                }
            }

            this.$button.click(function() {
                return !that.isDisabled();
            });
        },

        tabIndex: function() {
            if (this.$element.is('[tabindex]')) {
                this.$element.data('tabindex', this.$element.attr("tabindex"));
                this.$button.attr('tabindex', this.$element.data('tabindex'));
            }
        },

        clickListener: function() {
            var that = this;

            $('body').on('touchstart.dropdown', '.dropdown-menu', function(e) {
                e.stopPropagation();
            });

            this.$button.on('click', function() {
                that.$menu.addClass("open")
            });

            this.$menu.on('click', 'li a', function(e) {
                var clickedIndex = $(this).parent().index(),
                    prevValue = that.$element.val();

                //Dont close on multi choice menu
                if (that.multiple) {
                    e.stopPropagation();
                }

                e.preventDefault();

                //Dont run if we have been disabled
                if (!that.isDisabled() && !$(this).parent().hasClass('disabled')) {
                    var $options = that.$element.find('option');
                    var $option = $options.eq(clickedIndex);

                    //Deselect all others if not multi select box
                    if (!that.multiple) {
                        $options.prop('selected', false);
                        $option.prop('selected', true);
                    }
                    //Else toggle the one we have chosen if we are multi select.
                    else {
                        var state = $option.prop('selected');

                        $option.prop('selected', !state);
                    }

                    that.$button.focus();

                    // Trigger select 'change'
                    if (prevValue != that.$element.val()) {
                        that.$element.change();
                    }
                    that.$menu.removeClass("open")
                }
            });

            this.$menu.on('click', 'li.disabled a, li dt, li .div-contain, h3.popover-title', function(e) {
                if (e.target == this) {
                    e.preventDefault();
                    e.stopPropagation();
                    that.$button.focus();
                }
            });

            this.$searchbox.on('click', function(e) {
                e.stopPropagation();
            });

            this.$element.change(function() {
                that.render();
            });
        },

        liveSearchListener: function() {
            var that = this;

            this.$newElement.on('click.dropdown.data-api', function(){
                if(that.options.liveSearch) {
                    setTimeout(function() {
                        that.$searchbox.focus();
                    }, 10);
                }
            });

            this.$searchbox.on('input', function() {
                if (that.$searchbox.val()) {
                    that.$menu.find('li').show().not(':icontains(' + that.$searchbox.val() + ')').hide();
                } else {
                    that.$menu.find('li').show();
                }
            });
        },

        val: function(value) {

            if (value !== undefined) {
                this.$element.val( value );

                this.$element.change();
                return this.$element;
            } else {
                return this.$element.val();
            }
        },

        selectAll: function() {
            this.$element.find('option').prop('selected', true).attr('selected', 'selected');
            this.render();
        },

        deselectAll: function() {
            this.$element.find('option').prop('selected', false).removeAttr('selected');
            this.render();
        },

        keydown: function(e) {
            var $this,
                $items,
                $parent,
                index,
                next,
                first,
                last,
                prev,
                nextPrev,
                that;

            $this = $(this);

            $parent = $this.parent();

            that = $parent.data('this');

            if (that.options.container) $parent = that.$menu;

            $items = $('[role=menu] li:not(.divider):visible a', $parent);

            if (!$items.length) return;

            if (/(38|40)/.test(e.keyCode)) {

                index = $items.index($items.filter(':focus'));
                first = $items.parent(':not(.disabled)').first().index();
                last = $items.parent(':not(.disabled)').last().index();
                next = $items.eq(index).parent().nextAll(':not(.disabled)').eq(0).index();
                prev = $items.eq(index).parent().prevAll(':not(.disabled)').eq(0).index();
                nextPrev = $items.eq(next).parent().prevAll(':not(.disabled)').eq(0).index();

                if (e.keyCode == 38) {
                    if (index != nextPrev && index > prev) index = prev;
                    if (index < first) index = first;
                }

                if (e.keyCode == 40) {
                    if (index != nextPrev && index < next) index = next;
                    if (index > last) index = last;
                    if (index == -1) index = 0;
                }

                $items.eq(index).focus();
            } else {
                var keyCodeMap = {
                    48:"0", 49:"1", 50:"2", 51:"3", 52:"4", 53:"5", 54:"6", 55:"7", 56:"8", 57:"9", 59:";",
                    65:"a", 66:"b", 67:"c", 68:"d", 69:"e", 70:"f", 71:"g", 72:"h", 73:"i", 74:"j", 75:"k", 76:"l",
                    77:"m", 78:"n", 79:"o", 80:"p", 81:"q", 82:"r", 83:"s", 84:"t", 85:"u", 86:"v", 87:"w", 88:"x", 89:"y", 90:"z",
                    96:"0", 97:"1", 98:"2", 99:"3", 100:"4", 101:"5", 102:"6", 103:"7", 104:"8", 105:"9"
                };

                var keyIndex = [];

                $items.each(function() {
                    if ($(this).parent().is(':not(.disabled)')) {
                        if ($.trim($(this).text().toLowerCase()).substring(0,1) == keyCodeMap[e.keyCode]) {
                            keyIndex.push($(this).parent().index());
                        }
                    }
                });

                var count = $(document).data('keycount');
                count++;
                $(document).data('keycount',count);

                var prevKey = $.trim($(':focus').text().toLowerCase()).substring(0,1);

                if (prevKey != keyCodeMap[e.keyCode]) {
                    count = 1;
                    $(document).data('keycount',count);
                } else if (count >= keyIndex.length) {
                    $(document).data('keycount',0);
                }

                $items.eq(keyIndex[count - 1]).focus();
            }

            // select focused option if "Enter" or "Spacebar" are pressed
            if (/(13|32)/.test(e.keyCode)) {
                e.preventDefault();
                $(':focus').click();
                $(document).data('keycount',0);
            }
        },

        hide: function() {
            this.$newElement.hide();
        },

        show: function() {
            this.$newElement.show();
        },

        destroy: function() {
            this.$newElement.remove();
            this.$element.remove();
        }
    };

    $.fn.selectpicker = function(option, event) {
       //get the args of the outer function..
       var args = arguments;
       var value;
       var chain = this.each(function() {
            if ($(this).is('select')) {
                var $this = $(this),
                    data = $this.data('selectpicker'),
                    options = typeof option == 'object' && option;

                if (!data) {
                    $this.data('selectpicker', (data = new Selectpicker(this, options, event)));
                } else if (options) {
                    for(var i in options) {
                       data.options[i] = options[i];
                    }
                }

                if (typeof option == 'string') {
                    //Copy the value of option, as once we shift the arguments
                    //it also shifts the value of option.
                    var property = option;
                    if (data[property] instanceof Function) {
                        [].shift.apply(args);
                        value = data[property].apply(data, args);
                    } else {
                        value = data.options[property];
                    }
                }
            }
        });

        if (value !== undefined) {
            return value;
        } else {
            return chain;
        }
    };

    $.fn.selectpicker.defaults = {
        style: 'btn-default',
        size: 'auto',
        title: null,
        selectedTextFormat : 'values',
        noneSelectedText : 'Nothing selected',
        countSelectedText: '{0} of {1} selected',
        width: false,
        container: false,
        hideDisabled: false,
        showSubtext: false,
        showIcon: true,
        showContent: true,
        dropupAuto: true,
        header: false,
        liveSearch: false
    };

    $(document)
        .data('keycount', 0)
        .on('keydown', '[data-toggle=dropdown], [role=menu]' , Selectpicker.prototype.keydown);

}(window.jQuery);



/**
 * jQuery file uploader - v1.0
 * auth: shenmq
 * E-mail: mqshen@126.com
 * website: shenmq.github.com
 *
 */
+function ($) {
  'use strict';

  $.ajaxFileUpload = function(url, file, fileUploadCallback, progress) {
        var xhr = new XMLHttpRequest();
        if (xhr.upload ) {

//            if(this.isImage) {
//                var imageReader = new FileReader();
//                imageReader.onload = (function() {
//                    return function(e) {
//                        $image.attr("src", e.target.result)
//                    };
//                })(this.file);
//                imageReader.readAsDataURL(this.file);
//            }

            var dataType = 'json'
            if(progress) {
                xhr.upload.addEventListener("progress",
                    function(e) {
                        progress(e)
                    },
                    false);
            }

            // file received/failed
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    if(xhr.status == 200) {
                        var responseText = xhr.responseText
                        if(dataType === 'json')
                            responseText = $.parseJSON(responseText)
                        fileUploadCallback(responseText)
                    }
                }
            };

            // start upload
            xhr.open("POST", url, true);
            xhr.setRequestHeader("Content-type", file.type)
            xhr.setRequestHeader("X_FILENAME", encodeURIComponent(file.name));
            xhr.setRequestHeader("accept", "application/json")
            xhr.send(file);
        }
    }


}(jQuery);
  


!function ($) {

    "use strict"; 


    /* PUBLIC CLASS DEFINITION
    * ============================== */

    var ImageView = function (element, options) {
        this.$element = $(element)
        this.options = $.extend({}, $.fn.imageView.defaults, options)
        this.init()
    }

    ImageView.prototype = {

        constructor: ImageView,

        init: function() {
            this.$imageViewer = $('<div id="image_enlarger" class="with_nav" style="visibility: visible;"><button class="close"></button></div>')
            this.$navContainer = $('<nav><div class="images" data-behavior="scroll_view"><table data-behavior="scroll_content">'
                + '<tbody><tr></tr></tbody></table></div></nav>')
            if(this.options.hasButton) {
              this.$prevButton = $('<button class="left arrow" data-behavior="scroll_reverse" disabled="disabled"></button>')
              this.$nextButton = $('<button class="right arrow" data-behavior="scroll_forward" disabled="disabled"></button>')
              this.$navContainer.append(this.$prevButton)
              this.$navContainer.append(this.$nextButton)
            }
            this.$smallView = $('tr', this.$navContainer)

            var self = this

            this.reload()

            this.$navContainer.click(function(e){
                var btn = e.target
                self.startDate = new Date()
                if(btn.nodeName.toLowerCase() == 'img')
                    self.change($(btn))
            })
            $('.close', this.$imageViewer).click(function(){
                self.hide()
            })
            this.$imageViewer.append(this.$navContainer)
        },

        reload: function(){
            $('figure', this.$imageViewer).remove()
            this.$smallView.empty()
            var self = this
            $('img.thumbnail', this.$element).each(function(){
                var $this = $(this)
                $this.click(function(e){
                    e.preventDefault()
                    self.show($this)
                })
                var id = $this.attr("id")
                var content = $this.attr("alt")
                var contentHtml = '<figure id="enlarged_image_' + id + '" style="display:none;">'
                                  + '<div class="table_wrapper"><div class="cell_wrapper">'
                                  + '<img class="enlarged" src = "' + $this.attr("data-content") + '" data-width="' + $this.attr("data-width")
                                  + '" data-height="' + $this.attr("data-height") + '">'
                                  + '</div></div>'
                if(content && content.length > 0) {
                    contentHtml += '<div class="view-photo-content"><span class="view-photo-c" id="image-desc">' + content + '</span></div>'
                }
                contentHtml += '</figure>'
                var $largeImage = $(contentHtml)
                self.$imageViewer.append($largeImage)
                var $smallImage = $('<td ><img id="small_image_' + id + '" class="" src="' + $this.attr("src") + '" title="" ></td>')
                self.$smallView.append($smallImage)
            })

        },

        resize: function() {
            var self = this
            var maxWidth = self.$lastShowImage.width()
            var maxHeight = self.$lastShowImage.height()
            $('img.enlarged', this.$imageViewer).each(function(){
                var $this = $(this)
                var width = $this.attr("data-width")
                var height = $this.attr("data-height")
                var widthScale = width/maxWidth
                var heightScale = height/maxHeight
                var scale = widthScale
                if(scale < heightScale)
                    scale = heightScale
                width = width/scale
                height = height/scale
                $this.width(width)
                $this.height(height)
            })
        },

        show: function($obj) {
            if(this.isShown)
                return
            var id = $obj.attr("id")
            var self = this
            this.isShown = true
	  		backdrop.call(this, function () {
                if(self.$lastShowImage) {
                    self.$lastShowImage.hide()
                    self.$lastShowButton.removeClass('activated')
                    self.$imageViewer.show()
                }
                else {
                    self.$imageViewer.appendTo('body')
                }
                self.$lastShowImage = $('#enlarged_image_' + id, self.$imageViewer)
                self.$lastShowImage.show()
                self.$lastShowButton = $('#small_image_' + id, self.$imageViewer)
                self.$lastShowButton.addClass('activated')
                self.resize()
            })
            $(window).bind("resize.imageView", function(){
                self.resize()
            })
        },

        change: function($obj) {
            console.log(new Date() - this.startDate)
            var id = $obj.attr("id").substring(12)
            this.$lastShowImage.hide()
            this.$lastShowButton.removeClass('activated')

            this.$lastShowImage = $('#enlarged_image_' + id, this.$imageViewer)
            this.$lastShowImage.show()
            this.$lastShowButton = $obj
            this.$lastShowButton.addClass('activated')
            console.log(new Date() - this.startDate)
        },

        hide: function() {
            if(!this.isShown)
                return
            this.$imageViewer.hide()
	    	removeBackdrop.call(this);
            this.isShown = false
            $(window).unbind("resize.imageView")
        }
    }

	function backdrop( callback ) {
        /*jshint validthis:true */
		var that = this;
		if (this.isShown && this.options.backdrop) {
	  		this.$backdrop = $('<div class="shade" />')
	    		.appendTo($(this.options.appendTo));

	  		if (this.options.backdrop != 'static') {
	  		    this.$backdrop.click($.proxy(this.hide, this));
	  		}
            this.$backdrop.click(function() {
                that.hide()
            })

	  		this.$backdrop.addClass('in');
	    	callback();
		}
		else if (!this.isShown && this.$backdrop) {
	  		this.$backdrop.removeClass('in');
	    	removeBackdrop.call(this);
			callback();
		}
		else if (callback) {
	  		callback();
		}
	}

	function removeBackdrop() {
        /*jshint validthis:true */
		this.$backdrop.remove()
		this.$backdrop = null
	}
    /* PLUGIN DEFINITION
     * ======================== */

    var old = $.fn.imageView

    function Plugin(option) {
        return this.each(function () {
            var $this = $(this), 
                options = typeof option == 'object' && option, 
                data = $this.data('imageView')
            if (!data) $this.data('imageView', (data = new ImageView(this, options)))
            if (option == 'show') data.show()
        })
    }


    $.fn.imageView = Plugin
    $.fn.imageView.Constructor = ImageView

    // BUTTON NO CONFLICT
    // ==================

    $.fn.imageView.noConflict = function () {
        $.fn.imageView = old
        return this
    }

    $.fn.imageView.defaults = {
        backdrop: true,
        appendTo: 'body',
        loadingText: 'loading...',
        hasButton: false
    }
//
//    $(document).on('click.bs.image.data-api', '[data-toggle^="imageView"]', function (e) {
//      var $btn = $(e.target)
//      Plugin.call($btn, 'show')
//    })

}(window.jQuery);


!function(){

    "use strict";

    var SSE = function(element, options) {
        this.$element = $(element);
        this.options = $.extend({}, $.fn.sse.defaults, options);
        this.init();
    }

    SSE.prototype = {
        constructor: SSE,

        init: function() {
        },

        start: function() {
            if (!window.EventSource || this.options.forceAjax) {
                this.createAjax(this);
            } else {
                this.createEventSource(this);
            }
        },

        createAjax: function() {
            this.type = 'ajax';
            this.instance = {successCount: 0, id: null, retry: 3000, data: "", event: ""};
            this.runAjax();
        },


        runAjax: function() {
            if (!this.instance) {
                return;
            }
            var self = this
            $.ajax({
                url: this.options.ajaxUrl,
                method: 'GET',
                headers: {'Last-Event-ID': self.instance.id},
                success: function (receivedData, status, info) {
                    if (!self.instance) {
                        return;
                    }

                    var eventMessage = {
                        data: receivedData,
                        lastEventId: self.instance.id,
                        origin: 'http://' + info.getResponseHeader('Host'),
                        returnValue: true
                    };

                    // If there are a custom event then call it
                    self.options.onMessage(eventMessage);

                    setTimeout(function () {
                        self.runAjax();
                    }, self.instance.retry);
                },
                error: self.onError
            });
        },


        createEventSource: function() {
            var self = this
            this.type = 'event';
            this.instance = new window.EventSource(this.options.url);
            this.instance.successCount = 0;

            this.instance.onmessage = this.options.onMessage;
            this.instance.onopen = function (e) {
                if (self.instance.successCount++ === 0) {
                    self.options.onOpen(e);
                }
            };
            this.instance.onerror = function () {
                if (event.target.readyState === window.EventSource.CLOSED) {
                    self.options.onError(event);
                }
            }

            for (var key in this.options.events) {
                this.instance.addEventListener(key, this.options.events[key], false);
            }
        }
    }

    $.fn.sse = function ( option ) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('sse'),
                options = typeof option == 'object' && option;
            if (data) {
                $this.data('sse', null);
                data = null;
            }
            $this.data('sse', (data = new SSE(this, options)));
            data.start();
        });
    }

    $.fn.sse.defaults = {
        onOpen: function () {
        },
        onEnd: function () {
        },
        onError: function () {
        },
        onMessage: function () {
        },
        events: {}
    }

    $.fn.sse.Constructor = SSE

}(window.jQuery);


+function ($) {
    'use strict';

	var pluses = /\+/g;

	function encode(s) {
		return encodeURIComponent(s);
	}

	function decode(s) {
		return decodeURIComponent(s);
	}

	function stringifyCookieValue(value) {
		return String(value);
	}

	function parseCookieValue(s) {
		if (s.indexOf('"') === 0) {
			// This is a quoted cookie as according to RFC2068, unescape...
			s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
		}

		try {
			// Replace server-side written pluses with spaces.
			// If we can't decode the cookie, ignore it, it's unusable.
			// If we can't parse the cookie, ignore it, it's unusable.
			s = decodeURIComponent(s.replace(pluses, ' '));
			return s;
		} catch(e) {}
	}

	function read(s, converter) {
		var value = parseCookieValue(s);
		return $.isFunction(converter) ? converter(value) : value;
	}

	$.cookie = function (key, value, options) {

		// Write

		if (arguments.length > 1 && !$.isFunction(value)) {
			options = $.extend({}, options);

			if (typeof options.expires === 'number') {
				var days = options.expires, t = options.expires = new Date();
				t.setMilliseconds(t.getMilliseconds() + days * 864e+5);
			}

			return (document.cookie = [
				encode(key), '=', stringifyCookieValue(value),
				options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				options.path    ? '; path=' + options.path : '',
				options.domain  ? '; domain=' + options.domain : '',
				options.secure  ? '; secure' : ''
			].join(''));
		}

		// Read

		var result = key ? undefined : {},
			// To prevent the for loop in the first place assign an empty array
			// in case there are no cookies at all. Also prevents odd result when
			// calling $.cookie().
			cookies = document.cookie ? document.cookie.split('; ') : [],
			i = 0,
			l = cookies.length;

		for (; i < l; i++) {
			var parts = cookies[i].split('='),
				name = decode(parts.shift()),
				cookie = parts.join('=');

			if (key === name) {
				// If second argument (value) is a function it's a converter...
				result = read(cookie, value);
				break;
			}

			// Prevent storing a cookie that we couldn't decode.
			if (!key && (cookie = read(cookie)) !== undefined) {
				result[name] = cookie;
			}
		}

		return result;
	};

	$.removeCookie = function (key, options) {
		// Must not alter options, thus extending a fresh object...
		$.cookie(key, '', $.extend({}, options, { expires: -1 }));
		return !$.cookie(key);
	};

}(jQuery);
