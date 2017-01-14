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

