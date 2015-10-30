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
                if(self.options.summary) {
                    $(self.optiois.summary).empty().append($(responseData.summary))
                }
                if(self.page * self.options.size > self.totalElement || !self.totalElement) {
                    self.hasMore = false;
                    self.$appendTo.append('<div class="no-more "><span>暂无更多数据</span></div>');
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

