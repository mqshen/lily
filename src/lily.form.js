!function(){

    "use strict";

    var Form = function(element, options) {
        this.$element = $(element)
        this.$submitButton = this.$element.find('[data-toggle^=submit]')
        this.options = $.extend({}, $.fn.form.defaults, options)
        this.$element.validator()
        var self = this
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

        checkData: function() {
            var needConfirm = this.$submitButton.attr("data-confirm");
            if(needConfirm) {
                var r=confirm(needConfirm);
                if (!r) {
                    return false;
                }
            }

            this.oldText = this.$submitButton.text()
            var disableText = this.$submitButton.attr("data-disable-with")
            this.$submitButton.attr("disabled",true)
            if(disableText)
                this.$submitButton.text(disableText)
            var checkResult = this.$element.data('validator').check();
            if(this.options.customerCheck && !this.options.customerCheck()) {
                checkResult.passed = false
            }
            if(!checkResult.passed) {
                this.$submitButton.attr("disabled", false)
                if(disableText)
                    this.$submitButton.text(this.oldText)
                return false;
            }

            return checkResult.requestData
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
                self.resetForm()
            }

            function resetButton() {
                self.$submitButton.attr("disabled", false)
		        if(disableText)
                    self.$submitButton.text(self.oldText)
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
		    this.$submitButton.attr("disabled", false)
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
        ajax: false
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

