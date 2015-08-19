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
    
    $.fn.collapse.defaults = {
        loadingText: 'loading...'
    }
    
    $.fn.collapse             = Plugin
    $.fn.collapse.Constructor = Collapse 

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
