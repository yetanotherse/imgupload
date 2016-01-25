( function() {
    CKEDITOR.plugins.add( 'img-upload',
        {
            lang: ['en'],
            init: function( editor )
            {
            	var settings = editor.config.imgUploadConfig.settings;
                var count = 0;
                var $placeholder = $("<div></div>").css({
                    position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: "rgba(20, 20, 20, .6)", padding: 5, color: "#fff"
                }).hide();

            	validation = {
            		required: [
	                    'bucket', 'accessKeyId', 'secretAccessKey', 'region'
	                ],
            	};
            	
            	function loadSDK() {
					var script = document.createElement('script');
	                script.async = 1;
	                script.src = 'https://sdk.amazonaws.com/js/aws-sdk-2.2.32.min.js';
	                document.body.appendChild(script);
            	}
            	
            	var checkRequirement = function(condition, message) {
		            if (!condition)
		                throw Error("Assert failed" + (typeof message !== "undefined" ? ": " + message : ""));
		        };
            	
            	function validateConfig() {
		            var errorTemplate = 'Upload Error: ';
		            
		            checkRequirement(
		                editor.config.hasOwnProperty('imgUploadConfig'),
		                errorTemplate + "Missing required imgUploadConfig in CKEDITOR.config.js"
		            );
		
		            var suppliedKeys = Object.keys(settings);
		            var requiredKeys = validation.required;
		
		            var missing = requiredKeys.filter(function(key) {
		                return suppliedKeys.indexOf(key) < 0;
		            });
		
		            if (missing.length > 0) {
		                throw 'Invalid Config: Missing required keys: ' + missing.join(', ');
		            }
		        }
		        
		        function doNothing(e) { }
		        function orPopError(err) { alert(err.data.error); }
		        
		        function insertImage(href) {
		        	// fix image width before inserting
		        	var width = 600;
		        	var img = new Image();
		        	img.onload = function() {
						if(parseInt(img.width) < 600) {
							width = img.width;
						} else {
							width: width;
						}
			            var elem = editor.document.createElement('img', {
		                attributes: {
		                    src: href,
		                    width: width
		                }
			            });
			            editor.insertElement(elem);
					};       	
		        	img.src = href;
		        }
		        
		        function upload(file) {
		        	count++;
		            AWS.config.update({accessKeyId: settings.accessKeyId, secretAccessKey: settings.secretAccessKey});
		            AWS.config.region = 'us-west-2';		
		            var bucket = new AWS.S3({params: {Bucket: settings.bucket}});
		            var params = {Key: file.name, ContentType: file.type, Body: file, ACL: "public-read"};
		            return new Promise(function(resolve, reject) {
		                bucket.upload(params, function (err, data) {
		                	// update file counter
		                    count--;
                            $placeholder.text(count + editor.lang.img-upload.uploading).toggle(count != 0);
                            // handle success failure
		                    if (!err) resolve(data.Location);
		                    else reject(err);
		                });
		            });
		        };
		        
                function dropHandler(e) {
		            e.preventDefault();
		            $placeholder.show();
		            files = e.dataTransfer.files;
		            $.each(files, function(i, file) {
		            	upload(file).then(insertImage, orPopError);
	            	});
	            	$placeholder.text(count + editor.lang.img-upload.uploading).fadeIn();
		        }
		        
		        validateConfig();
		        loadSDK();
            	                    
                editor.on("instanceReady", function () {
		            // setup progress indicator 
                    var $w = $(editor.window.getFrame().$).parent();
                    $w.css({ position:'relative' });
                    $placeholder.appendTo($w);

                	// drag and drop
                	var iframeBase = document.querySelector('iframe').contentDocument.querySelector('html');
		            var iframeBody = iframeBase.querySelector('body');
		            iframeBody.ondragover = doNothing;
		            iframeBody.ondrop = dropHandler;
		
		            paddingToCenterBody = ((iframeBase.offsetWidth - iframeBody.offsetWidth) / 2) + 'px';
		            iframeBase.style.height = '100%';
		            iframeBase.style.width = '100%';
		            iframeBase.style.overflowX = 'hidden';
		
		            iframeBody.style.height = '100%';
		            iframeBody.style.margin = '0';
		            iframeBody.style.paddingLeft = paddingToCenterBody;
		            iframeBody.style.paddingRight = paddingToCenterBody;
                });

                editor.ui.addButton( 'ImgUpload',
                {
                    label : "ImgUpload",
                    toolbar : 'insert',
                    command : 'img-upload',
                    icon : this.path + 'images/icon.png'
                });

                editor.addCommand( 'img-upload', {
                    exec: function(){
                        $input = $('<input type="file" multiple/>');
                        $input.on("change", function (e) {
                            files = e.target.files;
                            $.each(files, function(i, file) {
                                upload(file).then(insertImage, orPopError);
                            });
                            $placeholder.text(count + editor.lang.img-upload.uploading).fadeIn();
                        });
                        $input.click();
                    }
                });
            }
        });
})();

