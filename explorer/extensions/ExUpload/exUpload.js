function ExUpload(explorer, url, params) {
    var exUpload = {        
        explorerContainer: explorerContainer,
        isAutomaticIdEnabled: false,
        automaticId: 1,
        url: url,
        params: params,
        debugMode: false,
        callback: undefined,
        explorer: explorer,
		allowedExtensions: undefined,
        MSG_INVALID_EXT: "You cannot upload {ext} files here.",
        ERROR_INVALID_FILE: 1,
        start: function () {
            try{
                exUpload.validate();
                exUpload.explorerContainer = exUpload.explorer.container;
                exUpload.handleEvents();
            }catch(e){
                exUpload.log(e);
            }
        },
        validate: function (){
            if(exUpload.params == undefined){
                exUpload.params =  {"fileParam": "file"};
                exUpload.info("uploadParam was not defined, so its default value ('file') will be set.");
            }
            if(exUpload.explorer == undefined || exUpload.explorer.ROOT == undefined){
                throw "ExUpload will not work if you do not set Explorer's instance.";
            }
            if(exUpload.url == undefined){
                throw "ExUpload will not work if you do not set an url.";
            }
        },
        log: function (str) {
            if(exUpload.debugMode){
                console.warn(str);
            }
        },
        info: function (str) {
            if(exUpload.debugMode){
                console.info(str);
            }
        },
        validadeExtension: function (ext){
			if(exUpload.allowedExtensions !== undefined ){
                return exUpload.allowedExtensions.indexOf(ext.toLowerCase()) != -1;
            }
            var extIndex = AVAILABLE_ICON_EXTENSIONS.indexOf(ext.toLowerCase());
            if(extIndex == -1 && AVAILABLE_ICON_EXTENSIONS.indexOf("_".concat(ext.toLowerCase())) == -1){
                return false;
            }
            return true;
        },
        handleEvents: function () {
            var dropArea = document.getElementById(exUpload.explorerContainer.substring(1));
            dropArea.addEventListener('dragenter', function (e) {
                e.currentTarget.classList.add('drop');
            });
            dropArea.addEventListener('dragleave', function (e) {
                e.currentTarget.classList.remove('drop');
            });
            dropArea.addEventListener('dragover', function (e) {
                e.preventDefault();
                e.stopPropagation();
                e.dataTransfer.dropEffect = 'copy';
            });
            dropArea.addEventListener('drop', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var file = e.dataTransfer.files[0];//file to upload
                var ext = file.name.substr(file.name.lastIndexOf('.')+1);
                var num = 100;
                var fakeId = "fake" + num;
                if(exUpload.validadeExtension(ext) == false){
                    var data = {message:  exUpload.MSG_INVALID_EXT.replace("{ext}", "."+ext), error: exUpload.ERROR_INVALID_FILE};
                    if (exUpload.callback != undefined) {
                        exUpload.callback(data, false);
                    }
                    exUpload.log(data);
                    return;
                }
                while (exUpload.explorer.checkIfExists(fakeId) != -1) fakeId = "fake" + (++num);
                var fakeFile = new File(fakeId, file.name, ext, exUpload.explorer.currentParent == -1 ? 0 : exUpload.explorer.currentParent);
                var upload = new exUpload.Upload(file, fakeFile);
                upload.upload(file, fakeFile);
                exUpload.explorer.addFiles(fakeFile); // adding the file to Explorer
            });
        },
		Upload: function (file, fakeFile) {
            var object = {
                fakeFile: fakeFile,
                file: file,
                myXhr: undefined,
                upload: function () {
                    var XHR = new window.XMLHttpRequest();
                    var formData = new FormData();
                    formData.append(exUpload.params.fileParam, object.file);
                    formData.append("dirId", exUpload.explorer.currentParent);
                    // delete exUpload.params.fileParam;
                    for (var paramName in exUpload.params) {
                        if (paramName == "fileParam") {
                            continue;
                        }
                        formData.append(paramName, exUpload.params[paramName]);
                    }
                    $.ajax({
                        url: exUpload.url,  //Server script to process data
                        type: 'POST',
                        xhr: function () {  // Custom XMLHttpRequest
                            object.myXhr = $.ajaxSettings.xhr();
                            if (object.myXhr.upload) { // Check if upload property exists
                                object.myXhr.upload.addEventListener('progress', object.progressEvent, false); // For handling the progress of the upload
                            }
                            return object.myXhr;
                        },
                        beforeSend: function () {
                            object.fakeFile.date = Math.round(new Date() / 1000);
                        },
                        success: function (data) {//retorno do servidor
                            var def = $.Deferred();
                            var fakeFileIndex = exUpload.explorer.checkIfExists(object.fakeFile.id);
                            if (data.id != undefined && data.id != null) {//caso o servidor tenha retornado o id do arquivo upado
                                //altera o id fake para o id retornado do banco no html e na lista de Explorer
                                if(exUpload.isAutomaticIdEnabled){
                                    $("#" + object.fakeFile.id).attr("id", exUpload.automaticId);
                                    exUpload.explorer.fileList[fakeFileIndex].id = exUpload.automaticId;
                                    data.id = exUpload.automaticId++;
                                }else{
                                    $("#" + object.fakeFile.id).attr("id", data.id);
                                    exUpload.explorer.fileList[fakeFileIndex].id = data.id;
                                }
                            } else {
                                data.id = object.fakeFile.id;
                            }
                            def.resolve();
                            $.when(def).then(function () {
                                $("#" + data.id).find(".abortStyle").unbind("mouseover");
                                $("#" + data.id).find(".abortStyle").css("display", "none");
                                $("#" + data.id).removeClass("uploading");
                                setTimeout(function () {
                                    $("#" + data.id).find(".exUpload").fadeOut("slow");
                                }, 2000);
                                if (exUpload.callback != undefined) {
                                    exUpload.callback(data, true);
                                }
                            });
                        },
                        error: function (e) {
                                var errorStyle = $("#" + object.fakeFile.id).find(".errorStyle");
                                var item = $("#" + object.fakeFile.id);
                                item.find(".exUpload").fadeOut("fast");
                                item.find(".abortStyle").fadeOut("fast");
                                errorStyle.fadeIn("slow");
                                errorStyle.on("mouseover", function () {
                                errorStyle.css("cursor", "pointer");
                                errorStyle.prop("title", "Click to Hide");
                                item.find(".errorFont").text("Remove?");
                            })
                            .on("mouseout", function () {
                                $("#" + object.fakeFile.id).find(".errorFont").text("Upload has Failed");
                            })
                            .on("mousedown", function () {
                                $("#" + object.fakeFile.id).fadeOut("slow");
                            });
                            if (exUpload.callback != undefined) {
                                exUpload.callback(e, false);
                            }
                            exUpload.log(e);
                        },
                        data: formData,
                        //Options to tell jQuery not to process data or worry about content-type.
                        cache: false,
                        contentType: false,
                        processData: false,
                        dataType: 'json'
                    });
                },
                createProgressStructure: function (id) {
                    var item = $("#" + id);
                    if (!item.hasClass("uploading")) {
                        item.addClass("uploading");
                    }
                    if (!item.find("#progressBar").length) {
                        item.addClass("uploading");
                        item.append('<div id="progressBar" class="progressBar exUpload"></div>'
                            + '<div id="errorStyle" class="errorStyle"><p class="errorFont">Upload has Failed</p></div>'
                            + '<div id="abortStyle" class="abortStyle"><p class="abortFont">Abort?</p></div>'
                            + '<div style="position:absolute; left:50%; top:0;" class="exUpload">'
                            + '<div class="percentCounterContainer">'
                            + '<span class="percentConcluido" ></span>'
                            + '</div>'
                            + '<span class="uploadSpeed">0 Kbps</span>'
                            + '</div>');
                        item.find(".abortStyle").find(".abortFont").on("mouseup", function () {
                            item.find(".abortStyle").unbind("mouseover");
                            item.find(".abortStyle").css("display", "none");
                            object.myXhr.abort();
                        });
                        item.find(".abortStyle").on("mouseover", function () {
                            item.find(".abortStyle").css("opacity", .8);
                        });
                        item.find(".abortStyle").on("mouseout", function () {
                            item.find(".abortStyle").css("opacity", 0);
                        });
                    }
                },
                progressEvent: function (e) {
                    if (e.lengthComputable) {
                        var item = $("#" + object.fakeFile.id);
                        var spentTime = Math.round(new Date() / 1000) - object.fakeFile.date;
                        object.createProgressStructure(object.fakeFile.id);
                        var percentLoaded = Math.round((e.loaded * 100) / e.total);
                        if (percentLoaded >= 100) {
                            item.find(".uploadSpeed").css("color", "white");
                            item.find("#" + object.fakeFile.id).removeClass("uploading");
                        } else if (percentLoaded >= 50) {
                            item.find(".percentCounterContainer").css("color", "white");
                        } else if (percentLoaded >= 10) {
                            item.find(".uploadSpeed").css("color", "white");
                        }

                        item.find(".percentConcluido").html(percentLoaded + "<span class=\"percentSymbol\">%</span>");
                        item.find(".progressBar").css("height", percentLoaded + "%");
                        item.find(".uploadSpeed").html("^ " + Math.floor((e.loaded / 1024) / spentTime) + " Kbps");
                    }
                }
            }
            return object;
		}
    }
    return exUpload;
}
