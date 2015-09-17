/**
 * jQuery file uploader - v1.0
 * auth: shenmq
 * E-mail: mqshen@126.com
 * website: shenmq.github.com
 *
 */
+function ($) {
  'use strict';

  $.ajaxFileUpload = function(url, file, fileUploadCallback, progress) {
        var xhr = new XMLHttpRequest();
        if (xhr.upload ) {

//            if(this.isImage) {
//                var imageReader = new FileReader();
//                imageReader.onload = (function() {
//                    return function(e) {
//                        $image.attr("src", e.target.result)
//                    };
//                })(this.file);
//                imageReader.readAsDataURL(this.file);
//            }

            var dataType = 'json'
            if(progress) {
                xhr.upload.addEventListener("progress",
                    function(e) {
                        progress(e)
                    },
                    false);
            }

            // file received/failed
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    if(xhr.status == 200) {
                        var responseText = xhr.responseText
                        if(dataType === 'json')
                            responseText = $.parseJSON(responseText)
                        fileUploadCallback(responseText)
                    }
                }
            };

            // start upload
            xhr.open("POST", url, true);
            xhr.setRequestHeader("Content-type", file.type)
            xhr.setRequestHeader("X_FILENAME", encodeURIComponent(file.name));
            xhr.setRequestHeader("accept", "application/json")
            xhr.send(file);
        }
    }


}(jQuery);
  

