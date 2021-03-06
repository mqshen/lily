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

