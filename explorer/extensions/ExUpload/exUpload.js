function ExUpload(explorer, url, params) {
    "use strict";
    var exUpload = {
        explorerContainer: explorerContainer,
        useAutomaticId: false,
        url: url,
        params: params,
        debugMode: false,
        callback: undefined,
        explorer: explorer,
        allowedExtensions: undefined,
        MSG_INVALID_EXT: "{ext} files are not allowed.",
        ERROR_INVALID_FILE: 1,
        ERROR_NO_ID_FOUND: 2,
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
            if(exUpload.params === undefined){
                exUpload.params =  {"fileParam": "file"};
                exUpload.info("uploadParam was not defined, so its default value ('file') will be set.");
            }
            if(exUpload.explorer === undefined || exUpload.explorer.ROOT === undefined){
                throw "ExUpload will not work if you do not set Explorer's instance.";
            }
            if(exUpload.url === undefined){
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
                exUpload.upload(file);
            });
        },
        upload: function (file){
            var ext = file.name.substr(file.name.lastIndexOf('.')+1);
            var fakeId = exUpload.generateFakeId();
            var fakeFile = new File(fakeId, file.name, ext, exUpload.explorer.currentParent == -1 ? 0 : exUpload.explorer.currentParent);
            var uploader = new exUpload.Uploader(file, fakeFile);
            exUpload.explorer.addFiles(fakeFile); // adding the file to Explorer
            if(exUpload.validadeExtension(fakeFile.ext) === false){
                var msg = {message:  exUpload.MSG_INVALID_EXT.replace("{ext}", "."+ext), error: exUpload.ERROR_INVALID_FILE};
                uploader.createProgressStructure(fakeFile.id);
                exUpload.error(msg, fakeFile);
            }else{
                uploader.upload(file, fakeFile);
            }
        },
        generateFakeId: function(){
            var num = 100;
            var fakeId = "fake" + num;
            while (exUpload.explorer.checkIfExists(fakeId) != -1) fakeId = "fake" + (++num);
            return fakeId;
        },
        error: function(msg, fakeFile){
            var errorStyle = $("#" + fakeFile.id).find(".errorStyle");
            var item = $("#" + fakeFile.id);
            item.find(".exUpload").fadeOut("fast");
            item.find(".abortStyle").fadeOut("fast");
            errorStyle.fadeIn("slow");
            errorStyle.on("mouseover", function () {
                errorStyle.css("cursor", "pointer");
                errorStyle.prop("title", "Click to Hide");
                item.find(".errorFont").text("Remove?");
            })
                .on("mouseout", function () {
                    item.find(".errorFont").text("Upload has Failed");
                })
                .on("mousedown", function () {
                    item.fadeOut("slow", function (){
                        var field = exUpload.explorer.getFileById(fakeFile.id).field;
                        let list = exUpload.explorer.fields.fieldList[field].filesOn;
                        exUpload.explorer.fields.fieldList[field].filesOn = $.grep(list, function (val) {
                            return val != fakeFile.id; //remove file from field
                        });
                        if (exUpload.explorer.fields.fieldList[field].filesOn.length === 0) {
                            exUpload.explorer.fields.usedFields -= 1;
                        }
                        exUpload.explorer.fileList = $.grep(exUpload.explorer.fileList, function (val, i) {
                            return val.id != fakeFile.id;//remove file from list
                        });
                        $(this).remove();
                    });

                });
            if (exUpload.callback !== undefined) {
                exUpload.callback(msg, false);
            }
            exUpload.log(msg);
        },
        Uploader: function (file, fakeFile) {
            var object = {
                fakeFile: fakeFile,
                file: file,
                myXhr: undefined,
                upload: function () {
                    //var XHR = new window.XMLHttpRequest();
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
                        beforeSend: function (xhr) {
                            object.fakeFile.date = Math.round(new Date() / 1000);
                        },
                        success: function (data) {//retorno do servidor
                            var def = $.Deferred();
                            var fakeFileIndex = exUpload.explorer.checkIfExists(object.fakeFile.id);
                            if (data.id !== undefined && data.id !== null) {//caso o servidor tenha retornado o id do arquivo upado
                                //altera o id fake para o id retornado do banco no html e na lista de Explorer
                                let fakeId = object.fakeFile.id;
                                console.log(fakeId);
                                $("#" + fakeId).find("#selec_id".concat(fakeId)).attr("id", "selec_id".concat(data.id));
                                $("#" + fakeId).attr("id", data.id);
                                exUpload.explorer.fileList[fakeFileIndex].id = data.id;
                            } else if(exUpload.useAutomaticId){
                                data.id = object.fakeFile.id;
                            }else{
                                var msg = {messages: "Your server did not return any ID, not did you enable the use of automatic id (exUpload.useAutomaticId).", error: exUpload.ERROR_NO_ID_FOUND};
                                if (exUpload.callback !== undefined) {
                                    exUpload.callback(msg, false);
                                }
                                this.error(msg, object.fakeFile);
                                return;
                            }
                            def.resolve();
                            $.when(def).then(function () {
                                var item = $("#" + data.id);
                                item.find(".abortStyle").unbind("mouseover");
                                item.find(".abortStyle").css("display", "none");
                                item.removeClass("uploading");
                                setTimeout(function () {
                                    item.find(".exUpload").fadeOut("slow");
                                }, 2000);
                                if (exUpload.callback !== undefined) {
                                    exUpload.callback(data, true);
                                }
                            });
                        },
                        error: function (e) {
                            exUpload.error(e, object.fakeFile);
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
                    var item = {id: $("#" + id), abortStyle: $("#" + id).find(".abortStyle")};
                    if (!item.id.hasClass("uploading")) {
                        item.id.addClass("uploading");
                    }
                    if (!item.id.find("#progressBar").length) {
                        item.id.append('<div id="progressBar" class="progressBar exUpload"></div>'
                            + '<div id="errorStyle" class="errorStyle"><p class="errorFont">Upload has Failed</p></div>'
                            + '<div id="abortStyle" class="abortStyle"><p class="abortFont">Abort?</p></div>'
                            + '<div style="position:absolute; left:50%; top:0;" class="exUpload">'
                            + '<div class="percentCounterContainer">'
                            + '<span class="percentConcluido" ></span>'
                            + '</div>'
                            + '<span class="uploadSpeed">0 Kbps</span>'
                            + '</div>');
                        item.abortStyle.find(".abortFont").on("mouseup", function () {
                            item.abortStyle.unbind("mouseover");
                            item.abortStyle.css("display", "none");
                            object.myXhr.abort();
                        });
                        item.abortStyle.on("mouseover", function () {
                            item.abortStyle.css("opacity", 0.8);
                        });
                        item.abortStyle.on("mouseout", function () {
                            item.abortStyle.css("opacity", 0);
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
            };
            return object;
        }
    };
    return exUpload;
}