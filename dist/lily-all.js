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

		function doResponse(data) {

			if(data.returnCode != '0' && data.returnCode != '000000') {
			    if(data.returnCode === 302 ) {
			        window.location.href = data.redirect;
			    }
			    else {
					alert(data.errorMsg);
					if(errorCallback) {
						errorCallback();
					}
			    }
			}
			else {
				var currentTime = (new Date()).getTime();
				var timeInterval = currentTime - startTime ;
				if(timeInterval < $.lily.minInterval) {
					setTimeout(function() {options.processResponse(data) }, $.lily.minInterval - timeInterval);
				}
				else
					options.processResponse(data)
			}
		}
	    if(options.processResponse) {	
    		$.extend(options, {success: doResponse})
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
        this.$element.submit(function(e) {
            self.submit();
            e.preventDefault();
            e.stopPropagation();
        });
    }

    Form.prototype = {
        constructor: Form,

        submit: function() {

            var needConfirm = this.$submitButton.attr("data-confirm");
            if(needConfirm) {
                var r=confirm(needConfirm);
                if (!r) {
                    return;
                }
            }

		    this.oldText = this.$submitButton.text()
		    this.$submitButton.attr("disabled",true).text(this.$submitButton.attr("data-disable-with"))
            var checkResult = this.$element.data('validator').check();
            if(!checkResult.passed) {
                this.$submitButton.attr("disabled", false).text(this.oldText);
                return;
            }
            
            var requestData = checkResult.requestData

            var self = this
            function processResponse(responseData) {
                if(self.$element.data("doResponse")) {
                    self.$element.data("doResponse")(responseData, self.$element)
                    self.resetForm()
                }
                else {
                    document.location.href = responseData.successUrl
                }
            }

            function resetButton() {
                self.$submitButton.attr("disabled", false).text(self.oldText)
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
            else {
                $.lily.ajax({url: this.$element.attr("action"),
                    data: requestData,
                    dataType: 'json',
                    type: 'POST',
                    processResponse: processResponse
                }, resetButton)
            }
        },

        resetForm: function() {
		    this.$submitButton.attr("disabled", false).text(this.oldText)
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
        loadingText: 'loading...'
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
		REGEXP_MOBILE : new RegExp(/^(1[3|4|5|8])[0-9]{9}$/),
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
				if(temp=="0.00"){
					return '';
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
                self.$appendTo.append($(responseData.html));
                self.page += 1;
                if(self.options.type === 'page') {
                    self.totalElement = responseData["page.total"];
                } else {
                    self.lastFlowNum = responseData.lastFlowNum;
                    if(self.lastFlowNum === '') {
                        self.hasMore = false;
                    }
                }
                if(self.page * self.options.size > self.totalElement || !self.totalElement) {
                    self.hasMore = false;
                    self.$appendTo.parent().append('<div class="no-more "><span>暂无更多数据</span></div>');
                }
                $(".loading").hide();
                self.loading = false;
            }
            var requestData ;
            if(self.options.type === 'page') {
                requestData = $.extend({"page.page": this.page , "page.size" : self.options.size}, this.options.requestData);
            } else {
                requestData = $.extend({"lastFlowNum": this.lastFlowNum}, this.options.requestData);
            }
            $.lily.ajax({url: this.options.url,
                data: requestData,
                dataType: 'json',
                type: 'POST',
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
		LANGUAGE_REQUEST_INPUT : "请输入{%name}，此为必输项",
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
	                return $('#' + fieldConfig.id).checked;
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
                    var formatCurrency = $.lily.format.toCashWithComma( value, false, 0 );
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
			if (fieldConfig.type == 'radio') {
				var radioList = $("input:checked", fieldConfig.$element);
				if ( radioList.length === 0 ){
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

				var targetValue = $(targetId);
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
		$('input,textarea,[contenteditable]' , this.$element).each(function () {
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
                            if(self.options.showErrorInWindow)
                                self.addErrors(result);
                            else
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
					requestData[rule.id] = result.data;
					this.hideError(rule.$element)
				}
				else {
					errors.push(result);
					if(!this.options.showErrorInWindow) {
						this.showError(rule.$element, result.error)
					} else {
						this.addErrorTag(rule.$element, result.error);
					}

				}
			}
			if (errors.length > 0 && this.options.showErrorInWindow) {
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
			alert(errorMessage);
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
						result = commonValidator(data, rule, this.$element);
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
		showErrorInWindow: true,
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
	
	
