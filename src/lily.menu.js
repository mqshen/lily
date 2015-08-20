+function ($) {
  'use strict';

  // COLLAPSE PUBLIC CLASS DEFINITION
  // ================================

  var Menu = function (element, options) {
  }

  Menu.VERSION  = '0.0.1'

  Menu.TRANSITION_DURATION = 350

  Menu.DEFAULTS = {
    toggle: false 
  }

  Menu.prototype.show = function () {
    this.hide()
    this.fire("menu:activate", function() { 
        $(document).on("keydown.menu", i)
        $(document).on("click.menu", r)
        var self = this
        this.performTransition(function() { 
            $(body).addClass("menu-active")
            self.addClass("active")
            self.find(".js-menu-content[aria-hidden]").attr("aria-hidden", "false")
        })
        this.fire("menu:activated", { async: true})
    })
  }

  Menu.prototype.hide = function () {
    this.fire("menu:deactivate", function() { 
        $(document).off(".menu")
        var sefl = this 
        this.performTransition(function() {
            $(body).removeClass("menu-active")
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
      if (!data) $this.data('lily.menu', (data = new Collapse(this, options)))
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
    var target = $(e.target).closest(".js-menu-target");
    e.preventDefault()
    var menu = $(this).data('lily.menu')
    if($.lily.activeMenu === this) {
        $(this).menu('hide')
    } else {
        $(this).menu('show')
    }
  })

  $(document).on("click", ".js-menu-container .js-menu-close", function(e) {
    var target = $(e.target).closest(".js-menu-container");
    e.preventDefault()
    var menu = $(this).data('lily.menu')
    if($.lily.activeMenu === this) {
        target.menu('hide')
    } else {
        target.menu('show')
    }
  }
}(jQuery);
