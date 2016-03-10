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

                    if (self.instance.successCount++ === 0) {
                        self.onOpen();
                    }

                    var eventMessage = {
                        data: receivedData,
                        lastEventId: self.instance.id,
                        origin: 'http://' + info.getResponseHeader('Host'),
                        returnValue: true
                    };

                    // If there are a custom event then call it
                    self._settings.onMessage(eventMessage);

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

