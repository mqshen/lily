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
                url: this.options.url,
                method: 'GET',
                headers: {'Last-Event-ID': self.instance.id},
                success: function (receivedData, status, info) {
                    if (!self.instance) {
                        return;
                    }

                    if (self.instance.successCount++ === 0) {
                        self.onOpen();
                    }

                    var lines = receivedData.split("\n");

                    // Process the return to generate a compatible SSE response
                    self.instance.data = "";
                    var countBreakLine = 0;
                    for (var key in lines) {
                        var separatorPos = lines[key].indexOf(":");
                        var item = [
                            lines[key].substr(0, separatorPos),
                            lines[key].substr(separatorPos + 1)
                        ];
                        switch (item[0]) {
                            // If the first part is empty, needed to check another sequence
                            case "":
                                if (!item[1] && countBreakLine++ === 1) {  // Avoid comments!
                                    var eventMessage = {
                                        data: self.instance.data,
                                        lastEventId: self.instance.id,
                                        origin: 'http://' + info.getResponseHeader('Host'),
                                        returnValue: true
                                    };

                                    // If there are a custom event then call it
                                    if (self.instance.event && self._settings.events[self.instance.event]) {
                                        self._settings.events[self.instance.event](eventMessage);
                                    } else {
                                        self._settings.onMessage(eventMessage);
                                    }
                                    self.instance.data = "";
                                    self.instance.event = "";
                                    countBreakLine = 0;
                                }
                                break;

                                // Define the new retry object;
                            case "retry":
                                countBreakLine = 0;
                                self.instance.retry = parseInt(item[1].trim(), 10);
                                break;

                                // Define the new ID
                            case "id":
                                countBreakLine = 0;
                                self.instance.id = item[1].trim();
                                break;

                                // Define a custom event
                            case "event":
                                countBreakLine = 0;
                                self.instance.event = item[1].trim();
                                break;

                                // Define the data to be processed.
                            case "data":
                                countBreakLine = 0;
                                self.instance.data += (self.instance.data !== "" ? "\n" : "") + item[1].trim();
                                break;

                            default:
                                countBreakLine = 0;
                        }
                    }
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
