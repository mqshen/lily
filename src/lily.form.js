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
