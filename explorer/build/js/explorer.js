(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/**
 * Created by lucas on 11/2/2016.
 */

require('./resources/assets/js/jquery-ui-1.11.4.min.js');

var Explorer = require('./resources/assets/js/explorer.js');
var ExUpload = require('./resources/assets/extensions/ExUpload/exUpload.js');
var File = require('./resources/assets/js/file.js');

module.exports = { Explorer: Explorer, ExUpload: ExUpload, File: File };

},{"./resources/assets/extensions/ExUpload/exUpload.js":2,"./resources/assets/js/explorer.js":3,"./resources/assets/js/file.js":4,"./resources/assets/js/jquery-ui-1.11.4.min.js":5}],2:[function(require,module,exports){
"use strict";

var ExUpload = function ExUpload(explorer, url, params) {
    "use strict";

    var exUpload = {
        explorerContainer: null,
        useAutomaticId: false,
        url: url,
        params: params,
        debugMode: false,
        callback: undefined,
        explorer: explorer,
        allowedExtensions: undefined,
        enabled: true,
        MSG_EXUPLOAD_NOT_ENABLED: "ExUpload is not enabled, thus, you can't upload any file right now.",
        MSG_INVALID_FILE: "{ext} files are not allowed.",
        ERROR_INVALID_FILE: 1,
        ERROR_NO_ID_FOUND: 2,
        ERROR_EXUPLOAD_NOT_ENABLED: 3,
        start: function start() {
            try {
                exUpload.validate();
                exUpload.explorerContainer = exUpload.explorer.container;
                exUpload.handleEvents();
                exUpload.explorer.exUpload = exUpload;
            } catch (e) {
                exUpload.log(e);
            }
        },
        validate: function validate() {
            if (exUpload.params === undefined) {
                exUpload.params = { "fileParam": "file" };
                exUpload.info("uploadParam was not defined, so its default value ('file') will be set.");
            }
            if (exUpload.params.fileParam === undefined) {
                exUpload.params.fileParam = "file";
                exUpload.info("uploadParam was not defined, so its default value ('file') will be set.");
            }
            if (exUpload.explorer === undefined || exUpload.explorer.ROOT === undefined) {
                throw "ExUpload will not work if you do not set Explorer's instance.";
            }
            if (exUpload.url === undefined) {
                throw "ExUpload will not work if you do not set an url.";
            }
        },
        log: function log(str) {
            if (exUpload.debugMode) {
                console.warn(str);
            }
        },
        info: function info(str) {
            if (exUpload.debugMode) {
                console.info(str);
            }
        },
        validadeExtension: function validadeExtension(ext) {
            if (exUpload.allowedExtensions !== undefined) {
                return exUpload.allowedExtensions.indexOf(ext.toLowerCase()) != -1;
            }
            var extIndex = AVAILABLE_ICON_EXTENSIONS.indexOf(ext.toLowerCase());
            if (extIndex == -1 && AVAILABLE_ICON_EXTENSIONS.indexOf("_".concat(ext.toLowerCase())) == -1) {
                return false;
            }
            return true;
        },
        handleEvents: function handleEvents() {
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
                var file = e.dataTransfer.files[0]; //file to upload
                exUpload.upload(file);
            });
        },
        beforeSend: function beforeSend(xhr) {},
        upload: function upload(file) {
            var ext = file.name.substr(file.name.lastIndexOf('.') + 1);
            var fakeId = exUpload.generateFakeId();
            var fakeFile = new File(fakeId, file.name, ext, exUpload.explorer.currentParent == -1 ? 0 : exUpload.explorer.currentParent);
            var uploader = new exUpload.Uploader(file, fakeFile);
            if (!this.enabled) {
                var msg = { message: exUpload.MSG_EXUPLOAD_NOT_ENABLED, error: exUpload.ERROR_EXUPLOAD_NOT_ENABLED };
                uploader.createProgressStructure(fakeFile.id, true);
                exUpload.error(msg, fakeFile);
                return;
            }
            if (exUpload.validadeExtension(fakeFile.ext) === false) {
                var msg = { message: exUpload.MSG_INVALID_FILE.replace("{ext}", "." + ext), error: exUpload.ERROR_INVALID_FILE };
                uploader.createProgressStructure(fakeFile.id, true);
                exUpload.error(msg, fakeFile);
            } else {
                exUpload.explorer.addFiles(fakeFile); // adding the file to Explorer
                uploader.fileIndex = exUpload.explorer.checkIfExists(fakeFile.id);
                uploader.upload();
            }
        },
        generateFakeId: function generateFakeId() {
            var num = 100;
            var fakeId = "fake" + num;
            while (exUpload.explorer.checkIfExists(fakeId) != -1) {
                fakeId = "fake" + ++num;
            }return fakeId;
        },
        error: function error(msg, fakeFile) {
            var errorStyle = $("#" + fakeFile.id).find(".errorStyle");
            var item = $("#" + fakeFile.id);
            item.find(".exUpload").fadeOut("fast");
            item.find(".abortStyle").fadeOut("fast");
            errorStyle.fadeIn("slow");
            errorStyle.on("mouseover", function () {
                errorStyle.css("cursor", "pointer");
                errorStyle.prop("title", "Click to Hide");
                item.find(".errorFont").text("Remove?");
            }).on("mouseout", function () {
                item.find(".errorFont").text("Upload has Failed!");
            }).on("mousedown", function () {
                item.fadeOut("slow", function () {
                    var field = exUpload.explorer.getFileById(fakeFile.id).field;
                    var list = exUpload.explorer.fields.fieldList[field].filesOn;
                    exUpload.explorer.fields.fieldList[field].filesOn = $.grep(list, function (val) {
                        return val != fakeFile.id; //remove file from field
                    });
                    if (exUpload.explorer.fields.fieldList[field].filesOn.length === 0) {
                        exUpload.explorer.fields.usedFields -= 1;
                    }
                    exUpload.explorer.fileList = $.grep(exUpload.explorer.fileList, function (val, i) {
                        return val.id != fakeFile.id; //remove file from list
                    });
                    $(this).remove();
                });
            });
            if (exUpload.callback !== undefined) {
                exUpload.callback(msg, false);
            }
            exUpload.log(msg);
        },
        Uploader: function Uploader(file, fakeFile) {
            var object = {
                fakeFile: fakeFile,
                file: file,
                fileIndex: null,
                myXhr: undefined,
                upload: function upload() {
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
                        url: exUpload.url, //Server script to process data
                        type: 'POST',
                        xhr: function xhr() {
                            // Custom XMLHttpRequest
                            object.myXhr = $.ajaxSettings.xhr();
                            if (object.myXhr.upload) {
                                // Check if upload property exists
                                object.myXhr.upload.addEventListener('progress', object.progressEvent, false); // For handling the progress of the upload
                            }
                            return object.myXhr;
                        },
                        beforeSend: function beforeSend(xhr) {
                            exUpload.beforeSend(xhr);
                            //it will be usefull to restore file state
                            object.updateFileState(true, 0, false, 0);
                            object.fakeFile.date = Math.round(new Date() / 1000);
                            exUpload.explorer.fileList[object.fileIndex].uploader = object;
                        },
                        success: function success(data) {
                            //retorno do servidor
                            var def = $.Deferred();
                            var fakeFileIndex = exUpload.explorer.checkIfExists(object.fakeFile.id);
                            if (data.id !== undefined && data.id !== null) {
                                //caso o servidor tenha retornado o id do arquivo upado
                                //altera o id fake para o id retornado do banco no html e na lista de Explorer
                                var fakeId = object.fakeFile.id;
                                $("#" + fakeId).find("#selec_id".concat(fakeId)).attr("id", "selec_id".concat(data.id));
                                $("#" + fakeId).attr("id", data.id);
                                exUpload.explorer.fileList[fakeFileIndex].id = data.id;
                            } else if (exUpload.useAutomaticId) {
                                data.id = object.fakeFile.id;
                            } else {
                                var msg = { messages: "Your server did not return any ID, not did you enable the use of automatic id (exUpload.useAutomaticId).", error: exUpload.ERROR_NO_ID_FOUND };
                                if (exUpload.callback !== undefined) {
                                    exUpload.callback(msg, false);
                                }
                                this.error(msg, object.fakeFile);
                                return;
                            }
                            object.updateFileState(false, 100, false);
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
                        error: function error(e) {
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
                createProgressStructure: function createProgressStructure(id, invalidExtension) {
                    var resizeInterval = null;
                    var item = { id: $("#" + id), abortStyle: null };
                    var hide = invalidExtension === true || exUpload.explorer.fileList[object.fileIndex].uploadFailed === true || exUpload.explorer.fileList[object.fileIndex].uploading === false ? " displayNone " : "";
                    if (!item.id.hasClass("uploading")) {
                        item.id.addClass("uploading");
                    }
                    if (!item.id.find("#progressBar").length) {
                        item.id.append('<div id="progressBar" class="progressBar exUpload' + hide + '"></div>' + '<div id="errorStyle" class="errorStyle"><p class="errorFont">Upload has Failed</p></div>' + '<div id="abortStyle" class="abortStyle' + hide + '"><p class="abortFont">Abort?</p></div>' + '<div style="position:absolute; left:50%; top:0;" class="exUpload' + hide + '">' + '<div class="percentCounterContainer' + hide + '">' + '<span class="percentConcluido" ></span>' + '</div>' + '<span class="uploadSpeed' + hide + '">0 Kbps</span>' + '</div>');
                        item.abortStyle = $("#" + id).find(".abortStyle");
                        item.abortStyle.find("p").prop("title", "Abort the upload of " + this.file.name);
                        item.abortStyle.find(".abortFont").on("click", function () {
                            item.abortStyle.unbind("mouseover");
                            item.abortStyle.css("display", "none");
                            object.myXhr.abort();
                            exUpload.explorer.fileList[object.fileIndex].uploadFailed = true; //update file state
                        });
                        item.abortStyle.on("mouseover", function () {
                            item.abortStyle.css("opacity", 0.8);
                        });
                        item.abortStyle.on("mouseout", function () {
                            item.abortStyle.css("opacity", 0);
                        });
                        $(window).resize(function () {
                            clearTimeout(resizeInterval); //little trick to resize Explorer only after resizing get done.
                            resizeInterval = setTimeout(function () {
                                object.progressEvent({ lengthComputable: null }, true);
                            }, 5);
                            //object.progressEvent({lengthComputable: null}, true);
                        });
                    }
                },
                progressEvent: function progressEvent(e, resizing) {
                    if (e.lengthComputable || resizing) {
                        var item = $("#" + object.fakeFile.id);
                        var percentLoaded = null,
                            speed = null;
                        var spentTime = Math.round(new Date() / 1000) - object.fakeFile.date;
                        object.createProgressStructure(object.fakeFile.id);
                        if (resizing) {
                            percentLoaded = exUpload.explorer.fileList[object.fileIndex].progress;
                            speed = exUpload.explorer.fileList[object.fileIndex].speed;
                            if (exUpload.explorer.fileList[object.fileIndex].uploadFailed) {
                                item.abortStyle = $("#" + object.fakeFile.id).find(".abortStyle");
                                item.abortStyle.unbind("mouseover");
                                item.abortStyle.css("display", "none");
                                exUpload.error("error", object.fakeFile);
                            }
                        } else {
                            speed = Math.floor(e.loaded / 1024 / spentTime);
                            percentLoaded = Math.round(e.loaded * 100 / e.total);
                        }
                        if (percentLoaded >= 100) {
                            item.find(".uploadSpeed").css("color", "white");
                            item.removeClass("uploading");
                        } else if (percentLoaded >= 50) {
                            item.find(".percentCounterContainer").css("color", "white");
                        } else if (percentLoaded >= 10) {
                            item.find(".uploadSpeed").css("color", "white");
                        }
                        object.updateFileState(percentLoaded != 100, percentLoaded, null, speed);
                        item.find(".percentConcluido").html(percentLoaded + "<span class=\"percentSymbol\">%</span>");
                        item.find(".progressBar").css("height", percentLoaded + "%");
                        item.find(".uploadSpeed").html("^ " + speed + " Kbps");
                    }
                },
                updateFileState: function updateFileState(uploading, progress, uploadFailed, speed) {
                    if (notNull(uploading)) {
                        exUpload.explorer.fileList[object.fileIndex].uploading = uploading;
                    }
                    if (notNull(uploadFailed)) {
                        exUpload.explorer.fileList[object.fileIndex].uploadFailed = uploadFailed;
                    }
                    if (notNull(progress)) {
                        exUpload.explorer.fileList[object.fileIndex].progress = progress;
                    }
                    if (notNull(progress)) {
                        exUpload.explorer.fileList[object.fileIndex].speed = speed;
                    }
                }
            };
            return object;
        }
    };
    return exUpload;
};
module.exports = ExUpload;

},{}],3:[function(require,module,exports){
"use strict";

var _file4 = require("./file.js");

var _file5 = _interopRequireDefault(_file4);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//METRO-EXPLORER_CODE
var Explorer = function Explorer(width, height, container, position, fileList) {
    "use strict";

    var explorer = {
        POSITION_LEFT: 1,
        POSITION_CENTER: 2,
        POSITION_RIGHT: 3,
        LANG_LBL_NEW_FOLDER: "New Folder",
        LANG_LBL_UPLOAD: "Upload a File",
        LANG_LBL_MOVE: "Move to",
        LANG_LBL_MOVE_ALL: "Move All to",
        LANG_LBL_DEL: "Delete",
        LANG_LBL_DEL_ALL: "Delete All",
        LANG_LBL_SHARE: "Share",
        LANG_LBL_SHARE_ALL: "Share All",
        LANG_LBL_DOWNLOAD: "Download",
        LANG_LBL_DOWNLOAD_ALL: "Download All",
        LANG_LBL_OPEN: "Open",
        LANG_LBL_RENAME: "Rename",
        LANG_LBL_UP: "Up",
        LANG_LBL_MOVE_HEADER: "Which folder would like to move your files to?",
        LANG_LBL_MOVE_BT_MOVE: "Move",
        LANG_LBL_MOVE_BT_MOVE_TITLE: "It will move your file(s)/folder(s) to the selected folder.",
        LANG_LBL_MOVE_FOLDER_ERROR_MSG: "You cannot move {folderName} to its sub folder.",
        LANG_LBL_NEW_FOLDER_HEADER: "Create a new Folder",
        LANG_LBL_NEW_FOLDER_FOLDER_NAME: "Folder:",
        LANG_LBL_NEW_FOLDER_BT_CREATE: "Create",
        LANG_LBL_ROOT_FOLDER: "Root",
        LANG_LBL_EMPTY_MESSAGE: "Drag and drop a file over here to start uploading. :)",
        LANG_LBL_NO_FOLDERS_FOUND: "There are no folders where you can move your files to. :/",
        TEMP_VAR: undefined,
        EVENT_DROP: 1, EVENT_RENAME: 2,
        ENABLED: 0, HIDDEN: 1, DISABLED: 2,
        CONTEXT_MENU_OPTIONS: { DOWNLOAD: 0, DOWNLOAD_ALL: 0, UPLOAD: 0, UPLOAD_ALL: 0, MOVE: 0, MOVE_ALL: 0,
            DELETE: 0, DELETE_ALL: 0, SHARE: 0, SHARE_ALL: 0, RENAME: 0, NEW_FOLDER: 0, OPEN: 0 },
        DOWNLOAD: 0, DOWNLOAD_ALL: 1, UPLOAD: 2, UPLOAD_ALL: 3, MOVE: 4, MOVEL_ALL: 5, DELETE: 6, DELETE_ALL: 7,
        SHARE: 8, SHARE_ALL: 9, RENAME: 10, NEW_FOLDER: 11, OPEN: 12,
        ROOT: 0,
        GO_UP_ID: -1,
        baseDialogEffect: "fade",
        debugMode: false,
        container: container === undefined ? "#explorerContainer" : container,
        element: "#explorer",
        fields: { "fieldList": [], "usedFields": 0 },
        width: width === undefined ? 800 : width,
        height: height === undefined ? 600 : height,
        position: position === undefined ? 2 : position, //center, by default
        cssPosition: "relative",
        fileList: fileList === undefined ? [] : fileList,
        fileUpdateEvent: "fileUpdateEvent",
        border: "0px solid gray",
        language: undefined,
        currentPath: [],
        top: 0,
        left: 0,
        selectedFiles: [],
        started: false,
        browserContextMenuDisabled: true, //Browser Context Menu must be disabled to make everything works fine
        currentParent: 0,
        availableIconExtensions: null,
        iconsBackgroundColor: "#00ABA9",
        baseDialogId: ".baseDialog",
        iconPaths: [],
        preloadIcons: true,
        multiSelect: true,
        exUpload: null,
        customOptionId: 0,
        closeBaseDialogOnEsc: true,
        styleFile: null,
        explorerRootFolder: null,
        addFiles: function addFiles(param, resize, def) {
            if (!window.AVAILABLE_ICON_EXTENSIONS) {
                window.AVAILABLE_ICON_EXTENSIONS = explorer.getAvailableIconExtensions();
            }
            var listfilesWithField = [],
                listfilesWithoutAField = [];
            if ($("#emptyMessage").length) {
                $("#emptyMessage").fadeOut("fast");
            }
            if (param === undefined) {
                explorer.log("You are passing an undefined parameter to addFiles()");
                return;
            }
            if ($.isArray(param)) {
                $.each(param, function (i, file) {
                    explorer.addFiles(file);
                });
                return;
            }
            if (explorer.checkIfContainerExist() === false) {
                return;
            }
            if (!explorer.started) {
                $(explorer.element).css("display", "none");
            }
            if ($.isNumeric(param)) {
                //if it is going to open a folder
                var parentId = param;
                if (explorer.currentParent == parentId && resize !== true) {
                    return;
                }
                explorer.fields.fieldList = [];
                explorer.fields.usedFields = 0;
                //console.log($(".file, .field"));
                $(explorer.element).find(".file, .field").remove();
                explorer.currentParent = parentId;
                explorer.createQuickFolderAccess(parentId);
                if (parentId !== 0) {
                    //if it is not the root, create a link to go back to its parent
                    explorer.createUpButton(parentId);
                }
            } else {
                //if it is an object
                var file = param;
                var index = explorer.checkIfExists(file.id);
                if (index != -1 && file.found === undefined) {
                    //&& explorer.fileList[index].name != file.name){
                    explorer.log("Explorer already has a file/folder with this id (" + file.id + "). '" + file.name + "' will not be added to the fileList.");
                    return;
                } else if (index == -1) {
                    //add to fileList
                    explorer.fileList.push(file);
                }
                if (file.found !== undefined) {
                    explorer.createFieldsIfNecessary(file);
                    explorer.placeFileAutomatically(file);
                    return;
                }
            }

            $.each(explorer.fileList, function (i, file) {
                var index = explorer.checkIfExists(file.id);
                if (file.parent != explorer.currentParent) {
                    //If it is not in the same folder that the file was uploaded to,
                    // do not show it on the screen
                    explorer.fileList[index].placed = false;
                    return;
                }
                if (file.placed && resize !== true) {
                    return;
                }
                explorer.createFieldsIfNecessary(file);
                if (explorer.fields.fieldList[file.field] === undefined && file.field != -1) {
                    explorer.log(file.name + "'s field does not exist. It will be placed on an existing free field. " + "Make sure you are running createFields(number_of_fields); with enough number of fields to place '" + file.name + "' on.");
                }
                if (file.field != -1) {
                    //load files on each list
                    listfilesWithField.push(file);
                } else {
                    listfilesWithoutAField.push(file);
                }
                // if(file.field !== undefined && file.field != -1 && explorer.fields.fieldList[file.field] !== undefined){

                //  }else{
                //      explorer.placeFileAutomatically(file);
                //  }
                index = explorer.checkIfExists(file.id);
                explorer.fileList[index].placed = true; //field's index
                if (explorer.fileList[index].uploading === true) {
                    explorer.fileList[index].uploader.fileIndex = index;
                    explorer.fileList[index].uploader.createProgressStructure(file.id);
                    explorer.fileList[index].uploader.progressEvent({ lengthComputable: null }, true);
                }
            });
            $.each(listfilesWithField, function (i, file) {
                //first load files that already have a field
                explorer.placeFileWithField(file, resize);
            });
            $.each(listfilesWithoutAField, function (i, file) {
                //then, load files which does not have a field (-1)
                explorer.placeFileAutomatically(file);
            });
            explorer.initMouseOverEvent();
            if (def !== undefined) {
                def.resolve();
            }
        },
        placeFileWithField: function placeFileWithField(file, resize) {
            var top = explorer.fields.fieldList[file.field].top + 5 + "px;";
            var left = explorer.fields.fieldList[file.field].left + 5 + "px;";
            $(explorer.element).append("<div id='" + file.id + "' class='file fileButton draggable displayNone' style='position: absolute; top:" + top + "left:" + left + "'> <div class='center iconBorder'><div class='" + file.getIcon() + " center'></div></div> " + "<div id='input" + file.id + "' style='display:inline-block; position:relative;' title='" + file.name + "'> " + "<input class='txtcenter ft11 inputFileName'" + "maxlength='30' readonly='readonly' title='" + file.name + "' value='" + file.getName().replace(/'/g, "&apos;") + "'/>" + "<div style='position:absolute; left:0; right:0; top:0; bottom:0;'></div></div> <div id='selec_id" + file.id + "' class='opacity4'> </div> <div class=\"moveToTooltip\">Move to</div>" + "</div>");
            explorer.fields.fieldList[file.field].filesOn.push(file.id);
            var field = explorer.fields.fieldList[file.field];
            file.getElement().css("top", (field.filesOn.length > 1 ? field.top + 5 - (field.filesOn.length - 1) * 3 : field.top + 5) + "px");
            file.getElement().css("left", (field.filesOn.length > 1 ? field.left + 5 + (field.filesOn.length - 1) * 3 : field.left + 5) + "px");
            if (resize === true) {
                file.getElement().css("display", "block");
            } else {
                file.getElement().fadeIn(300);
            }
            explorer.fields.usedFields++;
            explorer.loadFileEvents(file);
        },
        placeFileAutomatically: function placeFileAutomatically(file, resize) {
            for (var x = 0; x < explorer.fields.fieldList.length; x++) {
                if (explorer.fields.fieldList[x].filesOn.length === 0) {
                    var top = explorer.fields.fieldList[x].top + 5 + "px;";
                    var left = explorer.fields.fieldList[x].left + 5 + "px;";
                    $(explorer.element).append("<div id='" + file.id + "' class='file fileButton draggable displayNone' style='position: absolute; top:" + top + "left:" + left + "'> <div class='center iconBorder'><div class='" + file.getIcon() + " center'></div></div>" + "<div id='input" + file.id + "' style='display:inline-block; position:relative;' title='" + file.name + "'> " + "<input class='txtcenter ft11 inputFileName' " + "maxlength='30' readonly='readonly' title='" + file.name + "' value='" + file.getName().replace(/'/g, "&apos;") + "' />" + "<div style='position:absolute; left:0; right:0; top:0; bottom:0;'></div></div> <div id='selec_id" + file.id + "' class='opacity4'> </div> <div class=\"moveToTooltip\">Move to</div>" + "</div>");
                    if (resize === true) {
                        file.getElement().css("display", "block");
                    } else {
                        file.getElement().fadeIn(300);
                    }
                    explorer.fields.fieldList[x].filesOn.push(file.id);
                    explorer.fields.usedFields++;
                    var index = explorer.checkIfExists(file.id);
                    if (!file.found) {
                        explorer.fileList[index].field = x; //field's index
                    }
                    explorer.loadFileEvents(file);
                    break;
                }
            }
        },
        createFieldsIfNecessary: function createFieldsIfNecessary(file) {
            //add new fields, if necessary
            if (file.field == -1) {
                if (explorer.fields.fieldList.length <= explorer.fileList.length) {
                    explorer.createFields(1);
                }
            } else if (file.field > explorer.fields.fieldList.length - 1) {
                explorer.createFields(file.field - explorer.fields.fieldList.length + 1);
            }
            if (explorer.fields.fieldList.length - explorer.fileList.length < 2) {
                explorer.createFields(1);
            }
        },
        createUpButton: function createUpButton(parentId) {
            explorer.createFields(1, true);
            var grandpaId = $.grep(explorer.fileList, function (e) {
                return e.id == parentId;
            });
            $(explorer.element).append("<div id='goup' class='file fileButton' style='float:left; top: 5px; left: 5px; position: absolute'>" + "<div class='center iconBorder'><div class='goUp center'></div></div><br /><p class='txtcenter ft11'>" + explorer.LANG_LBL_UP + "</p></div>");
            $("#goup").on("click", function () {
                $(".file").fadeOut("slow");
                explorer.hide([".contextMenuFile", ".contextMenuFolder", ".contextMenuVoid"]);
                setTimeout(function () {
                    explorer.addFiles(grandpaId[0].parent);
                }, 200);
                setTimeout(function () {
                    $(".file").fadeIn("fast");
                }, 250);
            });
        },
        loadFileEvents: function loadFileEvents(file) {
            var fileElem = file.getElement();
            //rename event
            fileElem.find("input").on("blur", function (e) {
                explorer.rename(file, true);
            });
            //double click event
            fileElem.dblclick(function () {
                explorer.dbclick(file);
            });
            //Add click event
            fileElem.on("mousedown", function (e) {
                $(document).trigger("contextMenuEvent", { event: e, file: file });
                if (!$(e.target).is('._selected') && e.which == 3 || !explorer.multiSelect) {
                    //if it was not selected and it is a right click,
                    explorer.selectedFiles = []; //clean the list to add a new one
                    $("._selected").removeClass('_selected');
                    $(".file").css("border", "1px solid darkgray");
                }
                var result = $.grep(explorer.selectedFiles, function (e) {
                    return e.id == file.id;
                }); //check if this file is already in the list
                if (result.length === 0) {
                    //if not, add it
                    explorer.selectedFiles.push(file);
                }
                if ($(e.currentTarget).hasClass("uploading")) {
                    //if it is uploading, does not handle any event
                    return;
                }
                if (e.which == 1) {
                    //check if it is a left click
                    explorer.hide([".contextMenuFile", ".contextMenuFolder", "#contextIdTools"]);
                    if (!$(e.target).is('._selected') && fileElem.find("input").is('[readonly]') && !$(e.target).is(".errorStyle, .errorFont")) {
                        //if it is not selected, add selected class
                        fileElem.css("border", "1px solid blue");
                        fileElem.find("#selec_id" + file.id).addClass("_selected");
                    }
                } else if (e.which == 3) {
                    //create a contextMenu
                    $("#contextMenu4Files").css("top", e.pageY - 5 + "px");
                    $("#contextMenu4Files").css("left", e.pageX - 5 + "px");
                    explorer.showContextMenu(file); //Create a new Context Menu to this file
                }
            });
            explorer.initDraggable();
        },
        checkIfExists: function checkIfExists(id) {
            for (var i = 0; i < explorer.fileList.length; i++) {
                if (explorer.fileList[i].id == id) {
                    return i;
                }
            }
            return -1;
        },
        createFields: function createFields(numberFields, isGoUp) {
            var fileDivWidth = 130;
            var fileDivHeight = 150;
            var fieldListSize = explorer.fields.fieldList.length;
            var filePerLine = parseInt(explorer.getExplorerCurrentWidth() / fileDivWidth);

            var _loop = function _loop(x) {
                // var create = (function () {//necessary to fix js escope problems :/ 'Let' keyword would solve this problem :S
                var field = new Field(x, $("<div id='field_" + x + "' class='field' style='top:" + (parseInt(x / filePerLine) * fileDivHeight + 8) + "px; left: " + parseInt(x % filePerLine) * fileDivWidth + "px;'/>"), [], parseInt(x / filePerLine) * fileDivHeight, parseInt(x % filePerLine) * fileDivWidth);
                $(explorer.element).append(field.element);
                field.element.droppable({
                    drop: function drop(event, ui) {
                        field.element.css("border-width", "0px");
                        var file = explorer.getFileById(ui.draggable[0].id);
                        var topFile = field.filesOn[field.filesOn.length - 1];
                        file.getElement().find(".moveToTooltip").fadeOut();
                        if (topFile == explorer.GO_UP_ID) {
                            //move to parent's folder
                            explorer.selectedFiles = [file];
                            var parent = explorer.getFileById(explorer.currentParent);
                            explorer.clientMove(parent.parent, true);
                            return;
                        } else {
                            //move to this folder
                            topFile = explorer.getFileById(topFile);
                            if (topFile && topFile.ext == "dir" && topFile.id != file.id) {
                                //move it to this folder
                                explorer.selectedFiles = [file];
                                explorer.clientMove(topFile.id);
                                return;
                            }
                        } //if the top file is not a folder, place it on the top
                        if ($.inArray(file.id, field.filesOn) == -1) {
                            //do not repeat files on the field...
                            field.filesOn.push(Number(file.id));
                            var index = explorer.checkIfExists(file.id);
                            explorer.fileList[index].field = field.fieldNumber(); //update file field
                        }
                        $(field.element).trigger("fileUpdateEvent", [{ "file": file }, explorer.EVENT_DROP]); //fire event
                        file.getElement().animate({ //organize stack of files
                            left: field.filesOn.length > 1 ? field.left + 5 + (field.filesOn.length - 1) * 3 : field.left + 5,
                            top: field.filesOn.length > 1 ? field.top + 5 - (field.filesOn.length - 1) * 3 : field.top + 5
                        }, { //it's an animate's method
                            start: function start(e) {
                                $("#" + e.elem.id).css("z-index", field.filesOn.length * 20); //make sure it will be visible
                            }
                        }, 300);
                    },
                    out: function out(event, ui) {
                        field.element.css("border-width", "0px");
                        field.filesOn = $.grep(field.filesOn, function (val, index) {
                            return val != ui.draggable[0].id;
                        });
                        if (field.filesOn.length === 0) {
                            explorer.fields.usedFields -= 1;
                        }
                    },
                    over: function over(event, ui) {
                        field.element.css("border-width", "1px");
                        var topFile = field.filesOn[field.filesOn.length - 1];
                        var file = explorer.getFileById(ui.draggable[0].id);
                        if (topFile == explorer.GO_UP_ID) {
                            //if it is goUp, do not try to get the most on top file.
                            var parent = explorer.getFileById(explorer.currentParent);
                            var parentName = parent.parent == explorer.ROOT ? "Root" : explorer.getFileById(parent.parent).name;
                            //file.getElement().find(".moveToTooltip").html("<span style='color: #101973'>Move to <b>"+parent.name+"</b> parent folder</span> (".concat(parentName+")")).fadeIn();
                            file.getElement().find(".moveToTooltip").html("<span style='color: #101973'>Move to ".concat(parentName)).fadeIn();
                        } else {
                            topFile = explorer.getFileById(topFile);
                            if (topFile && topFile.ext == "dir" && topFile.id != file.id) {
                                //if it is a folder
                                file.getElement().find(".moveToTooltip").html("<span style='color: #101973'>Move to</span> ".concat(topFile.name)).fadeIn();
                            } else {
                                file.getElement().find(".moveToTooltip").fadeOut();
                            }
                        }
                    }
                });
                explorer.fields.fieldList.push(field);
                if (isGoUp === true) {
                    explorer.fields.fieldList[0].filesOn = [explorer.GO_UP_ID];
                }
                //});
                // create();
            };

            for (var x = fieldListSize; x < fieldListSize + numberFields; x++) {
                _loop(x);
            }
        },
        getFileById: function getFileById(id) {
            return explorer.fileList[explorer.checkIfExists(id)];
        },
        getSelectedFiles: function getSelectedFiles() {
            return explorer.selectedFiles;
        },
        disableBrowserContextMenu: function disableBrowserContextMenu() {
            if (explorer.browserContextMenuDisabled) {
                $(document).ready(function () {
                    $(document).bind("contextmenu", function (e) {
                        e.preventDefault();
                    });
                });
            }
        },
        initDraggable: function initDraggable() {
            $(".draggable").draggable({
                cursor: "move",
                revert: "invalid",
                start: function start(event, ui) {
                    $("#" + ui.helper[0].id).css("z-index", "9000");
                }
            });
        },
        hide: function hide(elements) {
            $.each(elements, function (i, element) {
                $(element).css("display", "none");
            });
        },
        setExplorerPosition: function setExplorerPosition() {
            var height = explorer.getExplorerCurrentHeight();
            var width = explorer.getExplorerCurrentWidth();

            if (explorer.position == explorer.POSITION_CENTER) {
                var left = $(explorer.container).parent().width() / 2 - width / 2 + explorer.left;
                left = left < 0 ? 0 : left;
                $(explorer.container).css("left", left + "px");
                $(explorer.container).css("top", explorer.top + "px");
            } else if (explorer.position == explorer.POSITION_LEFT) {
                $(explorer.container).css("left", explorer.left + "px");
                $(explorer.container).css("top", explorer.top + "px");
            } else if (explorer.position == explorer.POSITION_RIGHT) {
                $(explorer.container).css("left", $(explorer.container).parent().width() - width + explorer.left + "px");
                $(explorer.container).css("top", explorer.top + "px");
            }
            $(explorer.container).css({ "position": explorer.cssPosition, "width": width + "px", "height": height + "px", "min-width": "150px", "min-height": "170px", "border": explorer.border });
            $(explorer.element).css({ "width": "100%", "height": "90%", "overflow-y": "auto", "overflow-x": "hidden", "position": "relative" });
        },
        getExplorerCurrentHeight: function getExplorerCurrentHeight() {
            var height = null;
            if (explorer.height > $(window).height()) {
                height = $(window).height() - 50;
                explorer.log("The height you have set is higher than screen's height, so we have now set Explorer's height to " + ($(window).height() - 50));
            } else {
                height = explorer.height;
            }
            return height;
        },
        getExplorerCurrentWidth: function getExplorerCurrentWidth() {
            //Explorer will have diferent dimension depend on browser window size. To get original size, access it directly (eg. explorer.height)
            var width = null;
            if (explorer.width > $(window).width()) {
                width = $(window).width() - 20;
                explorer.log("The width you have set is larger than screen's width, so we have now set Explorer's width to " + $(window).width());
            } else {
                width = explorer.width;
            }
            return width;
        },
        createQuickFolderAccess: function createQuickFolderAccess(stopAt) {
            var currentPath = [];
            var quickAccess = $("#quickAccess");
            if (!$("#quickAccess").length) {
                $(explorer.container).prepend("<div id='quickAccess' style='width: auto; height: 20px; position: relative;' style='margin-left: 10px;'></div>");
            } else {
                $("#quickAccess").empty();
            }
            $("#quickAccess").append("<span id='quick_root' class='text-small bold handCursor quickAccessLink' style='margin-bottom: 10px; margin-left: 10px;'>/ </span>");
            $("#quick_root").on("click", function () {
                explorer.addFiles(0);
            });
            $.each(explorer.currentPath, function (i, item) {
                // for(var item of explorer.currentPath){
                if (stopAt === 0) {
                    return false;
                } else if (item.id != stopAt) {
                    currentPath.push(item);
                } else {
                    currentPath.push(item);
                    return false;
                }
            });
            $.each(currentPath, function (i, item) {
                $("#quickAccess").append("<span id='quick_" + item.id + "'class='text-small bold handCursor quickAccessLink'>" + item.name + "/</span> ");
                $("#quick_" + item.id).on("click", function () {
                    explorer.addFiles(item.id);
                });
            });
            explorer.currentPath = currentPath;
        },
        initContextMenuEvent: function initContextMenuEvent(e) {
            //create contextMenuVoid
            $("#contextIdTools").remove();
            $("body").append("<div id='contextIdTools'" + "class='opacity9 txtmargin contextMenuVoid gray ft12 bold displayNone'>" + explorer.loadContextMenuOption(explorer.NEW_FOLDER, explorer.CONTEXT_MENU_OPTIONS.NEW_FOLDER, false) + explorer.loadContextMenuOption(explorer.UPLOAD, explorer.CONTEXT_MENU_OPTIONS.UPLOAD, false) + explorer.customMenuOption() + "</div>");
            $("#expNewFolder").on("click", function () {
                explorer.newFolder();
            });
            $("#expUpload").on("click", function () {
                explorer.upload();
            });
            //If the user clicks on the void
            $(document).on("mousedown", function (event) {
                if ($(event.target).is('.field,#explorer,#quickAccess')) {
                    explorer.hide([".contextMenuFile", ".contextMenuFolder", ".contextMenuVoid"]);
                    $(".file").css("border", "1px solid darkgray");
                    $("._selected").removeClass("_selected");
                    explorer.selectedFiles = [];
                    if (event.which == 3 && ($(event.target).is(explorer.element) || $(event.target).is(".field")) && (explorer.CONTEXT_MENU_OPTIONS.NEW_FOLDER != explorer.HIDDEN || explorer.CONTEXT_MENU_OPTIONS.UPLOAD != explorer.HIDDEN)) {
                        $("#contextIdTools").css("top", event.pageY - 5 + "px");
                        $("#contextIdTools").css("left", event.pageX - 5 + "px");
                        explorer.showContextMenu("void");
                    }
                }
            });
            $(".contextMenuOption").on("click", function () {
                if (isNotDisabled(this)) {
                    $("#contextIdTools").fadeOut("fast");
                }
            });
            //create contextMenu for files
            $("body").append("<div id='contextMenu4Files' style='position:absolute;' class='displayNone'> </div>");
        },
        initMouseOverEvent: function initMouseOverEvent() {
            $(".fileButton").mouseover(function (event) {
                if (document.getElementById(this.id).style.border.indexOf("blue") == -1) {
                    $(this).css("border", "1px solid yellow");
                }
            }).mouseout(function () {
                if (document.getElementById(this.id).style.border.indexOf("blue") == -1) {
                    $(this).css("border", "1px solid darkgray");
                }
            });
        },
        setLanguage: function setLanguage(language) {
            this.language = language;
            this.loadLanguage();
        },
        loadLanguage: function loadLanguage() {
            var patt = /\.json$/i;
            var language = explorer.language;
            if (patt.test(language) === true) {
                //if it is a json file, load it
                $.get(language, function (data) {
                    explorer.LANG_LBL_NEW_FOLDER = explorer.loadLanguageCheckIfDefined(data.LANG_LBL_NEW_FOLDER, explorer.LANG_LBL_NEW_FOLDER);
                    explorer.LANG_LBL_UPLOAD = explorer.loadLanguageCheckIfDefined(data.LANG_LBL_UPLOAD, explorer.LANG_LBL_UPLOAD);
                    explorer.LANG_LBL_MOVE = explorer.loadLanguageCheckIfDefined(data.LANG_LBL_MOVE, explorer.LANG_LBL_MOVE);
                    explorer.LANG_LBL_MOVE_ALL = explorer.loadLanguageCheckIfDefined(data.LANG_LBL_MOVE_ALL, explorer.LANG_LBL_MOVE_ALL);
                    explorer.LANG_LBL_DEL = explorer.loadLanguageCheckIfDefined(data.LANG_LBL_DEL, explorer.LANG_LBL_DEL);
                    explorer.LANG_LBL_DEL_ALL = explorer.loadLanguageCheckIfDefined(data.LANG_LBL_DEL_ALL, explorer.LANG_LBL_DEL_ALL);
                    explorer.LANG_LBL_SHARE = explorer.loadLanguageCheckIfDefined(data.LANG_LBL_SHARE, explorer.LANG_LBL_SHARE);
                    explorer.LANG_LBL_SHARE_ALL = explorer.loadLanguageCheckIfDefined(data.LANG_LBL_SHARE_ALL, explorer.LANG_LBL_SHARE_ALL);
                    explorer.LANG_LBL_DOWNLOAD = explorer.loadLanguageCheckIfDefined(data.LANG_LBL_DOWNLOAD, explorer.LANG_LBL_DOWNLOAD);
                    explorer.LANG_LBL_DOWNLOAD_ALL = explorer.loadLanguageCheckIfDefined(data.LANG_LBL_DOWNLOAD_ALL, explorer.LANG_LBL_DOWNLOAD_ALL);
                    explorer.LANG_LBL_RENAME = explorer.loadLanguageCheckIfDefined(data.LANG_LBL_RENAME, explorer.LANG_LBL_RENAME);
                    explorer.LANG_LBL_OPEN = explorer.loadLanguageCheckIfDefined(data.LANG_LBL_OPEN, explorer.LANG_LBL_OPEN);
                    explorer.LANG_LBL_UP = explorer.loadLanguageCheckIfDefined(data.LANG_LBL_UP, explorer.LANG_LBL_UP);
                    explorer.LANG_LBL_MOVE_HEADER = explorer.loadLanguageCheckIfDefined(data.LANG_LBL_MOVE_HEADER, explorer.LANG_LBL_MOVE_HEADER);
                    explorer.LANG_LBL_MOVE_BT_MOVE = explorer.loadLanguageCheckIfDefined(data.LANG_LBL_MOVE_BT_MOVE, explorer.LANG_LBL_MOVE_BT_MOVE);
                    explorer.LANG_LBL_MOVE_BT_MOVE_TITLE = explorer.loadLanguageCheckIfDefined(data.LANG_LBL_MOVE_BT_MOVE_TITLE, explorer.LANG_LBL_MOVE_BT_MOVE_TITLE);
                    explorer.LANG_LBL_NEW_FOLDER_HEADER = explorer.loadLanguageCheckIfDefined(data.LANG_LBL_NEW_FOLDER_HEADER, explorer.LANG_LBL_NEW_FOLDER_HEADER);
                    explorer.LANG_LBL_NEW_FOLDER_FOLDER_NAME = explorer.loadLanguageCheckIfDefined(data.LANG_LBL_NEW_FOLDER_FOLDER_NAME, explorer.LANG_LBL_NEW_FOLDER_FOLDER_NAME);
                    explorer.LANG_LBL_NEW_FOLDER_BT_CREATE = explorer.loadLanguageCheckIfDefined(data.LANG_LBL_NEW_FOLDER_BT_CREATE, explorer.LANG_LBL_NEW_FOLDER_BT_CREATE);
                }, "json").fail(function () {
                    explorer.log("Looks like '" + language + "' does not have a correct json structure or does not exist.");
                    explorer.log("Default language, English, will be loaded.");
                }).always(function () {
                    explorer.initContextMenuEvent();
                });
            } else {
                explorer.log(explorer.language + " is not a .json file.");
                explorer.log("Default language, English, will be loaded.");
                explorer.initContextMenuEvent();
            }
        },
        loadLanguageCheckIfDefined: function loadLanguageCheckIfDefined(customLabel, defaultLabel) {
            return customLabel !== undefined ? customLabel : defaultLabel;
        },
        createExplorer: function createExplorer() {
            $("body").prepend("<div id='" + explorer.container.substr(1) + "'> </div>");
        },
        checkIfContainerExist: function checkIfContainerExist() {
            if (!$(explorer.container).length) {
                explorer.log(explorer.container + "'s <div> does not exist. You must either create the element that Explorer will use to create its structure, for" + " example: <div id='explorerContainer' /> or just run explorer.createExplorer();" + " right after you have instantiated explorer, and it will be build between your <body> tags. Explorer will not work without it.");
                return false;
            }
            if (!$(explorer.element).length) {
                $(explorer.container).append("<div id='" + explorer.element.substr(1) + "'></div>");
            }
            return true;
        },
        start: function start() {
            var that = this;
            var defLang = $.Deferred();
            explorer.loadExplorerRootFolder(defLang);
            $.when(defLang).then(function () {
                //setting default language
                that.language = that.language === undefined ? that.getExplorerRootFolder() + "/lang/en-US.json" : that.language;
                that.loadLanguage();
            });
            var resizeId = null,
                preload = null;
            if (explorer.checkIfContainerExist() === false) {
                return;
            }
            window.AVAILABLE_ICON_EXTENSIONS = explorer.getAvailableIconExtensions();
            if (window.AVAILABLE_ICON_EXTENSIONS === null) {
                explorer.log("It looks like you have not include 'explorer.css' on your html document. Explorer will not start without it. :/");
                return null;
            }
            if (typeof Preload != "undefined") {
                if (this.preloadIcons) {
                    preload = new Preload(explorer.iconPaths, LoadType.ASYNC).run();
                }
            } else {
                explorer.log("Looks like you have not include Preload class. Thus, icons preload will not be done.");
            }
            // preload.run();
            explorer.started = true;
            explorer.createQuickFolderAccess(0);
            explorer.setExplorerPosition();
            $(window).resize(function () {
                //it makes explorer responsive.
                explorer.resizeExplorer();
                //clearTimeout(resizeId);//little trick to resize Explorer only after resizing get done.
                //resizeId = setTimeout(explorer.resizeExplorer, 50);
            });
            explorer.disableBrowserContextMenu();
            if (explorer.language !== undefined) {
                explorer.loadLanguage();
            } else {
                explorer.initContextMenuEvent();
            }
            $(explorer.element).fadeIn("fast");
            explorer.showEmptyMessage();
            explorer.setIconsBackgroundColor(explorer.iconsBackgroundColor);
            $(explorer.container).on("drop", function () {
                if (explorer.currentParent == -1) {
                    explorer.log("While searching, dropped files will be uploaded at the root.", 1);
                    $(document).trigger("droppedWhenSearching", ["While searching, dropped files will be uploaded at the root."]);
                }
            });
        },
        setIconsBackgroundColor: function setIconsBackgroundColor(color) {
            var id = $("#iconsBackgroundColor");
            explorer.iconsBackgroundColor = color;
            if (id.length) {
                id.empty();
                id.append(".iconBorder{ background-color:" + color + "; }");
            } else {
                $("head").append("<style id=\"iconsBackgroundColor\"> .iconBorder{ background-color:" + color + "; }");
            }
        },
        resizeExplorer: function resizeExplorer() {
            explorer.setExplorerPosition(); //resize Explorer
            explorer.addFiles(explorer.currentParent, true); //reorganize files' position.
            explorer.resizeBaseDialog();
        },
        showEmptyMessage: function showEmptyMessage() {
            if (explorer.fileList.length === 0) {
                if ($("#emptyMessage").length) {
                    $("#emptyMessage").fadeIn("fast");
                } else {
                    $(explorer.element).append("<p id='emptyMessage' class='gray txtcenter'>" + explorer.LANG_LBL_EMPTY_MESSAGE + "</p>");
                }
            }
        },
        showContextMenu: function showContextMenu(file) {
            var allOptions = null,
                contextMenu4Files = $("#contextMenu4Files");
            var options = "",
                contextMenuClass = "contextMenuFile";
            explorer.hide(["#contextMenu4Files", ".contextMenuVoid"]);
            contextMenu4Files.removeClass("contextMenuFile contextMenuFolder");
            if (file == "void") {
                $("#contextIdTools").fadeIn("fast");
            } else {
                contextMenu4Files.empty();
                allOptions = explorer.selectedFiles.length > 1 && explorer.multiSelect;
                options = options.concat(explorer.loadContextMenuOption(explorer.MOVE, allOptions ? explorer.CONTEXT_MENU_OPTIONS.MOVE_ALL : explorer.CONTEXT_MENU_OPTIONS.MOVE, allOptions) + (!allOptions ? explorer.loadContextMenuOption(explorer.RENAME, explorer.CONTEXT_MENU_OPTIONS.RENAME, allOptions) : "") + explorer.loadContextMenuOption(explorer.DELETE, allOptions ? explorer.CONTEXT_MENU_OPTIONS.DELETE_ALL : explorer.CONTEXT_MENU_OPTIONS.DELETE, allOptions) + explorer.loadContextMenuOption(explorer.SHARE, allOptions ? explorer.CONTEXT_MENU_OPTIONS.SHARE_ALL : explorer.CONTEXT_MENU_OPTIONS.SHARE, allOptions) + explorer.loadContextMenuOption(explorer.DOWNLOAD, allOptions ? explorer.CONTEXT_MENU_OPTIONS.DOWNLOAD_ALL : explorer.CONTEXT_MENU_OPTIONS.DOWNLOAD, allOptions));
                if (!allOptions && file.ext == "dir") {
                    options = explorer.loadContextMenuOption(explorer.OPEN, explorer.CONTEXT_MENU_OPTIONS.OPEN, allOptions).concat(options);
                    contextMenuClass = "contextMenuFolder";
                }
                contextMenu4Files.addClass(contextMenuClass);
                options = options.concat(explorer.customMenuOption(file));
                contextMenu4Files.append(options);
                if (contextMenu4Files.html().length < 1) {
                    return;
                }
                contextMenu4Files.addClass("opacity9 gray ft12 txtmargin bold");
                contextMenu4Files.fadeIn("fast");
                contextMenu4Files.css("z-index", 9999);
                $(".contextMenuOption").on("click", function () {
                    if (isNotDisabled(this)) {
                        contextMenu4Files.fadeOut("fast");
                    }
                });
                explorer.loadContextMenuOptionEvents(file);
            }
        },
        loadContextMenuOptionEvents: function loadContextMenuOptionEvents(file) {

            $("#expOpen").on("click", function (e) {
                if (isNotDisabled(this)) {
                    explorer.open(file);
                }
            });
            $("#expMove").on("click", function (e) {
                if (isNotDisabled(this)) {
                    explorer.move(file);
                }
            });
            $("#expRename").on("click", function (e) {
                if (isNotDisabled(this)) {
                    explorer.rename(file, false);
                }
            });
            $("#expDelete").on("click", function (e) {
                if (isNotDisabled(this)) {
                    explorer.delete(file);
                }
            });
            $("#expShare").on("click", function (e) {
                if (isNotDisabled(this)) {
                    explorer.share(file);
                }
            });
            $("#expDownload").on("click", function (e) {
                if (isNotDisabled(this)) {
                    explorer.download(file);
                }
            });
        },
        loadContextMenuOption: function loadContextMenuOption(option, optionMenuState, all) {
            var str;
            switch (option) {
                case explorer.MOVE:
                    switch (optionMenuState) {
                        case explorer.ENABLED:
                            str = "<p id='expMove' class='contextMenuOption handCursor'>" + (all ? explorer.LANG_LBL_MOVE_ALL : explorer.LANG_LBL_MOVE) + "</p>";
                            break;
                        case explorer.DISABLED:
                            str = "<p id='expMove' class='contextMenuOption disabledContextMenuOption'>" + (all ? explorer.LANG_LBL_MOVE_ALL : explorer.LANG_LBL_MOVE) + "</p>";
                            break;
                        case explorer.HIDDEN:
                            str = "";
                            break;
                    }
                    break;
                case explorer.DELETE:
                    switch (optionMenuState) {
                        case explorer.ENABLED:
                            str = "<p id='expDelete' class='contextMenuOption handCursor'>" + (all ? explorer.LANG_LBL_DEL_ALL : explorer.LANG_LBL_DEL) + "</p>";
                            break;
                        case explorer.DISABLED:
                            str = "<p id='expDelete' class='contextMenuOption disabledContextMenuOption'>" + (all ? explorer.LANG_LBL_DEL_ALL : explorer.LANG_LBL_DEL) + "</p>";
                            break;
                        case explorer.HIDDEN:
                            str = "";
                            break;
                    }
                    break;
                case explorer.SHARE:
                    switch (optionMenuState) {
                        case explorer.ENABLED:
                            str = "<p id='expShare' class='contextMenuOption handCursor'>" + (all ? explorer.LANG_LBL_SHARE_ALL : explorer.LANG_LBL_SHARE) + "</p>";
                            break;
                        case explorer.DISABLED:
                            str = "<p id='expShare' class='contextMenuOption disabledContextMenuOption'>" + (all ? explorer.LANG_LBL_SHARE_ALL : explorer.LANG_LBL_SHARE) + "</p>";
                            break;
                        case explorer.HIDDEN:
                            str = "";
                            break;
                    }
                    break;
                case explorer.DOWNLOAD:
                    switch (optionMenuState) {
                        case explorer.ENABLED:
                            str = "<p id='expDownload' class='contextMenuOption handCursor'>" + (all ? explorer.LANG_LBL_DOWNLOAD_ALL : explorer.LANG_LBL_DOWNLOAD) + "</p>";
                            break;
                        case explorer.DISABLED:
                            str = "<p id='expDownload' class='contextMenuOption disabledContextMenuOption'>" + (all ? explorer.LANG_LBL_DOWNLOAD_ALL : explorer.LANG_LBL_DOWNLOAD) + "</p>";
                            break;
                        case explorer.HIDDEN:
                            str = "";
                            break;
                    }
                    break;
                case explorer.NEW_FOLDER:
                    switch (optionMenuState) {
                        case explorer.ENABLED:
                            str = "<p id='expNewFolder' class='contextMenuOption handCursor' style='margin-top:10px;'>" + explorer.LANG_LBL_NEW_FOLDER + "</p>";
                            break;
                        case explorer.DISABLED:
                            str = "<p id='expNewFolder' class='contextMenuOption disabledContextMenuOption' style='margin-top:10px;'>" + explorer.LANG_LBL_NEW_FOLDER + "</p>";
                            break;
                        case explorer.HIDDEN:
                            str = "";
                            break;
                    }
                    break;
                case explorer.UPLOAD:
                    switch (optionMenuState) {
                        case explorer.ENABLED:
                            str = "<p id='expUpload' class='contextMenuOption handCursor'>" + explorer.LANG_LBL_UPLOAD + "</p>";
                            break;
                        case explorer.DISABLED:
                            str = "<p id='expUpload' class='contextMenuOption disabledContextMenuOption'>" + explorer.LANG_LBL_UPLOAD + "</p>";
                            break;
                        case explorer.HIDDEN:
                            str = "";
                            break;
                    }
                    break;
                case explorer.RENAME:
                    switch (optionMenuState) {
                        case explorer.ENABLED:
                            str = "<p id='expRename' class='contextMenuOption handCursor'>" + explorer.LANG_LBL_RENAME + "</p>";
                            break;
                        case explorer.DISABLED:
                            str = "<p id='expRename' class='contextMenuOption disabledContextMenuOption'>" + explorer.LANG_LBL_RENAME + "</p>";
                            break;
                        case explorer.HIDDEN:
                            str = "";
                            break;
                    }
                    break;
                case explorer.OPEN:
                    switch (optionMenuState) {
                        case explorer.ENABLED:
                            str = "<p id='expOpen' class='contextMenuOption handCursor'>" + explorer.LANG_LBL_OPEN + "</p>";
                            break;
                        case explorer.DISABLED:
                            str = "<p id='expOpen' class='contextMenuOption disabledContextMenuOption'>" + explorer.LANG_LBL_OPEN + "</p>";
                            break;
                        case explorer.HIDDEN:
                            str = "";
                            break;
                    }
                    break;
            }
            return str;
        },
        //If you want to change the default size, you'll need to create baseDialog again, passing its width and height as paramenters
        createBaseDialog: function createBaseDialog(width, height, options) {
            if (options === undefined) {
                options = [];
            }
            if (width === undefined) {
                width = "auto";
            }
            options["width"] = $.isNumeric(width) ? width + "px" : width;
            if (height === undefined) {
                height = "auto";
            }
            options["height"] = $.isNumeric(height) ? height + "px" : height;
            if (options !== undefined) {
                if (options["min-width"] === undefined) {
                    options["min-width"] = $.isNumeric(width) ? width : 0;
                }
                if (options["min-height"] === undefined) {
                    options["min-height"] = $.isNumeric(height) ? height : 0;
                }
                if (options["style"] === undefined) {
                    options["style"] = "";
                }
                if (options["class"] === undefined) {
                    options["class"] = "";
                }
            }
            explorer.getBaseDialog().remove();
            $("body").append("<div class='baseDialog radius10 opacity98 " + options["class"] + "' style='" + options["style"] + "'><input id='defaultWidth' type='hidden' value='" + options["width"] + "'/>" + "<input id='defaultHeight' type='hidden' value='" + options["height"] + "'/></div>");
            explorer.getBaseDialog().css({ width: options["width"], height: options["height"], "min-width": options["min-width"], "min-height": options["min-height"] });
            var baseDialog = explorer.getBaseDialog();
            baseDialog.append("<div class='closeBaseDialog handCursor displayNone' style='top: 10px; margin-right: 10px; float: right;'" + "title='Close' alt='Close'/> <br />");
            $(".closeBaseDialog").on("click", function () {
                explorer.closeBaseDialog();
            });
            baseDialog.append("<div id='baseDialogContent' class='baseDialogContent'> </div>");
        },
        loadBaseDialog: function loadBaseDialog(content, def) {
            var baseDialogContent = $("#baseDialogContent");
            var patt = /\.tmp$|\.html/i;
            if (patt.test(content) === true) {
                //if it is a template file, load it
                baseDialogContent.load(content, function () {
                    if (typeof def != 'undefined') {
                        def.resolve();
                    }
                });
            } else {
                baseDialogContent.append(content);
            }
        },
        showBaseDialog: function showBaseDialog(hideCloseButton, def) {
            var baseDialog = explorer.getBaseDialog();
            if (!baseDialog.ready()) {
                this.showBaseDialog(hideCloseButton, def);
                return;
            }
            if (hideCloseButton !== true) {
                $(".closeBaseDialog").fadeIn("fast");
            }
            baseDialog.ready(function () {
                if (def !== undefined) {
                    def.resolve();
                }
            });
            if (baseDialog.find("#defaultHeight").val() != "auto" && baseDialog.find("#defaultWidth").val() != "auto") {
                //explorer.centralize(explorer.baseDialogId);
                explorer.resizeBaseDialog();
            } else {
                baseDialog.css("opacity", 0);
            }
            baseDialog.show(explorer.baseDialogEffect, {}, 500, function () {
                if (baseDialog.find("#defaultHeight").val() == "auto" || baseDialog.find("#defaultWidth").val() == "auto") {
                    //explorer.centralize(explorer.baseDialogId);
                    explorer.resizeBaseDialog();
                    baseDialog.animate({
                        opacity: 1
                    }, 300);
                }
            });
            var height = baseDialog.height(),
                width = baseDialog.width();
            var interval = setInterval(function () {
                if (height != baseDialog.height() || width != baseDialog.width()) {
                    height = baseDialog.height();
                    width = baseDialog.width();
                    baseDialog.trigger($.Event('resize'));
                }
            }, 5);
            baseDialog.resize(function () {
                explorer.resizeBaseDialog();
            });
            baseDialog.on("closeDialogEvent", function () {
                clearInterval(interval);
            });
            $(document).on("keyup", function (e) {
                if (e.keyCode == 27 && explorer.closeBaseDialogOnEsc === true && $(explorer.baseDialogId).length) {
                    //ESC
                    explorer.closeBaseDialog();
                }
            });
        },
        closeBaseDialog: function closeBaseDialog() {
            var baseDialog = explorer.getBaseDialog();
            $(".closeBaseDialog").fadeOut(100);
            baseDialog.hide(explorer.baseDialogEffect, {}, 300, function () {
                baseDialog.empty();
            });
            baseDialog.trigger("closeDialogEvent");
        },
        resizeBaseDialog: function resizeBaseDialog() {
            var baseDialog = explorer.getBaseDialog();
            if ($("#baseDialogContent").length) {
                //if base dialog is visible, reposition it
                var baseDialogWidth = baseDialog.outerWidth();
                var baseDialogMinWidth = Number(baseDialog.css("min-width").replace("px", ""));
                var baseDialogDefaultWidth = Number(baseDialog.find("#defaultWidth").val().replace("px", ""));
                var windowWidth = $(window).width();
                if ($.isNumeric(baseDialogDefaultWidth) && baseDialogWidth != baseDialogMinWidth && baseDialogWidth > windowWidth && baseDialogMinWidth < windowWidth || baseDialogWidth < windowWidth && baseDialogWidth < baseDialogDefaultWidth) {
                    baseDialog.css("width", windowWidth - 10 + "px");
                }
                var baseDialogHeight = baseDialog.outerHeight();
                var baseDialogMinHeight = Number(baseDialog.css("min-height").replace("px", ""));
                var baseDialogDefaultHeight = Number(baseDialog.find("#defaultHeight").val().replace("px", ""));
                var windowHeight = $(window).height();
                if ($.isNumeric(baseDialogDefaultHeight) && baseDialogHeight != baseDialogMinHeight && baseDialogHeight > windowHeight && baseDialogMinHeight < windowHeight || baseDialogHeight < windowHeight && baseDialogHeight < baseDialogDefaultHeight) {
                    baseDialog.css("height", windowHeight - 10 + "px");
                }
                explorer.centralize(explorer.baseDialogId);
            }
        },
        getBaseDialog: function getBaseDialog() {
            return $(explorer.baseDialogId);
        },
        centralize: function centralize(id) {
            var width = $(id).outerWidth() / 2;
            var windowWidth = $(window).width() / 2;
            var height = $(id).outerHeight() / 2;
            var windowHeight = $(window).height() / 2;
            $(id).css({ "left": windowWidth - width + "px", "top": windowHeight - height + "px" });
        },
        log: function log(str, opt) {
            if (explorer.debugMode) {
                if (opt == 1) {
                    console.info(str);
                } else if (opt == 2) {
                    console.dir(str);
                } else {
                    console.warn(str);
                }
            }
        },
        loadExplorerRootFolder: function loadExplorerRootFolder(def) {
            var scripts = document.getElementsByTagName("script");
            var root = "";
            var that = this;
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = scripts[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var script = _step.value;

                    try {
                        (function () {
                            var src = script.attributes.src.value;
                            $.get(src, function (data) {
                                if (data.indexOf("//METRO-EXPLORER_CODE") != -1) {
                                    var splPath = src.split("/");
                                    for (var x = 0; x < splPath.length - 2 || x == 0; x++) {
                                        root = root.concat(splPath[0]).concat("\\");
                                    }
                                    that.explorerRootFolder = root;
                                    def.resolve();
                                }
                            });
                        })();
                    } catch (e) {
                        continue;
                    }
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            setTimeout(function () {
                if (def.state() == 'pending') {
                    that.log("We could not find Explorer's root folder. Explorer will not work well without it. Please, visit www.metroui.us/Explorer to know how to fix it.");
                    def.resolve();
                }
            }, 10 * 1000);
        },
        getExplorerRootFolder: function getExplorerRootFolder() {
            return this.explorerRootFolder;
        },
        destroy: function destroy(element, explode) {
            if (element === undefined || element === null) {
                $(explorer.element).remove();
            } else {
                var patt = /#|\.*/i;
                if (patt.test(element) === true) {
                    //if it is a class or id of an element
                    if (explode) {
                        $(element).effect("explode", null, 700, function () {
                            $(this).remove();
                        });
                    }
                } else {
                    explorer.log("You must enter a valid id, or css class. For example, '#my_id' or '.my_class'.");
                }
            }
        },
        open: function open(file) {
            var folderId = file.id;
            var def = $.Deferred();
            explorer.selectedFiles = [];
            $(".file").fadeOut(200, function () {
                explorer.addFiles(Number(folderId), null, def);
            });
            var item = new QuickAccessItem(folderId, explorer.getFileById(folderId).name);
            explorer.currentPath.push(item);
            $.when(def).done(function () {
                $(".file").fadeIn("fast");
            });
        },
        rename: function rename(_file, save) {
            var id = _file.id;
            var file = { id: $("#" + id), inputDiv: $("#" + id).find("#input" + id), input: $("#" + id).find("#input" + id).find("input"), cover: $("#" + id).find("#input" + id).find("div") };
            if (save) {
                //if the user has finished renaming this file.
                var index = explorer.checkIfExists(id);
                var newName = file.input.val();
                if (newName.trim() === "") {
                    newName = "none";
                    file.input.val(newName);
                }
                explorer.fileList[index].name = newName;
                file.input.attr({ readonly: "readonly", title: newName });
                file.input.val(explorer.fileList[index].getName());
                file.input.css({ border: "none", cursor: "default" });
                file.inputDiv.prop("title", newName);
                file.cover.css("display", "block");
                file.id.trigger("fileUpdateEvent", [{ "file": explorer.fileList[index] }, explorer.EVENT_RENAME]);
            } else {
                file.input.val(file.inputDiv.prop("title"));
                file.cover.css("display", "none");
                file.id.find("._selected").remove();
                file.id.css("border", "1px solid darkgray");
                file.input.removeAttr("readonly");
                file.input.css({ "border": "2px dashed gray", "cursor": "text" });
                setTimeout(function () {
                    moveCursorToEnd(file.input);
                }, 300);
            }
        },
        move: function move() {
            var def = $.Deferred();
            var numFolders = 0;
            explorer.createBaseDialog(600);
            explorer.loadBaseDialog(explorer.getExplorerRootFolder() + "/templates/move.html", def);
            $.when(def).then(function () {
                var btMoveFiles = $("#buttonMoveFiles");
                explorer.showBaseDialog(false);
                $("#moveHeader").text(explorer.LANG_LBL_MOVE_HEADER);
                btMoveFiles.append(explorer.LANG_LBL_MOVE_BT_MOVE);
                btMoveFiles.prop("title", explorer.LANG_LBL_MOVE_BT_MOVE_TITLE);
                if (explorer.currentParent != explorer.ROOT) {
                    numFolders++;
                    explorer.createDestFolder(explorer.ROOT);
                }
                $.grep(explorer.fileList, function (file, i) {
                    //A folder should not be able to move to itself right?
                    if (file.ext == "dir" && file.id != explorer.currentParent && !inArray(explorer.selectedFiles, file)) {
                        //creating folders to move your files to
                        numFolders++;
                        explorer.createDestFolder(file);
                    }
                });
                if (numFolders === 0) {
                    $("#foldersList").append("<br /><p class='gray ft10'>" + explorer.LANG_LBL_NO_FOLDERS_FOUND + "</p>");
                }
                btMoveFiles.on("click", function () {
                    explorer.clientMove(explorer.TEMP_VAR);
                });
            });
        },
        createDestFolder: function createDestFolder(file) {
            var id = null,
                name = null;
            if (isNaN(file)) {
                //it is a custom folder
                id = file.id;
                name = file.name;
            } else {
                //it is ROOT folder
                id = file;
                name = explorer.LANG_LBL_ROOT_FOLDER;
            }
            $("#foldersList").append("<div id='mv_" + id + "' class='file mvFolderItem fileButton' style='float:left;'>" + "<div class='center iconBorder'><div class='dir center'></div></div> <input class='txtcenter ft11 inputFileName'" + "maxlength='13' readonly='readonly' value='" + name + "'/></div>");
            $("#mv_" + id).on("mousedown", function () {
                $(".movFolderSelect").remove();
                $(".mvFolderItem").css("border", "1px solid gray");
                $(this).append("<div id='selec_mv_id" + id + "' class='opacity4 _selected movFolderSelect'> </div>");
                $(this).css("border", "1px solid blue");
                var buttonMoveFiles = $("#buttonMoveFiles");
                buttonMoveFiles.prop("disabled", false);
                buttonMoveFiles.removeClass("explorerButtonDisabled");
                explorer.TEMP_VAR = this.id.replace("mv_", "");
            });
            explorer.initMouseOverEvent();
        },
        clientMove: function clientMove(destFolderId, goUp) {
            var fileIndex = -1,
                destFolder = null;
            var def = $.Deferred();
            var folders = [];
            var files = [];
            for (var x = 0; x < explorer.selectedFiles.length; x++) {
                //create a list of files and folders that are going to be moved
                fileIndex = explorer.checkIfExists(explorer.selectedFiles[x].id);
                //destFolderIndex = explorer.checkIfExists(destFolderId);
                if (explorer.selectedFiles[x].ext == "dir") {
                    var subfolders = explorer.getMySubFolders(explorer.selectedFiles[x].id);
                    if ($.inArray(destFolderId, subfolders) != -1) {
                        //if moving folder to inside itself
                        $(document).trigger("movingToItself", [{ file: explorer.selectedFiles[x], msg: explorer.LANG_LBL_MOVE_FOLDER_ERROR_MSG.replace("{folderName}", "<b>" + explorer.selectedFiles[x].name + "</b>") }]);
                        explorer.selectedFiles.splice(x, 1);
                    } else {
                        folders.push(explorer.selectedFiles[x]);
                    }
                } else {
                    files.push(explorer.selectedFiles[x]);
                }
            }
            explorer.serverMove(destFolderId, files, folders, def);
            $.when(def).then(function (response) {
                //wait for server response
                if (response === true) {
                    explorer.closeBaseDialog();

                    var _loop2 = function _loop2(_x) {
                        var file = explorer.getFileById(explorer.selectedFiles[_x].id);
                        destFolder = explorer.getFileById(destFolderId);
                        //if it's in the same folder of the new folder
                        if (destFolderId != explorer.ROOT && file.parent == explorer.currentParent && destFolder.parent == explorer.currentParent) {
                            file.getElement().css("z-index", 999).animate({
                                top: destFolder.getElement().css("top"),
                                left: destFolder.getElement().css("left")
                            }, 1000 + _x * 500, function () {
                                $(this).hide("scale", { percent: 0 }, 700, function () {
                                    file.getElement().css("z-index", 1);
                                });
                            });
                        } else if (goUp) {
                            //if it was dropped on the goUp 'file'
                            file.getElement().hide("slide", { direction: "up" }, 500);
                        } else {
                            var destFolderParent = null;
                            if (explorer.currentParent !== explorer.ROOT) {
                                destFolderParent = explorer.getFileById(explorer.currentParent).parent;
                            }
                            if (destFolderId == destFolderParent) {
                                file.getElement().css("z-index", 999).animate({
                                    top: explorer.fields.fieldList[0].element.css("top"),
                                    left: explorer.fields.fieldList[0].element.css("left")
                                }, 1000 + _x * 500, function () {
                                    //a small delay between the files
                                    file.getElement().hide("slide", { direction: "up" }, 500);
                                });
                            } else {
                                file.getElement().hide("clip", {}, 500);
                            }
                        }
                        fileIndex = explorer.checkIfExists(file.id);
                        explorer.fileList[fileIndex].parent = Number(destFolderId);
                        explorer.fileList[fileIndex].placed = false;
                        explorer.fileList[fileIndex].field = -1;
                    };

                    for (var _x = 0; _x < explorer.selectedFiles.length; _x++) {
                        _loop2(_x);
                    }
                }
            });
        },
        search: function search(string) {
            var noFile = true;
            if (string.trim() === "") {
                explorer.addFiles(0);
                return;
            }
            explorer.fields.fieldList = [];
            explorer.fields.usedFields = 0;
            $(".quickAccessLink").css("text-decoration", "line-through");
            if (explorer.currentParent != -1) {
                //ao pesquisar, todos os arquivos que estavam sendo exibidos no momento, devem perder seus lugares na tela
                //Assim, quando o usuário clicar no link de acesso r?pido, ele ser? renderizado novamente.
                for (var x = 0; x < explorer.fileList.length; x++) {
                    explorer.fileList[x].placed = false;
                }
            }
            explorer.currentParent = -1;
            $(".file, .field").remove(); //Delete each file and field on the screen before add the new ones.
            for (var _x2 = 0; _x2 < explorer.fileList.length; _x2++) {
                if (explorer.fileList[_x2].name.toLowerCase().indexOf(string.toLowerCase()) != -1) {
                    var _file2 = explorer.fileList[_x2];
                    _file2.found = true;
                    explorer.addFiles(_file2);
                    noFile = false;
                }
            }
            var emptyMessage = $("#emptyMessage");
            if (noFile) {
                emptyMessage.text("No file found for: " + string);
                emptyMessage.fadeIn("fast");
            } else {
                emptyMessage.text(explorer.LANG_LBL_EMPTY_MESSAGE);
            }
        },
        serverMove: function serverMove(destFolderId, files, folders, def) {
            def.resolve(true);
        },
        getMySubFolders: function getMySubFolders(folderId) {
            var folders = "";
            $.each(explorer.fileList, function (i, item) {
                //for (item of explorer.fileList){
                if (item.ext == "dir" && item.parent == folderId) {
                    folders += item.id + "," + explorer.getMySubFolders(item.id);
                }
            });
            folders = $.grep(folders.split(","), function (val, i) {
                if (val !== "") return val;
            });
            return folders;
        },
        delete: function _delete() {
            explorer.clientDelete();
        },
        clientDelete: function clientDelete() {
            var def = $.Deferred();
            explorer.serverDelete(def);
            $.when(def).then(function (success) {
                if (success === true) {
                    var _loop3 = function _loop3(x) {
                        if (explorer.selectedFiles[x].ext == "dir") {
                            explorer.deleteFolderRecursively(explorer.selectedFiles[x].id);
                        }
                        var index = explorer.checkIfExists(explorer.selectedFiles[x].id); //its index will change since his children will be removed from the list first
                        var list = explorer.fields.fieldList[explorer.fileList[index].field].filesOn;
                        explorer.fields.fieldList[explorer.fileList[index].field].filesOn = $.grep(list, function (val) {
                            return val != explorer.fileList[index].id; //remove file from field
                        });
                        if (explorer.fields.fieldList[explorer.fileList[index].field].filesOn.length === 0) {
                            explorer.fields.usedFields -= 1;
                        }
                        explorer.destroy("#" + explorer.selectedFiles[x].id, true);
                        explorer.fileList = $.grep(explorer.fileList, function (val, i) {
                            return val.id != explorer.fileList[index].id; //remove file from list
                        });
                    };

                    for (var x = 0; x < explorer.selectedFiles.length; x++) {
                        _loop3(x);
                    }
                    explorer.selectedFiles = [];
                    explorer.showEmptyMessage();
                } else {
                    explorer.log("Looks like your server side delete function did not return true, so explorer is not going to delete the selected files.");
                }
            });
        },
        deleteFolderRecursively: function deleteFolderRecursively(folderId) {
            for (var x = 0; x < explorer.fileList.length; x++) {
                if (explorer.fileList[x].parent == folderId) {
                    if (explorer.fileList[x].ext == "dir") {
                        var subfolderId = explorer.fileList[x].id;
                        explorer.deleteFolderRecursively(explorer.fileList[x].id);
                        explorer.fileList = $.grep(explorer.fileList, function (val, i) {
                            return val.id != subfolderId;
                        });
                        x = 0; //reset the counter cuz fileList has changed its files indexes
                    } else {
                        explorer.fileList = $.grep(explorer.fileList, function (val, i) {
                            return val.id != explorer.fileList[x].id;
                        });
                        x = 0; //reset the counter cuz fileList has changed its files indexes
                    }
                }
            }
        },
        serverDelete: function serverDelete(def) {
            def.resolve(true);
        },
        share: function share() {},
        download: function download() {},
        dbclick: function dbclick(file) {
            explorer.TEMP_VAR = file;
            if (file.ext == "dir") {
                explorer.open(file);
            } else {
                explorer.preview(file);
            }
        },
        newFolder: function newFolder() {
            var def = $.Deferred();
            explorer.createBaseDialog(400);
            explorer.loadBaseDialog(explorer.getExplorerRootFolder() + "/templates/newFolder.html", def);
            $.when(def).then(function () {
                explorer.showBaseDialog();
                var btCreateFolder = $("#buttonCreateFolder");
                var inpFolderName = $("#inpFolderName");
                inpFolderName.on("keyup", function () {
                    if ($(this).val().length < 1) {
                        btCreateFolder.addClass("explorerButtonDisabled");
                        btCreateFolder.prop("disabled", "disabled");
                    } else {
                        btCreateFolder.removeClass("explorerButtonDisabled");
                        btCreateFolder.removeProp("disabled");
                    }
                });
                btCreateFolder.on("click", function () {
                    explorer.clientNewFolder($("#inpFolderName").val());
                });
                inpFolderName.focus();
                $("#newFolderHeader").text(explorer.LANG_LBL_NEW_FOLDER_HEADER);
                $("#folderName").text(explorer.LANG_LBL_NEW_FOLDER_FOLDER_NAME);
                btCreateFolder.text(explorer.LANG_LBL_NEW_FOLDER_BT_CREATE);
            });
        },
        clientNewFolder: function clientNewFolder(folderName) {
            var def = $.Deferred();
            explorer.serverNewFolder(folderName, def);
            $.when(def).then(function (folderId) {
                if ($.isNumeric(folderId)) {
                    explorer.addFiles(new _file5.default(folderId, folderName, "dir", explorer.currentParent));
                    explorer.closeBaseDialog();
                } else {
                    explorer.log("explorer.serverNewFolder() either did not return the folder ID or its result is not a number. Result: " + folderId);
                }
            });
        },
        serverNewFolder: function serverNewFolder(folderName, def) {
            return def.resolve(Math.floor(Math.random() * 500 + 200));
        },
        upload: function upload() {},
        customMenuOption: function customMenuOption(file) {
            return "";
        },
        buildCustomMenuOption: function buildCustomMenuOption(label, callback, options) {
            var id = null,
                interval = null,
                clazz = "",
                title = "";
            id = explorer.customOptionId++;
            interval = setInterval(function () {
                if ($("#contextMenuOption" + id).length) {
                    $("#contextMenuOption" + id).on("click", function (e) {
                        if (isNotDisabled(this)) {
                            callback(explorer.selectedFiles);
                        }
                    });
                    clearInterval(interval);
                }
            }, 50);
            if (options) {
                if (options.disabled) {
                    clazz = "disabledContextMenuOption";
                }
                if (options.title) {
                    title = options.title;
                }
            }
            return "<p title='" + title + "' id='contextMenuOption" + id + "'class='contextMenuOption handCursor " + clazz + "'>" + label + "</p>";
        },
        preview: function preview(file) {},
        getAvailableIconExtensions: function getAvailableIconExtensions() {
            var startCollecting = false,
                stopCollecting = false;
            var extensions = [];
            var path = null;
            var file = this.getExplorerStyleFile();
            for (var y = 0; y < file.cssRules.length; y++) {
                if (!startCollecting) {
                    startCollecting = file.cssRules[y].selectorText == ".EXPLORER_EXTENSIONS_BEGIN";
                    continue;
                }
                if (startCollecting && !stopCollecting) {
                    path = getValueBetweenQuotes(file.cssRules[y].style.background).replace("..", "");
                    if ($.inArray(path, explorer.iconPaths) == -1) {
                        explorer.iconPaths.push(path);
                    }
                    stopCollecting = file.cssRules[y].selectorText == ".EXPLORER_EXTENSIONS_END";
                    if (stopCollecting) {
                        break;
                    }
                    extensions.push(file.cssRules[y].selectorText.replace(".", ""));
                }
            }
            return extensions.length === 0 ? null : extensions;
        },
        getExplorerStyleFile: function getExplorerStyleFile() {
            if (this.styleFile !== null) {
                return this.styleFile;
            }
            var files = document.styleSheets;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = files[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var _file3 = _step2.value;

                    if (_file3.href === null || _file3.href === undefined) {
                        continue;
                    }
                    var _iteratorNormalCompletion3 = true;
                    var _didIteratorError3 = false;
                    var _iteratorError3 = undefined;

                    try {
                        for (var _iterator3 = _file3.cssRules[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                            var rule = _step3.value;

                            if (rule.selectorText == ".EXPLORER_EXTENSIONS_BEGIN") {
                                this.styleFile = _file3;
                                return this.styleFile;
                            }
                        }
                    } catch (err) {
                        _didIteratorError3 = true;
                        _iteratorError3 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                _iterator3.return();
                            }
                        } finally {
                            if (_didIteratorError3) {
                                throw _iteratorError3;
                            }
                        }
                    }
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }
        }
    };
    return explorer;
};

function removeClass(objs, classes) {
    $.each(objs, function (i, obj) {
        $.each(classes, function (i, clasS) {
            $(obj).removeClass(clasS);
        });
    });
}
function addClass(objs, classes) {
    $.each(objs, function (i, obj) {
        $.each(classes, function (i, clasS) {
            $(obj).addClass(clasS);
        });
    });
}

function Field(id, element, filesOn, top, left) {
    this.id = "field_" + id;
    this.element = element;
    this.filesOn = filesOn;
    this.top = top;
    this.left = left;
    this.fieldNumber = function () {
        return Number(this.id.replace("field_", ""));
    };
}

function QuickAccessItem(id, name) {
    this.id = id;
    this.name = name;
}

function moveCursorToEnd(input) {
    var originalValue = input.val();
    input.val('');
    input.focus().val(originalValue);
}

function getValueBetweenQuotes(str) {
    var ret = "";
    if (/"/.test(str)) {
        ret = str.match(/"(.*?)"/)[1];
    } else {
        ret = str;
    }
    return ret;
}

function isNotDisabled(element) {
    return !$(element).hasClass("disabledContextMenuOption");
}

function inArray(array, obj, fieldstoCompare) {
    "use strict";

    var properties = [];
    var equals = false;
    if (fieldstoCompare === undefined) {
        for (var x = 0; x < array.length; x++) {
            for (var prop in obj) {
                if ($.isFunction(array[x][prop])) continue;
                equals = obj[prop] === array[x][prop];
                if (!equals) {
                    break;
                }
            }
            if (equals) {
                return equals;
            }
        }
        return equals;
    } else {
        for (var _x3 = 0; _x3 < array.length; _x3++) {
            equals = true;
            for (var y = 0; y < fieldstoCompare.length; y++) {
                var _prop = fieldstoCompare[y];
                if ($.isFunction(array[_x3][_prop])) continue;
                properties[y] = array[_x3][_prop] === obj[_prop];
            }
            for (var _y = 0; _y < properties.length; _y++) {
                if (properties[_y] === false) {
                    equals = false;
                    break;
                }
            }
            if (equals === true) {
                return equals;
            }
        }
        return equals;
    }
}
module.exports = Explorer;

},{"./file.js":4}],4:[function(require,module,exports){
"use strict";

/**
 * Created by lucas on 11/2/2016.
 */

var File = function File(id, name, ext, parent, field) {
    this.id = id;
    this.parent = parent === undefined || parent === null ? 0 : parent;
    this.field = field === undefined || field === null ? -1 : field;
    this.placed = false;
    this.name = name;
    this.getIcon = function (ext) {
        ext = this.ext !== undefined ? this.ext : "";
        if (window.AVAILABLE_ICON_EXTENSIONS) {
            var extIndex = window.AVAILABLE_ICON_EXTENSIONS.indexOf(ext.toLowerCase());
            if (extIndex == -1 || window.AVAILABLE_ICON_EXTENSIONS.indexOf("_".concat(ext.toLowerCase())) != -1) {
                return "noIcon";
            }
        }
        return ext.toLowerCase();
    };
    this.getName = function () {
        var name = this.name;
        if (name.length > 12) {
            name = name.substring(0, 12) + "...";
        }
        return name;
    };
    this.getExtension = function (file) {
        file = file === undefined ? this.ext : file;
        var str = file.split(".");
        var ext = str[str.length - 1];
        console.log(this.checkIcon(ext));
        return this.checkIcon(ext);
    };
    this.getElement = function () {
        return $("#" + this.id);
    };
    this.ext = ext;
};

module.exports = File;

},{}],5:[function(require,module,exports){
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*! jQuery UI - v1.11.4 - 2015-07-15
* http://jqueryui.com
* Includes: core.js, widget.js, mouse.js, position.js, draggable.js, droppable.js, tooltip.js, effect.js, effect-blind.js, effect-bounce.js, effect-clip.js, effect-drop.js, effect-explode.js, effect-fade.js, effect-fold.js, effect-highlight.js, effect-pulsate.js, effect-scale.js, effect-shake.js, effect-size.js, effect-slide.js
* Copyright 2015 jQuery Foundation and other contributors; Licensed MIT */

(function (e) {
  "function" == typeof define && define.amd ? define(["jquery"], e) : e(jQuery);
})(function (e) {
  function t(t, s) {
    var n,
        a,
        o,
        r = t.nodeName.toLowerCase();return "area" === r ? (n = t.parentNode, a = n.name, t.href && a && "map" === n.nodeName.toLowerCase() ? (o = e("img[usemap='#" + a + "']")[0], !!o && i(o)) : !1) : (/^(input|select|textarea|button|object)$/.test(r) ? !t.disabled : "a" === r ? t.href || s : s) && i(t);
  }function i(t) {
    return e.expr.filters.visible(t) && !e(t).parents().addBack().filter(function () {
      return "hidden" === e.css(this, "visibility");
    }).length;
  }e.ui = e.ui || {}, e.extend(e.ui, { version: "1.11.4", keyCode: { BACKSPACE: 8, COMMA: 188, DELETE: 46, DOWN: 40, END: 35, ENTER: 13, ESCAPE: 27, HOME: 36, LEFT: 37, PAGE_DOWN: 34, PAGE_UP: 33, PERIOD: 190, RIGHT: 39, SPACE: 32, TAB: 9, UP: 38 } }), e.fn.extend({ scrollParent: function scrollParent(t) {
      var i = this.css("position"),
          s = "absolute" === i,
          n = t ? /(auto|scroll|hidden)/ : /(auto|scroll)/,
          a = this.parents().filter(function () {
        var t = e(this);return s && "static" === t.css("position") ? !1 : n.test(t.css("overflow") + t.css("overflow-y") + t.css("overflow-x"));
      }).eq(0);return "fixed" !== i && a.length ? a : e(this[0].ownerDocument || document);
    }, uniqueId: function () {
      var e = 0;return function () {
        return this.each(function () {
          this.id || (this.id = "ui-id-" + ++e);
        });
      };
    }(), removeUniqueId: function removeUniqueId() {
      return this.each(function () {
        /^ui-id-\d+$/.test(this.id) && e(this).removeAttr("id");
      });
    } }), e.extend(e.expr[":"], { data: e.expr.createPseudo ? e.expr.createPseudo(function (t) {
      return function (i) {
        return !!e.data(i, t);
      };
    }) : function (t, i, s) {
      return !!e.data(t, s[3]);
    }, focusable: function focusable(i) {
      return t(i, !isNaN(e.attr(i, "tabindex")));
    }, tabbable: function tabbable(i) {
      var s = e.attr(i, "tabindex"),
          n = isNaN(s);return (n || s >= 0) && t(i, !n);
    } }), e("<a>").outerWidth(1).jquery || e.each(["Width", "Height"], function (t, i) {
    function s(t, i, s, a) {
      return e.each(n, function () {
        i -= parseFloat(e.css(t, "padding" + this)) || 0, s && (i -= parseFloat(e.css(t, "border" + this + "Width")) || 0), a && (i -= parseFloat(e.css(t, "margin" + this)) || 0);
      }), i;
    }var n = "Width" === i ? ["Left", "Right"] : ["Top", "Bottom"],
        a = i.toLowerCase(),
        o = { innerWidth: e.fn.innerWidth, innerHeight: e.fn.innerHeight, outerWidth: e.fn.outerWidth, outerHeight: e.fn.outerHeight };e.fn["inner" + i] = function (t) {
      return void 0 === t ? o["inner" + i].call(this) : this.each(function () {
        e(this).css(a, s(this, t) + "px");
      });
    }, e.fn["outer" + i] = function (t, n) {
      return "number" != typeof t ? o["outer" + i].call(this, t) : this.each(function () {
        e(this).css(a, s(this, t, !0, n) + "px");
      });
    };
  }), e.fn.addBack || (e.fn.addBack = function (e) {
    return this.add(null == e ? this.prevObject : this.prevObject.filter(e));
  }), e("<a>").data("a-b", "a").removeData("a-b").data("a-b") && (e.fn.removeData = function (t) {
    return function (i) {
      return arguments.length ? t.call(this, e.camelCase(i)) : t.call(this);
    };
  }(e.fn.removeData)), e.ui.ie = !!/msie [\w.]+/.exec(navigator.userAgent.toLowerCase()), e.fn.extend({ focus: function (t) {
      return function (i, s) {
        return "number" == typeof i ? this.each(function () {
          var t = this;setTimeout(function () {
            e(t).focus(), s && s.call(t);
          }, i);
        }) : t.apply(this, arguments);
      };
    }(e.fn.focus), disableSelection: function () {
      var e = "onselectstart" in document.createElement("div") ? "selectstart" : "mousedown";return function () {
        return this.bind(e + ".ui-disableSelection", function (e) {
          e.preventDefault();
        });
      };
    }(), enableSelection: function enableSelection() {
      return this.unbind(".ui-disableSelection");
    }, zIndex: function zIndex(t) {
      if (void 0 !== t) return this.css("zIndex", t);if (this.length) for (var i, s, n = e(this[0]); n.length && n[0] !== document;) {
        if (i = n.css("position"), ("absolute" === i || "relative" === i || "fixed" === i) && (s = parseInt(n.css("zIndex"), 10), !isNaN(s) && 0 !== s)) return s;n = n.parent();
      }return 0;
    } }), e.ui.plugin = { add: function add(t, i, s) {
      var n,
          a = e.ui[t].prototype;for (n in s) {
        a.plugins[n] = a.plugins[n] || [], a.plugins[n].push([i, s[n]]);
      }
    }, call: function call(e, t, i, s) {
      var n,
          a = e.plugins[t];if (a && (s || e.element[0].parentNode && 11 !== e.element[0].parentNode.nodeType)) for (n = 0; a.length > n; n++) {
        e.options[a[n][0]] && a[n][1].apply(e.element, i);
      }
    } };var s = 0,
      n = Array.prototype.slice;e.cleanData = function (t) {
    return function (i) {
      var s, n, a;for (a = 0; null != (n = i[a]); a++) {
        try {
          s = e._data(n, "events"), s && s.remove && e(n).triggerHandler("remove");
        } catch (o) {}
      }t(i);
    };
  }(e.cleanData), e.widget = function (t, i, s) {
    var n,
        a,
        o,
        r,
        h = {},
        l = t.split(".")[0];return t = t.split(".")[1], n = l + "-" + t, s || (s = i, i = e.Widget), e.expr[":"][n.toLowerCase()] = function (t) {
      return !!e.data(t, n);
    }, e[l] = e[l] || {}, a = e[l][t], o = e[l][t] = function (e, t) {
      return this._createWidget ? (arguments.length && this._createWidget(e, t), void 0) : new o(e, t);
    }, e.extend(o, a, { version: s.version, _proto: e.extend({}, s), _childConstructors: [] }), r = new i(), r.options = e.widget.extend({}, r.options), e.each(s, function (t, s) {
      return e.isFunction(s) ? (h[t] = function () {
        var e = function e() {
          return i.prototype[t].apply(this, arguments);
        },
            n = function n(e) {
          return i.prototype[t].apply(this, e);
        };return function () {
          var t,
              i = this._super,
              a = this._superApply;return this._super = e, this._superApply = n, t = s.apply(this, arguments), this._super = i, this._superApply = a, t;
        };
      }(), void 0) : (h[t] = s, void 0);
    }), o.prototype = e.widget.extend(r, { widgetEventPrefix: a ? r.widgetEventPrefix || t : t }, h, { constructor: o, namespace: l, widgetName: t, widgetFullName: n }), a ? (e.each(a._childConstructors, function (t, i) {
      var s = i.prototype;e.widget(s.namespace + "." + s.widgetName, o, i._proto);
    }), delete a._childConstructors) : i._childConstructors.push(o), e.widget.bridge(t, o), o;
  }, e.widget.extend = function (t) {
    for (var i, s, a = n.call(arguments, 1), o = 0, r = a.length; r > o; o++) {
      for (i in a[o]) {
        s = a[o][i], a[o].hasOwnProperty(i) && void 0 !== s && (t[i] = e.isPlainObject(s) ? e.isPlainObject(t[i]) ? e.widget.extend({}, t[i], s) : e.widget.extend({}, s) : s);
      }
    }return t;
  }, e.widget.bridge = function (t, i) {
    var s = i.prototype.widgetFullName || t;e.fn[t] = function (a) {
      var o = "string" == typeof a,
          r = n.call(arguments, 1),
          h = this;return o ? this.each(function () {
        var i,
            n = e.data(this, s);return "instance" === a ? (h = n, !1) : n ? e.isFunction(n[a]) && "_" !== a.charAt(0) ? (i = n[a].apply(n, r), i !== n && void 0 !== i ? (h = i && i.jquery ? h.pushStack(i.get()) : i, !1) : void 0) : e.error("no such method '" + a + "' for " + t + " widget instance") : e.error("cannot call methods on " + t + " prior to initialization; " + "attempted to call method '" + a + "'");
      }) : (r.length && (a = e.widget.extend.apply(null, [a].concat(r))), this.each(function () {
        var t = e.data(this, s);t ? (t.option(a || {}), t._init && t._init()) : e.data(this, s, new i(a, this));
      })), h;
    };
  }, e.Widget = function () {}, e.Widget._childConstructors = [], e.Widget.prototype = { widgetName: "widget", widgetEventPrefix: "", defaultElement: "<div>", options: { disabled: !1, create: null }, _createWidget: function _createWidget(t, i) {
      i = e(i || this.defaultElement || this)[0], this.element = e(i), this.uuid = s++, this.eventNamespace = "." + this.widgetName + this.uuid, this.bindings = e(), this.hoverable = e(), this.focusable = e(), i !== this && (e.data(i, this.widgetFullName, this), this._on(!0, this.element, { remove: function remove(e) {
          e.target === i && this.destroy();
        } }), this.document = e(i.style ? i.ownerDocument : i.document || i), this.window = e(this.document[0].defaultView || this.document[0].parentWindow)), this.options = e.widget.extend({}, this.options, this._getCreateOptions(), t), this._create(), this._trigger("create", null, this._getCreateEventData()), this._init();
    }, _getCreateOptions: e.noop, _getCreateEventData: e.noop, _create: e.noop, _init: e.noop, destroy: function destroy() {
      this._destroy(), this.element.unbind(this.eventNamespace).removeData(this.widgetFullName).removeData(e.camelCase(this.widgetFullName)), this.widget().unbind(this.eventNamespace).removeAttr("aria-disabled").removeClass(this.widgetFullName + "-disabled " + "ui-state-disabled"), this.bindings.unbind(this.eventNamespace), this.hoverable.removeClass("ui-state-hover"), this.focusable.removeClass("ui-state-focus");
    }, _destroy: e.noop, widget: function widget() {
      return this.element;
    }, option: function option(t, i) {
      var s,
          n,
          a,
          o = t;if (0 === arguments.length) return e.widget.extend({}, this.options);if ("string" == typeof t) if (o = {}, s = t.split("."), t = s.shift(), s.length) {
        for (n = o[t] = e.widget.extend({}, this.options[t]), a = 0; s.length - 1 > a; a++) {
          n[s[a]] = n[s[a]] || {}, n = n[s[a]];
        }if (t = s.pop(), 1 === arguments.length) return void 0 === n[t] ? null : n[t];n[t] = i;
      } else {
        if (1 === arguments.length) return void 0 === this.options[t] ? null : this.options[t];o[t] = i;
      }return this._setOptions(o), this;
    }, _setOptions: function _setOptions(e) {
      var t;for (t in e) {
        this._setOption(t, e[t]);
      }return this;
    }, _setOption: function _setOption(e, t) {
      return this.options[e] = t, "disabled" === e && (this.widget().toggleClass(this.widgetFullName + "-disabled", !!t), t && (this.hoverable.removeClass("ui-state-hover"), this.focusable.removeClass("ui-state-focus"))), this;
    }, enable: function enable() {
      return this._setOptions({ disabled: !1 });
    }, disable: function disable() {
      return this._setOptions({ disabled: !0 });
    }, _on: function _on(t, i, s) {
      var n,
          a = this;"boolean" != typeof t && (s = i, i = t, t = !1), s ? (i = n = e(i), this.bindings = this.bindings.add(i)) : (s = i, i = this.element, n = this.widget()), e.each(s, function (s, o) {
        function r() {
          return t || a.options.disabled !== !0 && !e(this).hasClass("ui-state-disabled") ? ("string" == typeof o ? a[o] : o).apply(a, arguments) : void 0;
        }"string" != typeof o && (r.guid = o.guid = o.guid || r.guid || e.guid++);var h = s.match(/^([\w:-]*)\s*(.*)$/),
            l = h[1] + a.eventNamespace,
            u = h[2];u ? n.delegate(u, l, r) : i.bind(l, r);
      });
    }, _off: function _off(t, i) {
      i = (i || "").split(" ").join(this.eventNamespace + " ") + this.eventNamespace, t.unbind(i).undelegate(i), this.bindings = e(this.bindings.not(t).get()), this.focusable = e(this.focusable.not(t).get()), this.hoverable = e(this.hoverable.not(t).get());
    }, _delay: function _delay(e, t) {
      function i() {
        return ("string" == typeof e ? s[e] : e).apply(s, arguments);
      }var s = this;return setTimeout(i, t || 0);
    }, _hoverable: function _hoverable(t) {
      this.hoverable = this.hoverable.add(t), this._on(t, { mouseenter: function mouseenter(t) {
          e(t.currentTarget).addClass("ui-state-hover");
        }, mouseleave: function mouseleave(t) {
          e(t.currentTarget).removeClass("ui-state-hover");
        } });
    }, _focusable: function _focusable(t) {
      this.focusable = this.focusable.add(t), this._on(t, { focusin: function focusin(t) {
          e(t.currentTarget).addClass("ui-state-focus");
        }, focusout: function focusout(t) {
          e(t.currentTarget).removeClass("ui-state-focus");
        } });
    }, _trigger: function _trigger(t, i, s) {
      var n,
          a,
          o = this.options[t];if (s = s || {}, i = e.Event(i), i.type = (t === this.widgetEventPrefix ? t : this.widgetEventPrefix + t).toLowerCase(), i.target = this.element[0], a = i.originalEvent) for (n in a) {
        n in i || (i[n] = a[n]);
      }return this.element.trigger(i, s), !(e.isFunction(o) && o.apply(this.element[0], [i].concat(s)) === !1 || i.isDefaultPrevented());
    } }, e.each({ show: "fadeIn", hide: "fadeOut" }, function (t, i) {
    e.Widget.prototype["_" + t] = function (s, n, a) {
      "string" == typeof n && (n = { effect: n });var o,
          r = n ? n === !0 || "number" == typeof n ? i : n.effect || i : t;n = n || {}, "number" == typeof n && (n = { duration: n }), o = !e.isEmptyObject(n), n.complete = a, n.delay && s.delay(n.delay), o && e.effects && e.effects.effect[r] ? s[t](n) : r !== t && s[r] ? s[r](n.duration, n.easing, a) : s.queue(function (i) {
        e(this)[t](), a && a.call(s[0]), i();
      });
    };
  }), e.widget;var a = !1;e(document).mouseup(function () {
    a = !1;
  }), e.widget("ui.mouse", { version: "1.11.4", options: { cancel: "input,textarea,button,select,option", distance: 1, delay: 0 }, _mouseInit: function _mouseInit() {
      var t = this;this.element.bind("mousedown." + this.widgetName, function (e) {
        return t._mouseDown(e);
      }).bind("click." + this.widgetName, function (i) {
        return !0 === e.data(i.target, t.widgetName + ".preventClickEvent") ? (e.removeData(i.target, t.widgetName + ".preventClickEvent"), i.stopImmediatePropagation(), !1) : void 0;
      }), this.started = !1;
    }, _mouseDestroy: function _mouseDestroy() {
      this.element.unbind("." + this.widgetName), this._mouseMoveDelegate && this.document.unbind("mousemove." + this.widgetName, this._mouseMoveDelegate).unbind("mouseup." + this.widgetName, this._mouseUpDelegate);
    }, _mouseDown: function _mouseDown(t) {
      if (!a) {
        this._mouseMoved = !1, this._mouseStarted && this._mouseUp(t), this._mouseDownEvent = t;var i = this,
            s = 1 === t.which,
            n = "string" == typeof this.options.cancel && t.target.nodeName ? e(t.target).closest(this.options.cancel).length : !1;return s && !n && this._mouseCapture(t) ? (this.mouseDelayMet = !this.options.delay, this.mouseDelayMet || (this._mouseDelayTimer = setTimeout(function () {
          i.mouseDelayMet = !0;
        }, this.options.delay)), this._mouseDistanceMet(t) && this._mouseDelayMet(t) && (this._mouseStarted = this._mouseStart(t) !== !1, !this._mouseStarted) ? (t.preventDefault(), !0) : (!0 === e.data(t.target, this.widgetName + ".preventClickEvent") && e.removeData(t.target, this.widgetName + ".preventClickEvent"), this._mouseMoveDelegate = function (e) {
          return i._mouseMove(e);
        }, this._mouseUpDelegate = function (e) {
          return i._mouseUp(e);
        }, this.document.bind("mousemove." + this.widgetName, this._mouseMoveDelegate).bind("mouseup." + this.widgetName, this._mouseUpDelegate), t.preventDefault(), a = !0, !0)) : !0;
      }
    }, _mouseMove: function _mouseMove(t) {
      if (this._mouseMoved) {
        if (e.ui.ie && (!document.documentMode || 9 > document.documentMode) && !t.button) return this._mouseUp(t);if (!t.which) return this._mouseUp(t);
      }return (t.which || t.button) && (this._mouseMoved = !0), this._mouseStarted ? (this._mouseDrag(t), t.preventDefault()) : (this._mouseDistanceMet(t) && this._mouseDelayMet(t) && (this._mouseStarted = this._mouseStart(this._mouseDownEvent, t) !== !1, this._mouseStarted ? this._mouseDrag(t) : this._mouseUp(t)), !this._mouseStarted);
    }, _mouseUp: function _mouseUp(t) {
      return this.document.unbind("mousemove." + this.widgetName, this._mouseMoveDelegate).unbind("mouseup." + this.widgetName, this._mouseUpDelegate), this._mouseStarted && (this._mouseStarted = !1, t.target === this._mouseDownEvent.target && e.data(t.target, this.widgetName + ".preventClickEvent", !0), this._mouseStop(t)), a = !1, !1;
    }, _mouseDistanceMet: function _mouseDistanceMet(e) {
      return Math.max(Math.abs(this._mouseDownEvent.pageX - e.pageX), Math.abs(this._mouseDownEvent.pageY - e.pageY)) >= this.options.distance;
    }, _mouseDelayMet: function _mouseDelayMet() {
      return this.mouseDelayMet;
    }, _mouseStart: function _mouseStart() {}, _mouseDrag: function _mouseDrag() {}, _mouseStop: function _mouseStop() {}, _mouseCapture: function _mouseCapture() {
      return !0;
    } }), function () {
    function t(e, t, i) {
      return [parseFloat(e[0]) * (p.test(e[0]) ? t / 100 : 1), parseFloat(e[1]) * (p.test(e[1]) ? i / 100 : 1)];
    }function i(t, i) {
      return parseInt(e.css(t, i), 10) || 0;
    }function s(t) {
      var i = t[0];return 9 === i.nodeType ? { width: t.width(), height: t.height(), offset: { top: 0, left: 0 } } : e.isWindow(i) ? { width: t.width(), height: t.height(), offset: { top: t.scrollTop(), left: t.scrollLeft() } } : i.preventDefault ? { width: 0, height: 0, offset: { top: i.pageY, left: i.pageX } } : { width: t.outerWidth(), height: t.outerHeight(), offset: t.offset() };
    }e.ui = e.ui || {};var n,
        a,
        o = Math.max,
        r = Math.abs,
        h = Math.round,
        l = /left|center|right/,
        u = /top|center|bottom/,
        d = /[\+\-]\d+(\.[\d]+)?%?/,
        c = /^\w+/,
        p = /%$/,
        f = e.fn.position;e.position = { scrollbarWidth: function scrollbarWidth() {
        if (void 0 !== n) return n;var t,
            i,
            s = e("<div style='display:block;position:absolute;width:50px;height:50px;overflow:hidden;'><div style='height:100px;width:auto;'></div></div>"),
            a = s.children()[0];return e("body").append(s), t = a.offsetWidth, s.css("overflow", "scroll"), i = a.offsetWidth, t === i && (i = s[0].clientWidth), s.remove(), n = t - i;
      }, getScrollInfo: function getScrollInfo(t) {
        var i = t.isWindow || t.isDocument ? "" : t.element.css("overflow-x"),
            s = t.isWindow || t.isDocument ? "" : t.element.css("overflow-y"),
            n = "scroll" === i || "auto" === i && t.width < t.element[0].scrollWidth,
            a = "scroll" === s || "auto" === s && t.height < t.element[0].scrollHeight;return { width: a ? e.position.scrollbarWidth() : 0, height: n ? e.position.scrollbarWidth() : 0 };
      }, getWithinInfo: function getWithinInfo(t) {
        var i = e(t || window),
            s = e.isWindow(i[0]),
            n = !!i[0] && 9 === i[0].nodeType;return { element: i, isWindow: s, isDocument: n, offset: i.offset() || { left: 0, top: 0 }, scrollLeft: i.scrollLeft(), scrollTop: i.scrollTop(), width: s || n ? i.width() : i.outerWidth(), height: s || n ? i.height() : i.outerHeight() };
      } }, e.fn.position = function (n) {
      if (!n || !n.of) return f.apply(this, arguments);n = e.extend({}, n);var p,
          m,
          g,
          v,
          y,
          b,
          _ = e(n.of),
          x = e.position.getWithinInfo(n.within),
          w = e.position.getScrollInfo(x),
          k = (n.collision || "flip").split(" "),
          T = {};return b = s(_), _[0].preventDefault && (n.at = "left top"), m = b.width, g = b.height, v = b.offset, y = e.extend({}, v), e.each(["my", "at"], function () {
        var e,
            t,
            i = (n[this] || "").split(" ");1 === i.length && (i = l.test(i[0]) ? i.concat(["center"]) : u.test(i[0]) ? ["center"].concat(i) : ["center", "center"]), i[0] = l.test(i[0]) ? i[0] : "center", i[1] = u.test(i[1]) ? i[1] : "center", e = d.exec(i[0]), t = d.exec(i[1]), T[this] = [e ? e[0] : 0, t ? t[0] : 0], n[this] = [c.exec(i[0])[0], c.exec(i[1])[0]];
      }), 1 === k.length && (k[1] = k[0]), "right" === n.at[0] ? y.left += m : "center" === n.at[0] && (y.left += m / 2), "bottom" === n.at[1] ? y.top += g : "center" === n.at[1] && (y.top += g / 2), p = t(T.at, m, g), y.left += p[0], y.top += p[1], this.each(function () {
        var s,
            l,
            u = e(this),
            d = u.outerWidth(),
            c = u.outerHeight(),
            f = i(this, "marginLeft"),
            b = i(this, "marginTop"),
            D = d + f + i(this, "marginRight") + w.width,
            S = c + b + i(this, "marginBottom") + w.height,
            N = e.extend({}, y),
            M = t(T.my, u.outerWidth(), u.outerHeight());"right" === n.my[0] ? N.left -= d : "center" === n.my[0] && (N.left -= d / 2), "bottom" === n.my[1] ? N.top -= c : "center" === n.my[1] && (N.top -= c / 2), N.left += M[0], N.top += M[1], a || (N.left = h(N.left), N.top = h(N.top)), s = { marginLeft: f, marginTop: b }, e.each(["left", "top"], function (t, i) {
          e.ui.position[k[t]] && e.ui.position[k[t]][i](N, { targetWidth: m, targetHeight: g, elemWidth: d, elemHeight: c, collisionPosition: s, collisionWidth: D, collisionHeight: S, offset: [p[0] + M[0], p[1] + M[1]], my: n.my, at: n.at, within: x, elem: u });
        }), n.using && (l = function l(e) {
          var t = v.left - N.left,
              i = t + m - d,
              s = v.top - N.top,
              a = s + g - c,
              h = { target: { element: _, left: v.left, top: v.top, width: m, height: g }, element: { element: u, left: N.left, top: N.top, width: d, height: c }, horizontal: 0 > i ? "left" : t > 0 ? "right" : "center", vertical: 0 > a ? "top" : s > 0 ? "bottom" : "middle" };d > m && m > r(t + i) && (h.horizontal = "center"), c > g && g > r(s + a) && (h.vertical = "middle"), h.important = o(r(t), r(i)) > o(r(s), r(a)) ? "horizontal" : "vertical", n.using.call(this, e, h);
        }), u.offset(e.extend(N, { using: l }));
      });
    }, e.ui.position = { fit: { left: function left(e, t) {
          var i,
              s = t.within,
              n = s.isWindow ? s.scrollLeft : s.offset.left,
              a = s.width,
              r = e.left - t.collisionPosition.marginLeft,
              h = n - r,
              l = r + t.collisionWidth - a - n;t.collisionWidth > a ? h > 0 && 0 >= l ? (i = e.left + h + t.collisionWidth - a - n, e.left += h - i) : e.left = l > 0 && 0 >= h ? n : h > l ? n + a - t.collisionWidth : n : h > 0 ? e.left += h : l > 0 ? e.left -= l : e.left = o(e.left - r, e.left);
        }, top: function top(e, t) {
          var i,
              s = t.within,
              n = s.isWindow ? s.scrollTop : s.offset.top,
              a = t.within.height,
              r = e.top - t.collisionPosition.marginTop,
              h = n - r,
              l = r + t.collisionHeight - a - n;t.collisionHeight > a ? h > 0 && 0 >= l ? (i = e.top + h + t.collisionHeight - a - n, e.top += h - i) : e.top = l > 0 && 0 >= h ? n : h > l ? n + a - t.collisionHeight : n : h > 0 ? e.top += h : l > 0 ? e.top -= l : e.top = o(e.top - r, e.top);
        } }, flip: { left: function left(e, t) {
          var i,
              s,
              n = t.within,
              a = n.offset.left + n.scrollLeft,
              o = n.width,
              h = n.isWindow ? n.scrollLeft : n.offset.left,
              l = e.left - t.collisionPosition.marginLeft,
              u = l - h,
              d = l + t.collisionWidth - o - h,
              c = "left" === t.my[0] ? -t.elemWidth : "right" === t.my[0] ? t.elemWidth : 0,
              p = "left" === t.at[0] ? t.targetWidth : "right" === t.at[0] ? -t.targetWidth : 0,
              f = -2 * t.offset[0];0 > u ? (i = e.left + c + p + f + t.collisionWidth - o - a, (0 > i || r(u) > i) && (e.left += c + p + f)) : d > 0 && (s = e.left - t.collisionPosition.marginLeft + c + p + f - h, (s > 0 || d > r(s)) && (e.left += c + p + f));
        }, top: function top(e, t) {
          var i,
              s,
              n = t.within,
              a = n.offset.top + n.scrollTop,
              o = n.height,
              h = n.isWindow ? n.scrollTop : n.offset.top,
              l = e.top - t.collisionPosition.marginTop,
              u = l - h,
              d = l + t.collisionHeight - o - h,
              c = "top" === t.my[1],
              p = c ? -t.elemHeight : "bottom" === t.my[1] ? t.elemHeight : 0,
              f = "top" === t.at[1] ? t.targetHeight : "bottom" === t.at[1] ? -t.targetHeight : 0,
              m = -2 * t.offset[1];0 > u ? (s = e.top + p + f + m + t.collisionHeight - o - a, (0 > s || r(u) > s) && (e.top += p + f + m)) : d > 0 && (i = e.top - t.collisionPosition.marginTop + p + f + m - h, (i > 0 || d > r(i)) && (e.top += p + f + m));
        } }, flipfit: { left: function left() {
          e.ui.position.flip.left.apply(this, arguments), e.ui.position.fit.left.apply(this, arguments);
        }, top: function top() {
          e.ui.position.flip.top.apply(this, arguments), e.ui.position.fit.top.apply(this, arguments);
        } } }, function () {
      var t,
          i,
          s,
          n,
          o,
          r = document.getElementsByTagName("body")[0],
          h = document.createElement("div");t = document.createElement(r ? "div" : "body"), s = { visibility: "hidden", width: 0, height: 0, border: 0, margin: 0, background: "none" }, r && e.extend(s, { position: "absolute", left: "-1000px", top: "-1000px" });for (o in s) {
        t.style[o] = s[o];
      }t.appendChild(h), i = r || document.documentElement, i.insertBefore(t, i.firstChild), h.style.cssText = "position: absolute; left: 10.7432222px;", n = e(h).offset().left, a = n > 10 && 11 > n, t.innerHTML = "", i.removeChild(t);
    }();
  }(), e.ui.position, e.widget("ui.draggable", e.ui.mouse, { version: "1.11.4", widgetEventPrefix: "drag", options: { addClasses: !0, appendTo: "parent", axis: !1, connectToSortable: !1, containment: !1, cursor: "auto", cursorAt: !1, grid: !1, handle: !1, helper: "original", iframeFix: !1, opacity: !1, refreshPositions: !1, revert: !1, revertDuration: 500, scope: "default", scroll: !0, scrollSensitivity: 20, scrollSpeed: 20, snap: !1, snapMode: "both", snapTolerance: 20, stack: !1, zIndex: !1, drag: null, start: null, stop: null }, _create: function _create() {
      "original" === this.options.helper && this._setPositionRelative(), this.options.addClasses && this.element.addClass("ui-draggable"), this.options.disabled && this.element.addClass("ui-draggable-disabled"), this._setHandleClassName(), this._mouseInit();
    }, _setOption: function _setOption(e, t) {
      this._super(e, t), "handle" === e && (this._removeHandleClassName(), this._setHandleClassName());
    }, _destroy: function _destroy() {
      return (this.helper || this.element).is(".ui-draggable-dragging") ? (this.destroyOnClear = !0, void 0) : (this.element.removeClass("ui-draggable ui-draggable-dragging ui-draggable-disabled"), this._removeHandleClassName(), this._mouseDestroy(), void 0);
    }, _mouseCapture: function _mouseCapture(t) {
      var i = this.options;return this._blurActiveElement(t), this.helper || i.disabled || e(t.target).closest(".ui-resizable-handle").length > 0 ? !1 : (this.handle = this._getHandle(t), this.handle ? (this._blockFrames(i.iframeFix === !0 ? "iframe" : i.iframeFix), !0) : !1);
    }, _blockFrames: function _blockFrames(t) {
      this.iframeBlocks = this.document.find(t).map(function () {
        var t = e(this);return e("<div>").css("position", "absolute").appendTo(t.parent()).outerWidth(t.outerWidth()).outerHeight(t.outerHeight()).offset(t.offset())[0];
      });
    }, _unblockFrames: function _unblockFrames() {
      this.iframeBlocks && (this.iframeBlocks.remove(), delete this.iframeBlocks);
    }, _blurActiveElement: function _blurActiveElement(t) {
      var i = this.document[0];if (this.handleElement.is(t.target)) try {
        i.activeElement && "body" !== i.activeElement.nodeName.toLowerCase() && e(i.activeElement).blur();
      } catch (s) {}
    }, _mouseStart: function _mouseStart(t) {
      var i = this.options;return this.helper = this._createHelper(t), this.helper.addClass("ui-draggable-dragging"), this._cacheHelperProportions(), e.ui.ddmanager && (e.ui.ddmanager.current = this), this._cacheMargins(), this.cssPosition = this.helper.css("position"), this.scrollParent = this.helper.scrollParent(!0), this.offsetParent = this.helper.offsetParent(), this.hasFixedAncestor = this.helper.parents().filter(function () {
        return "fixed" === e(this).css("position");
      }).length > 0, this.positionAbs = this.element.offset(), this._refreshOffsets(t), this.originalPosition = this.position = this._generatePosition(t, !1), this.originalPageX = t.pageX, this.originalPageY = t.pageY, i.cursorAt && this._adjustOffsetFromHelper(i.cursorAt), this._setContainment(), this._trigger("start", t) === !1 ? (this._clear(), !1) : (this._cacheHelperProportions(), e.ui.ddmanager && !i.dropBehaviour && e.ui.ddmanager.prepareOffsets(this, t), this._normalizeRightBottom(), this._mouseDrag(t, !0), e.ui.ddmanager && e.ui.ddmanager.dragStart(this, t), !0);
    }, _refreshOffsets: function _refreshOffsets(e) {
      this.offset = { top: this.positionAbs.top - this.margins.top, left: this.positionAbs.left - this.margins.left, scroll: !1, parent: this._getParentOffset(), relative: this._getRelativeOffset() }, this.offset.click = { left: e.pageX - this.offset.left, top: e.pageY - this.offset.top };
    }, _mouseDrag: function _mouseDrag(t, i) {
      if (this.hasFixedAncestor && (this.offset.parent = this._getParentOffset()), this.position = this._generatePosition(t, !0), this.positionAbs = this._convertPositionTo("absolute"), !i) {
        var s = this._uiHash();if (this._trigger("drag", t, s) === !1) return this._mouseUp({}), !1;this.position = s.position;
      }return this.helper[0].style.left = this.position.left + "px", this.helper[0].style.top = this.position.top + "px", e.ui.ddmanager && e.ui.ddmanager.drag(this, t), !1;
    }, _mouseStop: function _mouseStop(t) {
      var i = this,
          s = !1;return e.ui.ddmanager && !this.options.dropBehaviour && (s = e.ui.ddmanager.drop(this, t)), this.dropped && (s = this.dropped, this.dropped = !1), "invalid" === this.options.revert && !s || "valid" === this.options.revert && s || this.options.revert === !0 || e.isFunction(this.options.revert) && this.options.revert.call(this.element, s) ? e(this.helper).animate(this.originalPosition, parseInt(this.options.revertDuration, 10), function () {
        i._trigger("stop", t) !== !1 && i._clear();
      }) : this._trigger("stop", t) !== !1 && this._clear(), !1;
    }, _mouseUp: function _mouseUp(t) {
      return this._unblockFrames(), e.ui.ddmanager && e.ui.ddmanager.dragStop(this, t), this.handleElement.is(t.target) && this.element.focus(), e.ui.mouse.prototype._mouseUp.call(this, t);
    }, cancel: function cancel() {
      return this.helper.is(".ui-draggable-dragging") ? this._mouseUp({}) : this._clear(), this;
    }, _getHandle: function _getHandle(t) {
      return this.options.handle ? !!e(t.target).closest(this.element.find(this.options.handle)).length : !0;
    }, _setHandleClassName: function _setHandleClassName() {
      this.handleElement = this.options.handle ? this.element.find(this.options.handle) : this.element, this.handleElement.addClass("ui-draggable-handle");
    }, _removeHandleClassName: function _removeHandleClassName() {
      this.handleElement.removeClass("ui-draggable-handle");
    }, _createHelper: function _createHelper(t) {
      var i = this.options,
          s = e.isFunction(i.helper),
          n = s ? e(i.helper.apply(this.element[0], [t])) : "clone" === i.helper ? this.element.clone().removeAttr("id") : this.element;return n.parents("body").length || n.appendTo("parent" === i.appendTo ? this.element[0].parentNode : i.appendTo), s && n[0] === this.element[0] && this._setPositionRelative(), n[0] === this.element[0] || /(fixed|absolute)/.test(n.css("position")) || n.css("position", "absolute"), n;
    }, _setPositionRelative: function _setPositionRelative() {
      /^(?:r|a|f)/.test(this.element.css("position")) || (this.element[0].style.position = "relative");
    }, _adjustOffsetFromHelper: function _adjustOffsetFromHelper(t) {
      "string" == typeof t && (t = t.split(" ")), e.isArray(t) && (t = { left: +t[0], top: +t[1] || 0 }), "left" in t && (this.offset.click.left = t.left + this.margins.left), "right" in t && (this.offset.click.left = this.helperProportions.width - t.right + this.margins.left), "top" in t && (this.offset.click.top = t.top + this.margins.top), "bottom" in t && (this.offset.click.top = this.helperProportions.height - t.bottom + this.margins.top);
    }, _isRootNode: function _isRootNode(e) {
      return (/(html|body)/i.test(e.tagName) || e === this.document[0]
      );
    }, _getParentOffset: function _getParentOffset() {
      var t = this.offsetParent.offset(),
          i = this.document[0];return "absolute" === this.cssPosition && this.scrollParent[0] !== i && e.contains(this.scrollParent[0], this.offsetParent[0]) && (t.left += this.scrollParent.scrollLeft(), t.top += this.scrollParent.scrollTop()), this._isRootNode(this.offsetParent[0]) && (t = { top: 0, left: 0 }), { top: t.top + (parseInt(this.offsetParent.css("borderTopWidth"), 10) || 0), left: t.left + (parseInt(this.offsetParent.css("borderLeftWidth"), 10) || 0) };
    }, _getRelativeOffset: function _getRelativeOffset() {
      if ("relative" !== this.cssPosition) return { top: 0, left: 0 };var e = this.element.position(),
          t = this._isRootNode(this.scrollParent[0]);return { top: e.top - (parseInt(this.helper.css("top"), 10) || 0) + (t ? 0 : this.scrollParent.scrollTop()), left: e.left - (parseInt(this.helper.css("left"), 10) || 0) + (t ? 0 : this.scrollParent.scrollLeft()) };
    }, _cacheMargins: function _cacheMargins() {
      this.margins = { left: parseInt(this.element.css("marginLeft"), 10) || 0, top: parseInt(this.element.css("marginTop"), 10) || 0, right: parseInt(this.element.css("marginRight"), 10) || 0, bottom: parseInt(this.element.css("marginBottom"), 10) || 0 };
    }, _cacheHelperProportions: function _cacheHelperProportions() {
      this.helperProportions = { width: this.helper.outerWidth(), height: this.helper.outerHeight() };
    }, _setContainment: function _setContainment() {
      var t,
          i,
          s,
          n = this.options,
          a = this.document[0];return this.relativeContainer = null, n.containment ? "window" === n.containment ? (this.containment = [e(window).scrollLeft() - this.offset.relative.left - this.offset.parent.left, e(window).scrollTop() - this.offset.relative.top - this.offset.parent.top, e(window).scrollLeft() + e(window).width() - this.helperProportions.width - this.margins.left, e(window).scrollTop() + (e(window).height() || a.body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top], void 0) : "document" === n.containment ? (this.containment = [0, 0, e(a).width() - this.helperProportions.width - this.margins.left, (e(a).height() || a.body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top], void 0) : n.containment.constructor === Array ? (this.containment = n.containment, void 0) : ("parent" === n.containment && (n.containment = this.helper[0].parentNode), i = e(n.containment), s = i[0], s && (t = /(scroll|auto)/.test(i.css("overflow")), this.containment = [(parseInt(i.css("borderLeftWidth"), 10) || 0) + (parseInt(i.css("paddingLeft"), 10) || 0), (parseInt(i.css("borderTopWidth"), 10) || 0) + (parseInt(i.css("paddingTop"), 10) || 0), (t ? Math.max(s.scrollWidth, s.offsetWidth) : s.offsetWidth) - (parseInt(i.css("borderRightWidth"), 10) || 0) - (parseInt(i.css("paddingRight"), 10) || 0) - this.helperProportions.width - this.margins.left - this.margins.right, (t ? Math.max(s.scrollHeight, s.offsetHeight) : s.offsetHeight) - (parseInt(i.css("borderBottomWidth"), 10) || 0) - (parseInt(i.css("paddingBottom"), 10) || 0) - this.helperProportions.height - this.margins.top - this.margins.bottom], this.relativeContainer = i), void 0) : (this.containment = null, void 0);
    }, _convertPositionTo: function _convertPositionTo(e, t) {
      t || (t = this.position);var i = "absolute" === e ? 1 : -1,
          s = this._isRootNode(this.scrollParent[0]);return { top: t.top + this.offset.relative.top * i + this.offset.parent.top * i - ("fixed" === this.cssPosition ? -this.offset.scroll.top : s ? 0 : this.offset.scroll.top) * i, left: t.left + this.offset.relative.left * i + this.offset.parent.left * i - ("fixed" === this.cssPosition ? -this.offset.scroll.left : s ? 0 : this.offset.scroll.left) * i };
    }, _generatePosition: function _generatePosition(e, t) {
      var i,
          s,
          n,
          a,
          o = this.options,
          r = this._isRootNode(this.scrollParent[0]),
          h = e.pageX,
          l = e.pageY;return r && this.offset.scroll || (this.offset.scroll = { top: this.scrollParent.scrollTop(), left: this.scrollParent.scrollLeft() }), t && (this.containment && (this.relativeContainer ? (s = this.relativeContainer.offset(), i = [this.containment[0] + s.left, this.containment[1] + s.top, this.containment[2] + s.left, this.containment[3] + s.top]) : i = this.containment, e.pageX - this.offset.click.left < i[0] && (h = i[0] + this.offset.click.left), e.pageY - this.offset.click.top < i[1] && (l = i[1] + this.offset.click.top), e.pageX - this.offset.click.left > i[2] && (h = i[2] + this.offset.click.left), e.pageY - this.offset.click.top > i[3] && (l = i[3] + this.offset.click.top)), o.grid && (n = o.grid[1] ? this.originalPageY + Math.round((l - this.originalPageY) / o.grid[1]) * o.grid[1] : this.originalPageY, l = i ? n - this.offset.click.top >= i[1] || n - this.offset.click.top > i[3] ? n : n - this.offset.click.top >= i[1] ? n - o.grid[1] : n + o.grid[1] : n, a = o.grid[0] ? this.originalPageX + Math.round((h - this.originalPageX) / o.grid[0]) * o.grid[0] : this.originalPageX, h = i ? a - this.offset.click.left >= i[0] || a - this.offset.click.left > i[2] ? a : a - this.offset.click.left >= i[0] ? a - o.grid[0] : a + o.grid[0] : a), "y" === o.axis && (h = this.originalPageX), "x" === o.axis && (l = this.originalPageY)), { top: l - this.offset.click.top - this.offset.relative.top - this.offset.parent.top + ("fixed" === this.cssPosition ? -this.offset.scroll.top : r ? 0 : this.offset.scroll.top), left: h - this.offset.click.left - this.offset.relative.left - this.offset.parent.left + ("fixed" === this.cssPosition ? -this.offset.scroll.left : r ? 0 : this.offset.scroll.left) };
    }, _clear: function _clear() {
      this.helper.removeClass("ui-draggable-dragging"), this.helper[0] === this.element[0] || this.cancelHelperRemoval || this.helper.remove(), this.helper = null, this.cancelHelperRemoval = !1, this.destroyOnClear && this.destroy();
    }, _normalizeRightBottom: function _normalizeRightBottom() {
      "y" !== this.options.axis && "auto" !== this.helper.css("right") && (this.helper.width(this.helper.width()), this.helper.css("right", "auto")), "x" !== this.options.axis && "auto" !== this.helper.css("bottom") && (this.helper.height(this.helper.height()), this.helper.css("bottom", "auto"));
    }, _trigger: function _trigger(t, i, s) {
      return s = s || this._uiHash(), e.ui.plugin.call(this, t, [i, s, this], !0), /^(drag|start|stop)/.test(t) && (this.positionAbs = this._convertPositionTo("absolute"), s.offset = this.positionAbs), e.Widget.prototype._trigger.call(this, t, i, s);
    }, plugins: {}, _uiHash: function _uiHash() {
      return { helper: this.helper, position: this.position, originalPosition: this.originalPosition, offset: this.positionAbs };
    } }), e.ui.plugin.add("draggable", "connectToSortable", { start: function start(t, i, s) {
      var n = e.extend({}, i, { item: s.element });s.sortables = [], e(s.options.connectToSortable).each(function () {
        var i = e(this).sortable("instance");i && !i.options.disabled && (s.sortables.push(i), i.refreshPositions(), i._trigger("activate", t, n));
      });
    }, stop: function stop(t, i, s) {
      var n = e.extend({}, i, { item: s.element });s.cancelHelperRemoval = !1, e.each(s.sortables, function () {
        var e = this;e.isOver ? (e.isOver = 0, s.cancelHelperRemoval = !0, e.cancelHelperRemoval = !1, e._storedCSS = { position: e.placeholder.css("position"), top: e.placeholder.css("top"), left: e.placeholder.css("left") }, e._mouseStop(t), e.options.helper = e.options._helper) : (e.cancelHelperRemoval = !0, e._trigger("deactivate", t, n));
      });
    }, drag: function drag(t, i, s) {
      e.each(s.sortables, function () {
        var n = !1,
            a = this;a.positionAbs = s.positionAbs, a.helperProportions = s.helperProportions, a.offset.click = s.offset.click, a._intersectsWith(a.containerCache) && (n = !0, e.each(s.sortables, function () {
          return this.positionAbs = s.positionAbs, this.helperProportions = s.helperProportions, this.offset.click = s.offset.click, this !== a && this._intersectsWith(this.containerCache) && e.contains(a.element[0], this.element[0]) && (n = !1), n;
        })), n ? (a.isOver || (a.isOver = 1, s._parent = i.helper.parent(), a.currentItem = i.helper.appendTo(a.element).data("ui-sortable-item", !0), a.options._helper = a.options.helper, a.options.helper = function () {
          return i.helper[0];
        }, t.target = a.currentItem[0], a._mouseCapture(t, !0), a._mouseStart(t, !0, !0), a.offset.click.top = s.offset.click.top, a.offset.click.left = s.offset.click.left, a.offset.parent.left -= s.offset.parent.left - a.offset.parent.left, a.offset.parent.top -= s.offset.parent.top - a.offset.parent.top, s._trigger("toSortable", t), s.dropped = a.element, e.each(s.sortables, function () {
          this.refreshPositions();
        }), s.currentItem = s.element, a.fromOutside = s), a.currentItem && (a._mouseDrag(t), i.position = a.position)) : a.isOver && (a.isOver = 0, a.cancelHelperRemoval = !0, a.options._revert = a.options.revert, a.options.revert = !1, a._trigger("out", t, a._uiHash(a)), a._mouseStop(t, !0), a.options.revert = a.options._revert, a.options.helper = a.options._helper, a.placeholder && a.placeholder.remove(), i.helper.appendTo(s._parent), s._refreshOffsets(t), i.position = s._generatePosition(t, !0), s._trigger("fromSortable", t), s.dropped = !1, e.each(s.sortables, function () {
          this.refreshPositions();
        }));
      });
    } }), e.ui.plugin.add("draggable", "cursor", { start: function start(t, i, s) {
      var n = e("body"),
          a = s.options;n.css("cursor") && (a._cursor = n.css("cursor")), n.css("cursor", a.cursor);
    }, stop: function stop(t, i, s) {
      var n = s.options;n._cursor && e("body").css("cursor", n._cursor);
    } }), e.ui.plugin.add("draggable", "opacity", { start: function start(t, i, s) {
      var n = e(i.helper),
          a = s.options;n.css("opacity") && (a._opacity = n.css("opacity")), n.css("opacity", a.opacity);
    }, stop: function stop(t, i, s) {
      var n = s.options;n._opacity && e(i.helper).css("opacity", n._opacity);
    } }), e.ui.plugin.add("draggable", "scroll", { start: function start(e, t, i) {
      i.scrollParentNotHidden || (i.scrollParentNotHidden = i.helper.scrollParent(!1)), i.scrollParentNotHidden[0] !== i.document[0] && "HTML" !== i.scrollParentNotHidden[0].tagName && (i.overflowOffset = i.scrollParentNotHidden.offset());
    }, drag: function drag(t, i, s) {
      var n = s.options,
          a = !1,
          o = s.scrollParentNotHidden[0],
          r = s.document[0];o !== r && "HTML" !== o.tagName ? (n.axis && "x" === n.axis || (s.overflowOffset.top + o.offsetHeight - t.pageY < n.scrollSensitivity ? o.scrollTop = a = o.scrollTop + n.scrollSpeed : t.pageY - s.overflowOffset.top < n.scrollSensitivity && (o.scrollTop = a = o.scrollTop - n.scrollSpeed)), n.axis && "y" === n.axis || (s.overflowOffset.left + o.offsetWidth - t.pageX < n.scrollSensitivity ? o.scrollLeft = a = o.scrollLeft + n.scrollSpeed : t.pageX - s.overflowOffset.left < n.scrollSensitivity && (o.scrollLeft = a = o.scrollLeft - n.scrollSpeed))) : (n.axis && "x" === n.axis || (t.pageY - e(r).scrollTop() < n.scrollSensitivity ? a = e(r).scrollTop(e(r).scrollTop() - n.scrollSpeed) : e(window).height() - (t.pageY - e(r).scrollTop()) < n.scrollSensitivity && (a = e(r).scrollTop(e(r).scrollTop() + n.scrollSpeed))), n.axis && "y" === n.axis || (t.pageX - e(r).scrollLeft() < n.scrollSensitivity ? a = e(r).scrollLeft(e(r).scrollLeft() - n.scrollSpeed) : e(window).width() - (t.pageX - e(r).scrollLeft()) < n.scrollSensitivity && (a = e(r).scrollLeft(e(r).scrollLeft() + n.scrollSpeed)))), a !== !1 && e.ui.ddmanager && !n.dropBehaviour && e.ui.ddmanager.prepareOffsets(s, t);
    } }), e.ui.plugin.add("draggable", "snap", { start: function start(t, i, s) {
      var n = s.options;s.snapElements = [], e(n.snap.constructor !== String ? n.snap.items || ":data(ui-draggable)" : n.snap).each(function () {
        var t = e(this),
            i = t.offset();this !== s.element[0] && s.snapElements.push({ item: this, width: t.outerWidth(), height: t.outerHeight(), top: i.top, left: i.left });
      });
    }, drag: function drag(t, i, s) {
      var n,
          a,
          o,
          r,
          h,
          l,
          u,
          d,
          c,
          p,
          f = s.options,
          m = f.snapTolerance,
          g = i.offset.left,
          v = g + s.helperProportions.width,
          y = i.offset.top,
          b = y + s.helperProportions.height;for (c = s.snapElements.length - 1; c >= 0; c--) {
        h = s.snapElements[c].left - s.margins.left, l = h + s.snapElements[c].width, u = s.snapElements[c].top - s.margins.top, d = u + s.snapElements[c].height, h - m > v || g > l + m || u - m > b || y > d + m || !e.contains(s.snapElements[c].item.ownerDocument, s.snapElements[c].item) ? (s.snapElements[c].snapping && s.options.snap.release && s.options.snap.release.call(s.element, t, e.extend(s._uiHash(), { snapItem: s.snapElements[c].item })), s.snapElements[c].snapping = !1) : ("inner" !== f.snapMode && (n = m >= Math.abs(u - b), a = m >= Math.abs(d - y), o = m >= Math.abs(h - v), r = m >= Math.abs(l - g), n && (i.position.top = s._convertPositionTo("relative", { top: u - s.helperProportions.height, left: 0 }).top), a && (i.position.top = s._convertPositionTo("relative", { top: d, left: 0 }).top), o && (i.position.left = s._convertPositionTo("relative", { top: 0, left: h - s.helperProportions.width }).left), r && (i.position.left = s._convertPositionTo("relative", { top: 0, left: l }).left)), p = n || a || o || r, "outer" !== f.snapMode && (n = m >= Math.abs(u - y), a = m >= Math.abs(d - b), o = m >= Math.abs(h - g), r = m >= Math.abs(l - v), n && (i.position.top = s._convertPositionTo("relative", { top: u, left: 0 }).top), a && (i.position.top = s._convertPositionTo("relative", { top: d - s.helperProportions.height, left: 0 }).top), o && (i.position.left = s._convertPositionTo("relative", { top: 0, left: h }).left), r && (i.position.left = s._convertPositionTo("relative", { top: 0, left: l - s.helperProportions.width }).left)), !s.snapElements[c].snapping && (n || a || o || r || p) && s.options.snap.snap && s.options.snap.snap.call(s.element, t, e.extend(s._uiHash(), { snapItem: s.snapElements[c].item })), s.snapElements[c].snapping = n || a || o || r || p);
      }
    } }), e.ui.plugin.add("draggable", "stack", { start: function start(t, i, s) {
      var n,
          a = s.options,
          o = e.makeArray(e(a.stack)).sort(function (t, i) {
        return (parseInt(e(t).css("zIndex"), 10) || 0) - (parseInt(e(i).css("zIndex"), 10) || 0);
      });o.length && (n = parseInt(e(o[0]).css("zIndex"), 10) || 0, e(o).each(function (t) {
        e(this).css("zIndex", n + t);
      }), this.css("zIndex", n + o.length));
    } }), e.ui.plugin.add("draggable", "zIndex", { start: function start(t, i, s) {
      var n = e(i.helper),
          a = s.options;n.css("zIndex") && (a._zIndex = n.css("zIndex")), n.css("zIndex", a.zIndex);
    }, stop: function stop(t, i, s) {
      var n = s.options;n._zIndex && e(i.helper).css("zIndex", n._zIndex);
    } }), e.ui.draggable, e.widget("ui.droppable", { version: "1.11.4", widgetEventPrefix: "drop", options: { accept: "*", activeClass: !1, addClasses: !0, greedy: !1, hoverClass: !1, scope: "default", tolerance: "intersect", activate: null, deactivate: null, drop: null, out: null, over: null }, _create: function _create() {
      var t,
          i = this.options,
          s = i.accept;this.isover = !1, this.isout = !0, this.accept = e.isFunction(s) ? s : function (e) {
        return e.is(s);
      }, this.proportions = function () {
        return arguments.length ? (t = arguments[0], void 0) : t ? t : t = { width: this.element[0].offsetWidth, height: this.element[0].offsetHeight };
      }, this._addToManager(i.scope), i.addClasses && this.element.addClass("ui-droppable");
    }, _addToManager: function _addToManager(t) {
      e.ui.ddmanager.droppables[t] = e.ui.ddmanager.droppables[t] || [], e.ui.ddmanager.droppables[t].push(this);
    }, _splice: function _splice(e) {
      for (var t = 0; e.length > t; t++) {
        e[t] === this && e.splice(t, 1);
      }
    }, _destroy: function _destroy() {
      var t = e.ui.ddmanager.droppables[this.options.scope];this._splice(t), this.element.removeClass("ui-droppable ui-droppable-disabled");
    }, _setOption: function _setOption(t, i) {
      if ("accept" === t) this.accept = e.isFunction(i) ? i : function (e) {
        return e.is(i);
      };else if ("scope" === t) {
        var s = e.ui.ddmanager.droppables[this.options.scope];this._splice(s), this._addToManager(i);
      }this._super(t, i);
    }, _activate: function _activate(t) {
      var i = e.ui.ddmanager.current;this.options.activeClass && this.element.addClass(this.options.activeClass), i && this._trigger("activate", t, this.ui(i));
    }, _deactivate: function _deactivate(t) {
      var i = e.ui.ddmanager.current;this.options.activeClass && this.element.removeClass(this.options.activeClass), i && this._trigger("deactivate", t, this.ui(i));
    }, _over: function _over(t) {
      var i = e.ui.ddmanager.current;i && (i.currentItem || i.element)[0] !== this.element[0] && this.accept.call(this.element[0], i.currentItem || i.element) && (this.options.hoverClass && this.element.addClass(this.options.hoverClass), this._trigger("over", t, this.ui(i)));
    }, _out: function _out(t) {
      var i = e.ui.ddmanager.current;i && (i.currentItem || i.element)[0] !== this.element[0] && this.accept.call(this.element[0], i.currentItem || i.element) && (this.options.hoverClass && this.element.removeClass(this.options.hoverClass), this._trigger("out", t, this.ui(i)));
    }, _drop: function _drop(t, i) {
      var s = i || e.ui.ddmanager.current,
          n = !1;return s && (s.currentItem || s.element)[0] !== this.element[0] ? (this.element.find(":data(ui-droppable)").not(".ui-draggable-dragging").each(function () {
        var i = e(this).droppable("instance");return i.options.greedy && !i.options.disabled && i.options.scope === s.options.scope && i.accept.call(i.element[0], s.currentItem || s.element) && e.ui.intersect(s, e.extend(i, { offset: i.element.offset() }), i.options.tolerance, t) ? (n = !0, !1) : void 0;
      }), n ? !1 : this.accept.call(this.element[0], s.currentItem || s.element) ? (this.options.activeClass && this.element.removeClass(this.options.activeClass), this.options.hoverClass && this.element.removeClass(this.options.hoverClass), this._trigger("drop", t, this.ui(s)), this.element) : !1) : !1;
    }, ui: function ui(e) {
      return { draggable: e.currentItem || e.element, helper: e.helper, position: e.position, offset: e.positionAbs };
    } }), e.ui.intersect = function () {
    function e(e, t, i) {
      return e >= t && t + i > e;
    }return function (t, i, s, n) {
      if (!i.offset) return !1;var a = (t.positionAbs || t.position.absolute).left + t.margins.left,
          o = (t.positionAbs || t.position.absolute).top + t.margins.top,
          r = a + t.helperProportions.width,
          h = o + t.helperProportions.height,
          l = i.offset.left,
          u = i.offset.top,
          d = l + i.proportions().width,
          c = u + i.proportions().height;switch (s) {case "fit":
          return a >= l && d >= r && o >= u && c >= h;case "intersect":
          return a + t.helperProportions.width / 2 > l && d > r - t.helperProportions.width / 2 && o + t.helperProportions.height / 2 > u && c > h - t.helperProportions.height / 2;case "pointer":
          return e(n.pageY, u, i.proportions().height) && e(n.pageX, l, i.proportions().width);case "touch":
          return (o >= u && c >= o || h >= u && c >= h || u > o && h > c) && (a >= l && d >= a || r >= l && d >= r || l > a && r > d);default:
          return !1;}
    };
  }(), e.ui.ddmanager = { current: null, droppables: { "default": [] }, prepareOffsets: function prepareOffsets(t, i) {
      var s,
          n,
          a = e.ui.ddmanager.droppables[t.options.scope] || [],
          o = i ? i.type : null,
          r = (t.currentItem || t.element).find(":data(ui-droppable)").addBack();e: for (s = 0; a.length > s; s++) {
        if (!(a[s].options.disabled || t && !a[s].accept.call(a[s].element[0], t.currentItem || t.element))) {
          for (n = 0; r.length > n; n++) {
            if (r[n] === a[s].element[0]) {
              a[s].proportions().height = 0;continue e;
            }
          }a[s].visible = "none" !== a[s].element.css("display"), a[s].visible && ("mousedown" === o && a[s]._activate.call(a[s], i), a[s].offset = a[s].element.offset(), a[s].proportions({ width: a[s].element[0].offsetWidth, height: a[s].element[0].offsetHeight }));
        }
      }
    }, drop: function drop(t, i) {
      var s = !1;return e.each((e.ui.ddmanager.droppables[t.options.scope] || []).slice(), function () {
        this.options && (!this.options.disabled && this.visible && e.ui.intersect(t, this, this.options.tolerance, i) && (s = this._drop.call(this, i) || s), !this.options.disabled && this.visible && this.accept.call(this.element[0], t.currentItem || t.element) && (this.isout = !0, this.isover = !1, this._deactivate.call(this, i)));
      }), s;
    }, dragStart: function dragStart(t, i) {
      t.element.parentsUntil("body").bind("scroll.droppable", function () {
        t.options.refreshPositions || e.ui.ddmanager.prepareOffsets(t, i);
      });
    }, drag: function drag(t, i) {
      t.options.refreshPositions && e.ui.ddmanager.prepareOffsets(t, i), e.each(e.ui.ddmanager.droppables[t.options.scope] || [], function () {
        if (!this.options.disabled && !this.greedyChild && this.visible) {
          var s,
              n,
              a,
              o = e.ui.intersect(t, this, this.options.tolerance, i),
              r = !o && this.isover ? "isout" : o && !this.isover ? "isover" : null;r && (this.options.greedy && (n = this.options.scope, a = this.element.parents(":data(ui-droppable)").filter(function () {
            return e(this).droppable("instance").options.scope === n;
          }), a.length && (s = e(a[0]).droppable("instance"), s.greedyChild = "isover" === r)), s && "isover" === r && (s.isover = !1, s.isout = !0, s._out.call(s, i)), this[r] = !0, this["isout" === r ? "isover" : "isout"] = !1, this["isover" === r ? "_over" : "_out"].call(this, i), s && "isout" === r && (s.isout = !1, s.isover = !0, s._over.call(s, i)));
        }
      });
    }, dragStop: function dragStop(t, i) {
      t.element.parentsUntil("body").unbind("scroll.droppable"), t.options.refreshPositions || e.ui.ddmanager.prepareOffsets(t, i);
    } }, e.ui.droppable, e.widget("ui.tooltip", { version: "1.11.4", options: { content: function content() {
        var t = e(this).attr("title") || "";return e("<a>").text(t).html();
      }, hide: !0, items: "[title]:not([disabled])", position: { my: "left top+15", at: "left bottom", collision: "flipfit flip" }, show: !0, tooltipClass: null, track: !1, close: null, open: null }, _addDescribedBy: function _addDescribedBy(t, i) {
      var s = (t.attr("aria-describedby") || "").split(/\s+/);s.push(i), t.data("ui-tooltip-id", i).attr("aria-describedby", e.trim(s.join(" ")));
    }, _removeDescribedBy: function _removeDescribedBy(t) {
      var i = t.data("ui-tooltip-id"),
          s = (t.attr("aria-describedby") || "").split(/\s+/),
          n = e.inArray(i, s);-1 !== n && s.splice(n, 1), t.removeData("ui-tooltip-id"), s = e.trim(s.join(" ")), s ? t.attr("aria-describedby", s) : t.removeAttr("aria-describedby");
    }, _create: function _create() {
      this._on({ mouseover: "open", focusin: "open" }), this.tooltips = {}, this.parents = {}, this.options.disabled && this._disable(), this.liveRegion = e("<div>").attr({ role: "log", "aria-live": "assertive", "aria-relevant": "additions" }).addClass("ui-helper-hidden-accessible").appendTo(this.document[0].body);
    }, _setOption: function _setOption(t, i) {
      var s = this;return "disabled" === t ? (this[i ? "_disable" : "_enable"](), this.options[t] = i, void 0) : (this._super(t, i), "content" === t && e.each(this.tooltips, function (e, t) {
        s._updateContent(t.element);
      }), void 0);
    }, _disable: function _disable() {
      var t = this;e.each(this.tooltips, function (i, s) {
        var n = e.Event("blur");n.target = n.currentTarget = s.element[0], t.close(n, !0);
      }), this.element.find(this.options.items).addBack().each(function () {
        var t = e(this);t.is("[title]") && t.data("ui-tooltip-title", t.attr("title")).removeAttr("title");
      });
    }, _enable: function _enable() {
      this.element.find(this.options.items).addBack().each(function () {
        var t = e(this);t.data("ui-tooltip-title") && t.attr("title", t.data("ui-tooltip-title"));
      });
    }, open: function open(t) {
      var i = this,
          s = e(t ? t.target : this.element).closest(this.options.items);s.length && !s.data("ui-tooltip-id") && (s.attr("title") && s.data("ui-tooltip-title", s.attr("title")), s.data("ui-tooltip-open", !0), t && "mouseover" === t.type && s.parents().each(function () {
        var t,
            s = e(this);s.data("ui-tooltip-open") && (t = e.Event("blur"), t.target = t.currentTarget = this, i.close(t, !0)), s.attr("title") && (s.uniqueId(), i.parents[this.id] = { element: this, title: s.attr("title") }, s.attr("title", ""));
      }), this._registerCloseHandlers(t, s), this._updateContent(s, t));
    }, _updateContent: function _updateContent(e, t) {
      var i,
          s = this.options.content,
          n = this,
          a = t ? t.type : null;return "string" == typeof s ? this._open(t, e, s) : (i = s.call(e[0], function (i) {
        n._delay(function () {
          e.data("ui-tooltip-open") && (t && (t.type = a), this._open(t, e, i));
        });
      }), i && this._open(t, e, i), void 0);
    }, _open: function _open(t, i, s) {
      function n(e) {
        l.of = e, o.is(":hidden") || o.position(l);
      }var a,
          o,
          r,
          h,
          l = e.extend({}, this.options.position);if (s) {
        if (a = this._find(i)) return a.tooltip.find(".ui-tooltip-content").html(s), void 0;i.is("[title]") && (t && "mouseover" === t.type ? i.attr("title", "") : i.removeAttr("title")), a = this._tooltip(i), o = a.tooltip, this._addDescribedBy(i, o.attr("id")), o.find(".ui-tooltip-content").html(s), this.liveRegion.children().hide(), s.clone ? (h = s.clone(), h.removeAttr("id").find("[id]").removeAttr("id")) : h = s, e("<div>").html(h).appendTo(this.liveRegion), this.options.track && t && /^mouse/.test(t.type) ? (this._on(this.document, { mousemove: n }), n(t)) : o.position(e.extend({ of: i }, this.options.position)), o.hide(), this._show(o, this.options.show), this.options.show && this.options.show.delay && (r = this.delayedShow = setInterval(function () {
          o.is(":visible") && (n(l.of), clearInterval(r));
        }, e.fx.interval)), this._trigger("open", t, { tooltip: o });
      }
    }, _registerCloseHandlers: function _registerCloseHandlers(t, i) {
      var s = { keyup: function keyup(t) {
          if (t.keyCode === e.ui.keyCode.ESCAPE) {
            var s = e.Event(t);s.currentTarget = i[0], this.close(s, !0);
          }
        } };i[0] !== this.element[0] && (s.remove = function () {
        this._removeTooltip(this._find(i).tooltip);
      }), t && "mouseover" !== t.type || (s.mouseleave = "close"), t && "focusin" !== t.type || (s.focusout = "close"), this._on(!0, i, s);
    }, close: function close(t) {
      var i,
          s = this,
          n = e(t ? t.currentTarget : this.element),
          a = this._find(n);return a ? (i = a.tooltip, a.closing || (clearInterval(this.delayedShow), n.data("ui-tooltip-title") && !n.attr("title") && n.attr("title", n.data("ui-tooltip-title")), this._removeDescribedBy(n), a.hiding = !0, i.stop(!0), this._hide(i, this.options.hide, function () {
        s._removeTooltip(e(this));
      }), n.removeData("ui-tooltip-open"), this._off(n, "mouseleave focusout keyup"), n[0] !== this.element[0] && this._off(n, "remove"), this._off(this.document, "mousemove"), t && "mouseleave" === t.type && e.each(this.parents, function (t, i) {
        e(i.element).attr("title", i.title), delete s.parents[t];
      }), a.closing = !0, this._trigger("close", t, { tooltip: i }), a.hiding || (a.closing = !1)), void 0) : (n.removeData("ui-tooltip-open"), void 0);
    }, _tooltip: function _tooltip(t) {
      var i = e("<div>").attr("role", "tooltip").addClass("ui-tooltip ui-widget ui-corner-all ui-widget-content " + (this.options.tooltipClass || "")),
          s = i.uniqueId().attr("id");return e("<div>").addClass("ui-tooltip-content").appendTo(i), i.appendTo(this.document[0].body), this.tooltips[s] = { element: t, tooltip: i };
    }, _find: function _find(e) {
      var t = e.data("ui-tooltip-id");return t ? this.tooltips[t] : null;
    }, _removeTooltip: function _removeTooltip(e) {
      e.remove(), delete this.tooltips[e.attr("id")];
    }, _destroy: function _destroy() {
      var t = this;e.each(this.tooltips, function (i, s) {
        var n = e.Event("blur"),
            a = s.element;n.target = n.currentTarget = a[0], t.close(n, !0), e("#" + i).remove(), a.data("ui-tooltip-title") && (a.attr("title") || a.attr("title", a.data("ui-tooltip-title")), a.removeData("ui-tooltip-title"));
      }), this.liveRegion.remove();
    } });var o = "ui-effects-",
      r = e;e.effects = { effect: {} }, function (e, t) {
    function i(e, t, i) {
      var s = d[t.type] || {};return null == e ? i || !t.def ? null : t.def : (e = s.floor ? ~~e : parseFloat(e), isNaN(e) ? t.def : s.mod ? (e + s.mod) % s.mod : 0 > e ? 0 : e > s.max ? s.max : e);
    }function s(i) {
      var s = l(),
          n = s._rgba = [];return i = i.toLowerCase(), f(h, function (e, a) {
        var o,
            r = a.re.exec(i),
            h = r && a.parse(r),
            l = a.space || "rgba";return h ? (o = s[l](h), s[u[l].cache] = o[u[l].cache], n = s._rgba = o._rgba, !1) : t;
      }), n.length ? ("0,0,0,0" === n.join() && e.extend(n, a.transparent), s) : a[i];
    }function n(e, t, i) {
      return i = (i + 1) % 1, 1 > 6 * i ? e + 6 * (t - e) * i : 1 > 2 * i ? t : 2 > 3 * i ? e + 6 * (t - e) * (2 / 3 - i) : e;
    }var a,
        o = "backgroundColor borderBottomColor borderLeftColor borderRightColor borderTopColor color columnRuleColor outlineColor textDecorationColor textEmphasisColor",
        r = /^([\-+])=\s*(\d+\.?\d*)/,
        h = [{ re: /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/, parse: function parse(e) {
        return [e[1], e[2], e[3], e[4]];
      } }, { re: /rgba?\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/, parse: function parse(e) {
        return [2.55 * e[1], 2.55 * e[2], 2.55 * e[3], e[4]];
      } }, { re: /#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})/, parse: function parse(e) {
        return [parseInt(e[1], 16), parseInt(e[2], 16), parseInt(e[3], 16)];
      } }, { re: /#([a-f0-9])([a-f0-9])([a-f0-9])/, parse: function parse(e) {
        return [parseInt(e[1] + e[1], 16), parseInt(e[2] + e[2], 16), parseInt(e[3] + e[3], 16)];
      } }, { re: /hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/, space: "hsla", parse: function parse(e) {
        return [e[1], e[2] / 100, e[3] / 100, e[4]];
      } }],
        l = e.Color = function (t, i, s, n) {
      return new e.Color.fn.parse(t, i, s, n);
    },
        u = { rgba: { props: { red: { idx: 0, type: "byte" }, green: { idx: 1, type: "byte" }, blue: { idx: 2, type: "byte" } } }, hsla: { props: { hue: { idx: 0, type: "degrees" }, saturation: { idx: 1, type: "percent" }, lightness: { idx: 2, type: "percent" } } } },
        d = { "byte": { floor: !0, max: 255 }, percent: { max: 1 }, degrees: { mod: 360, floor: !0 } },
        c = l.support = {},
        p = e("<p>")[0],
        f = e.each;p.style.cssText = "background-color:rgba(1,1,1,.5)", c.rgba = p.style.backgroundColor.indexOf("rgba") > -1, f(u, function (e, t) {
      t.cache = "_" + e, t.props.alpha = { idx: 3, type: "percent", def: 1 };
    }), l.fn = e.extend(l.prototype, { parse: function parse(n, o, r, h) {
        if (n === t) return this._rgba = [null, null, null, null], this;(n.jquery || n.nodeType) && (n = e(n).css(o), o = t);var d = this,
            c = e.type(n),
            p = this._rgba = [];return o !== t && (n = [n, o, r, h], c = "array"), "string" === c ? this.parse(s(n) || a._default) : "array" === c ? (f(u.rgba.props, function (e, t) {
          p[t.idx] = i(n[t.idx], t);
        }), this) : "object" === c ? (n instanceof l ? f(u, function (e, t) {
          n[t.cache] && (d[t.cache] = n[t.cache].slice());
        }) : f(u, function (t, s) {
          var a = s.cache;f(s.props, function (e, t) {
            if (!d[a] && s.to) {
              if ("alpha" === e || null == n[e]) return;d[a] = s.to(d._rgba);
            }d[a][t.idx] = i(n[e], t, !0);
          }), d[a] && 0 > e.inArray(null, d[a].slice(0, 3)) && (d[a][3] = 1, s.from && (d._rgba = s.from(d[a])));
        }), this) : t;
      }, is: function is(e) {
        var i = l(e),
            s = !0,
            n = this;return f(u, function (e, a) {
          var o,
              r = i[a.cache];return r && (o = n[a.cache] || a.to && a.to(n._rgba) || [], f(a.props, function (e, i) {
            return null != r[i.idx] ? s = r[i.idx] === o[i.idx] : t;
          })), s;
        }), s;
      }, _space: function _space() {
        var e = [],
            t = this;return f(u, function (i, s) {
          t[s.cache] && e.push(i);
        }), e.pop();
      }, transition: function transition(e, t) {
        var s = l(e),
            n = s._space(),
            a = u[n],
            o = 0 === this.alpha() ? l("transparent") : this,
            r = o[a.cache] || a.to(o._rgba),
            h = r.slice();return s = s[a.cache], f(a.props, function (e, n) {
          var a = n.idx,
              o = r[a],
              l = s[a],
              u = d[n.type] || {};null !== l && (null === o ? h[a] = l : (u.mod && (l - o > u.mod / 2 ? o += u.mod : o - l > u.mod / 2 && (o -= u.mod)), h[a] = i((l - o) * t + o, n)));
        }), this[n](h);
      }, blend: function blend(t) {
        if (1 === this._rgba[3]) return this;var i = this._rgba.slice(),
            s = i.pop(),
            n = l(t)._rgba;return l(e.map(i, function (e, t) {
          return (1 - s) * n[t] + s * e;
        }));
      }, toRgbaString: function toRgbaString() {
        var t = "rgba(",
            i = e.map(this._rgba, function (e, t) {
          return null == e ? t > 2 ? 1 : 0 : e;
        });return 1 === i[3] && (i.pop(), t = "rgb("), t + i.join() + ")";
      }, toHslaString: function toHslaString() {
        var t = "hsla(",
            i = e.map(this.hsla(), function (e, t) {
          return null == e && (e = t > 2 ? 1 : 0), t && 3 > t && (e = Math.round(100 * e) + "%"), e;
        });return 1 === i[3] && (i.pop(), t = "hsl("), t + i.join() + ")";
      }, toHexString: function toHexString(t) {
        var i = this._rgba.slice(),
            s = i.pop();return t && i.push(~~(255 * s)), "#" + e.map(i, function (e) {
          return e = (e || 0).toString(16), 1 === e.length ? "0" + e : e;
        }).join("");
      }, toString: function toString() {
        return 0 === this._rgba[3] ? "transparent" : this.toRgbaString();
      } }), l.fn.parse.prototype = l.fn, u.hsla.to = function (e) {
      if (null == e[0] || null == e[1] || null == e[2]) return [null, null, null, e[3]];var t,
          i,
          s = e[0] / 255,
          n = e[1] / 255,
          a = e[2] / 255,
          o = e[3],
          r = Math.max(s, n, a),
          h = Math.min(s, n, a),
          l = r - h,
          u = r + h,
          d = .5 * u;return t = h === r ? 0 : s === r ? 60 * (n - a) / l + 360 : n === r ? 60 * (a - s) / l + 120 : 60 * (s - n) / l + 240, i = 0 === l ? 0 : .5 >= d ? l / u : l / (2 - u), [Math.round(t) % 360, i, d, null == o ? 1 : o];
    }, u.hsla.from = function (e) {
      if (null == e[0] || null == e[1] || null == e[2]) return [null, null, null, e[3]];var t = e[0] / 360,
          i = e[1],
          s = e[2],
          a = e[3],
          o = .5 >= s ? s * (1 + i) : s + i - s * i,
          r = 2 * s - o;return [Math.round(255 * n(r, o, t + 1 / 3)), Math.round(255 * n(r, o, t)), Math.round(255 * n(r, o, t - 1 / 3)), a];
    }, f(u, function (s, n) {
      var a = n.props,
          o = n.cache,
          h = n.to,
          u = n.from;l.fn[s] = function (s) {
        if (h && !this[o] && (this[o] = h(this._rgba)), s === t) return this[o].slice();var n,
            r = e.type(s),
            d = "array" === r || "object" === r ? s : arguments,
            c = this[o].slice();return f(a, function (e, t) {
          var s = d["object" === r ? e : t.idx];null == s && (s = c[t.idx]), c[t.idx] = i(s, t);
        }), u ? (n = l(u(c)), n[o] = c, n) : l(c);
      }, f(a, function (t, i) {
        l.fn[t] || (l.fn[t] = function (n) {
          var a,
              o = e.type(n),
              h = "alpha" === t ? this._hsla ? "hsla" : "rgba" : s,
              l = this[h](),
              u = l[i.idx];return "undefined" === o ? u : ("function" === o && (n = n.call(this, u), o = e.type(n)), null == n && i.empty ? this : ("string" === o && (a = r.exec(n), a && (n = u + parseFloat(a[2]) * ("+" === a[1] ? 1 : -1))), l[i.idx] = n, this[h](l)));
        });
      });
    }), l.hook = function (t) {
      var i = t.split(" ");f(i, function (t, i) {
        e.cssHooks[i] = { set: function set(t, n) {
            var a,
                o,
                r = "";if ("transparent" !== n && ("string" !== e.type(n) || (a = s(n)))) {
              if (n = l(a || n), !c.rgba && 1 !== n._rgba[3]) {
                for (o = "backgroundColor" === i ? t.parentNode : t; ("" === r || "transparent" === r) && o && o.style;) {
                  try {
                    r = e.css(o, "backgroundColor"), o = o.parentNode;
                  } catch (h) {}
                }n = n.blend(r && "transparent" !== r ? r : "_default");
              }n = n.toRgbaString();
            }try {
              t.style[i] = n;
            } catch (h) {}
          } }, e.fx.step[i] = function (t) {
          t.colorInit || (t.start = l(t.elem, i), t.end = l(t.end), t.colorInit = !0), e.cssHooks[i].set(t.elem, t.start.transition(t.end, t.pos));
        };
      });
    }, l.hook(o), e.cssHooks.borderColor = { expand: function expand(e) {
        var t = {};return f(["Top", "Right", "Bottom", "Left"], function (i, s) {
          t["border" + s + "Color"] = e;
        }), t;
      } }, a = e.Color.names = { aqua: "#00ffff", black: "#000000", blue: "#0000ff", fuchsia: "#ff00ff", gray: "#808080", green: "#008000", lime: "#00ff00", maroon: "#800000", navy: "#000080", olive: "#808000", purple: "#800080", red: "#ff0000", silver: "#c0c0c0", teal: "#008080", white: "#ffffff", yellow: "#ffff00", transparent: [null, null, null, 0], _default: "#ffffff" };
  }(r), function () {
    function t(t) {
      var i,
          s,
          n = t.ownerDocument.defaultView ? t.ownerDocument.defaultView.getComputedStyle(t, null) : t.currentStyle,
          a = {};if (n && n.length && n[0] && n[n[0]]) for (s = n.length; s--;) {
        i = n[s], "string" == typeof n[i] && (a[e.camelCase(i)] = n[i]);
      } else for (i in n) {
        "string" == typeof n[i] && (a[i] = n[i]);
      }return a;
    }function i(t, i) {
      var s,
          a,
          o = {};for (s in i) {
        a = i[s], t[s] !== a && (n[s] || (e.fx.step[s] || !isNaN(parseFloat(a))) && (o[s] = a));
      }return o;
    }var s = ["add", "remove", "toggle"],
        n = { border: 1, borderBottom: 1, borderColor: 1, borderLeft: 1, borderRight: 1, borderTop: 1, borderWidth: 1, margin: 1, padding: 1 };e.each(["borderLeftStyle", "borderRightStyle", "borderBottomStyle", "borderTopStyle"], function (t, i) {
      e.fx.step[i] = function (e) {
        ("none" !== e.end && !e.setAttr || 1 === e.pos && !e.setAttr) && (r.style(e.elem, i, e.end), e.setAttr = !0);
      };
    }), e.fn.addBack || (e.fn.addBack = function (e) {
      return this.add(null == e ? this.prevObject : this.prevObject.filter(e));
    }), e.effects.animateClass = function (n, a, o, r) {
      var h = e.speed(a, o, r);return this.queue(function () {
        var a,
            o = e(this),
            r = o.attr("class") || "",
            l = h.children ? o.find("*").addBack() : o;l = l.map(function () {
          var i = e(this);return { el: i, start: t(this) };
        }), a = function a() {
          e.each(s, function (e, t) {
            n[t] && o[t + "Class"](n[t]);
          });
        }, a(), l = l.map(function () {
          return this.end = t(this.el[0]), this.diff = i(this.start, this.end), this;
        }), o.attr("class", r), l = l.map(function () {
          var t = this,
              i = e.Deferred(),
              s = e.extend({}, h, { queue: !1, complete: function complete() {
              i.resolve(t);
            } });return this.el.animate(this.diff, s), i.promise();
        }), e.when.apply(e, l.get()).done(function () {
          a(), e.each(arguments, function () {
            var t = this.el;e.each(this.diff, function (e) {
              t.css(e, "");
            });
          }), h.complete.call(o[0]);
        });
      });
    }, e.fn.extend({ addClass: function (t) {
        return function (i, s, n, a) {
          return s ? e.effects.animateClass.call(this, { add: i }, s, n, a) : t.apply(this, arguments);
        };
      }(e.fn.addClass), removeClass: function (t) {
        return function (i, s, n, a) {
          return arguments.length > 1 ? e.effects.animateClass.call(this, { remove: i }, s, n, a) : t.apply(this, arguments);
        };
      }(e.fn.removeClass), toggleClass: function (t) {
        return function (i, s, n, a, o) {
          return "boolean" == typeof s || void 0 === s ? n ? e.effects.animateClass.call(this, s ? { add: i } : { remove: i }, n, a, o) : t.apply(this, arguments) : e.effects.animateClass.call(this, { toggle: i }, s, n, a);
        };
      }(e.fn.toggleClass), switchClass: function switchClass(t, i, s, n, a) {
        return e.effects.animateClass.call(this, { add: i, remove: t }, s, n, a);
      } });
  }(), function () {
    function t(t, i, s, n) {
      return e.isPlainObject(t) && (i = t, t = t.effect), t = { effect: t }, null == i && (i = {}), e.isFunction(i) && (n = i, s = null, i = {}), ("number" == typeof i || e.fx.speeds[i]) && (n = s, s = i, i = {}), e.isFunction(s) && (n = s, s = null), i && e.extend(t, i), s = s || i.duration, t.duration = e.fx.off ? 0 : "number" == typeof s ? s : s in e.fx.speeds ? e.fx.speeds[s] : e.fx.speeds._default, t.complete = n || i.complete, t;
    }function i(t) {
      return !t || "number" == typeof t || e.fx.speeds[t] ? !0 : "string" != typeof t || e.effects.effect[t] ? e.isFunction(t) ? !0 : "object" != (typeof t === "undefined" ? "undefined" : _typeof(t)) || t.effect ? !1 : !0 : !0;
    }e.extend(e.effects, { version: "1.11.4", save: function save(e, t) {
        for (var i = 0; t.length > i; i++) {
          null !== t[i] && e.data(o + t[i], e[0].style[t[i]]);
        }
      }, restore: function restore(e, t) {
        var i, s;for (s = 0; t.length > s; s++) {
          null !== t[s] && (i = e.data(o + t[s]), void 0 === i && (i = ""), e.css(t[s], i));
        }
      }, setMode: function setMode(e, t) {
        return "toggle" === t && (t = e.is(":hidden") ? "show" : "hide"), t;
      }, getBaseline: function getBaseline(e, t) {
        var i, s;switch (e[0]) {case "top":
            i = 0;break;case "middle":
            i = .5;break;case "bottom":
            i = 1;break;default:
            i = e[0] / t.height;}switch (e[1]) {case "left":
            s = 0;break;case "center":
            s = .5;break;case "right":
            s = 1;break;default:
            s = e[1] / t.width;}return { x: s, y: i };
      }, createWrapper: function createWrapper(t) {
        if (t.parent().is(".ui-effects-wrapper")) return t.parent();var i = { width: t.outerWidth(!0), height: t.outerHeight(!0), "float": t.css("float") },
            s = e("<div></div>").addClass("ui-effects-wrapper").css({ fontSize: "100%", background: "transparent", border: "none", margin: 0, padding: 0 }),
            n = { width: t.width(), height: t.height() },
            a = document.activeElement;try {
          a.id;
        } catch (o) {
          a = document.body;
        }return t.wrap(s), (t[0] === a || e.contains(t[0], a)) && e(a).focus(), s = t.parent(), "static" === t.css("position") ? (s.css({ position: "relative" }), t.css({ position: "relative" })) : (e.extend(i, { position: t.css("position"), zIndex: t.css("z-index") }), e.each(["top", "left", "bottom", "right"], function (e, s) {
          i[s] = t.css(s), isNaN(parseInt(i[s], 10)) && (i[s] = "auto");
        }), t.css({ position: "relative", top: 0, left: 0, right: "auto", bottom: "auto" })), t.css(n), s.css(i).show();
      }, removeWrapper: function removeWrapper(t) {
        var i = document.activeElement;return t.parent().is(".ui-effects-wrapper") && (t.parent().replaceWith(t), (t[0] === i || e.contains(t[0], i)) && e(i).focus()), t;
      }, setTransition: function setTransition(t, i, s, n) {
        return n = n || {}, e.each(i, function (e, i) {
          var a = t.cssUnit(i);a[0] > 0 && (n[i] = a[0] * s + a[1]);
        }), n;
      } }), e.fn.extend({ effect: function effect() {
        function i(t) {
          function i() {
            e.isFunction(a) && a.call(n[0]), e.isFunction(t) && t();
          }var n = e(this),
              a = s.complete,
              r = s.mode;(n.is(":hidden") ? "hide" === r : "show" === r) ? (n[r](), i()) : o.call(n[0], s, i);
        }var s = t.apply(this, arguments),
            n = s.mode,
            a = s.queue,
            o = e.effects.effect[s.effect];return e.fx.off || !o ? n ? this[n](s.duration, s.complete) : this.each(function () {
          s.complete && s.complete.call(this);
        }) : a === !1 ? this.each(i) : this.queue(a || "fx", i);
      }, show: function (e) {
        return function (s) {
          if (i(s)) return e.apply(this, arguments);var n = t.apply(this, arguments);return n.mode = "show", this.effect.call(this, n);
        };
      }(e.fn.show), hide: function (e) {
        return function (s) {
          if (i(s)) return e.apply(this, arguments);var n = t.apply(this, arguments);return n.mode = "hide", this.effect.call(this, n);
        };
      }(e.fn.hide), toggle: function (e) {
        return function (s) {
          if (i(s) || "boolean" == typeof s) return e.apply(this, arguments);var n = t.apply(this, arguments);return n.mode = "toggle", this.effect.call(this, n);
        };
      }(e.fn.toggle), cssUnit: function cssUnit(t) {
        var i = this.css(t),
            s = [];return e.each(["em", "px", "%", "pt"], function (e, t) {
          i.indexOf(t) > 0 && (s = [parseFloat(i), t]);
        }), s;
      } });
  }(), function () {
    var t = {};e.each(["Quad", "Cubic", "Quart", "Quint", "Expo"], function (e, i) {
      t[i] = function (t) {
        return Math.pow(t, e + 2);
      };
    }), e.extend(t, { Sine: function Sine(e) {
        return 1 - Math.cos(e * Math.PI / 2);
      }, Circ: function Circ(e) {
        return 1 - Math.sqrt(1 - e * e);
      }, Elastic: function Elastic(e) {
        return 0 === e || 1 === e ? e : -Math.pow(2, 8 * (e - 1)) * Math.sin((80 * (e - 1) - 7.5) * Math.PI / 15);
      }, Back: function Back(e) {
        return e * e * (3 * e - 2);
      }, Bounce: function Bounce(e) {
        for (var t, i = 4; ((t = Math.pow(2, --i)) - 1) / 11 > e;) {}return 1 / Math.pow(4, 3 - i) - 7.5625 * Math.pow((3 * t - 2) / 22 - e, 2);
      } }), e.each(t, function (t, i) {
      e.easing["easeIn" + t] = i, e.easing["easeOut" + t] = function (e) {
        return 1 - i(1 - e);
      }, e.easing["easeInOut" + t] = function (e) {
        return .5 > e ? i(2 * e) / 2 : 1 - i(-2 * e + 2) / 2;
      };
    });
  }(), e.effects, e.effects.effect.blind = function (t, i) {
    var s,
        n,
        a,
        o = e(this),
        r = /up|down|vertical/,
        h = /up|left|vertical|horizontal/,
        l = ["position", "top", "bottom", "left", "right", "height", "width"],
        u = e.effects.setMode(o, t.mode || "hide"),
        d = t.direction || "up",
        c = r.test(d),
        p = c ? "height" : "width",
        f = c ? "top" : "left",
        m = h.test(d),
        g = {},
        v = "show" === u;o.parent().is(".ui-effects-wrapper") ? e.effects.save(o.parent(), l) : e.effects.save(o, l), o.show(), s = e.effects.createWrapper(o).css({ overflow: "hidden" }), n = s[p](), a = parseFloat(s.css(f)) || 0, g[p] = v ? n : 0, m || (o.css(c ? "bottom" : "right", 0).css(c ? "top" : "left", "auto").css({ position: "absolute" }), g[f] = v ? a : n + a), v && (s.css(p, 0), m || s.css(f, a + n)), s.animate(g, { duration: t.duration, easing: t.easing, queue: !1, complete: function complete() {
        "hide" === u && o.hide(), e.effects.restore(o, l), e.effects.removeWrapper(o), i();
      } });
  }, e.effects.effect.bounce = function (t, i) {
    var s,
        n,
        a,
        o = e(this),
        r = ["position", "top", "bottom", "left", "right", "height", "width"],
        h = e.effects.setMode(o, t.mode || "effect"),
        l = "hide" === h,
        u = "show" === h,
        d = t.direction || "up",
        c = t.distance,
        p = t.times || 5,
        f = 2 * p + (u || l ? 1 : 0),
        m = t.duration / f,
        g = t.easing,
        v = "up" === d || "down" === d ? "top" : "left",
        y = "up" === d || "left" === d,
        b = o.queue(),
        _ = b.length;for ((u || l) && r.push("opacity"), e.effects.save(o, r), o.show(), e.effects.createWrapper(o), c || (c = o["top" === v ? "outerHeight" : "outerWidth"]() / 3), u && (a = { opacity: 1 }, a[v] = 0, o.css("opacity", 0).css(v, y ? 2 * -c : 2 * c).animate(a, m, g)), l && (c /= Math.pow(2, p - 1)), a = {}, a[v] = 0, s = 0; p > s; s++) {
      n = {}, n[v] = (y ? "-=" : "+=") + c, o.animate(n, m, g).animate(a, m, g), c = l ? 2 * c : c / 2;
    }l && (n = { opacity: 0 }, n[v] = (y ? "-=" : "+=") + c, o.animate(n, m, g)), o.queue(function () {
      l && o.hide(), e.effects.restore(o, r), e.effects.removeWrapper(o), i();
    }), _ > 1 && b.splice.apply(b, [1, 0].concat(b.splice(_, f + 1))), o.dequeue();
  }, e.effects.effect.clip = function (t, i) {
    var s,
        n,
        a,
        o = e(this),
        r = ["position", "top", "bottom", "left", "right", "height", "width"],
        h = e.effects.setMode(o, t.mode || "hide"),
        l = "show" === h,
        u = t.direction || "vertical",
        d = "vertical" === u,
        c = d ? "height" : "width",
        p = d ? "top" : "left",
        f = {};e.effects.save(o, r), o.show(), s = e.effects.createWrapper(o).css({ overflow: "hidden" }), n = "IMG" === o[0].tagName ? s : o, a = n[c](), l && (n.css(c, 0), n.css(p, a / 2)), f[c] = l ? a : 0, f[p] = l ? 0 : a / 2, n.animate(f, { queue: !1, duration: t.duration, easing: t.easing, complete: function complete() {
        l || o.hide(), e.effects.restore(o, r), e.effects.removeWrapper(o), i();
      } });
  }, e.effects.effect.drop = function (t, i) {
    var s,
        n = e(this),
        a = ["position", "top", "bottom", "left", "right", "opacity", "height", "width"],
        o = e.effects.setMode(n, t.mode || "hide"),
        r = "show" === o,
        h = t.direction || "left",
        l = "up" === h || "down" === h ? "top" : "left",
        u = "up" === h || "left" === h ? "pos" : "neg",
        d = { opacity: r ? 1 : 0 };e.effects.save(n, a), n.show(), e.effects.createWrapper(n), s = t.distance || n["top" === l ? "outerHeight" : "outerWidth"](!0) / 2, r && n.css("opacity", 0).css(l, "pos" === u ? -s : s), d[l] = (r ? "pos" === u ? "+=" : "-=" : "pos" === u ? "-=" : "+=") + s, n.animate(d, { queue: !1, duration: t.duration, easing: t.easing, complete: function complete() {
        "hide" === o && n.hide(), e.effects.restore(n, a), e.effects.removeWrapper(n), i();
      } });
  }, e.effects.effect.explode = function (t, i) {
    function s() {
      b.push(this), b.length === d * c && n();
    }function n() {
      p.css({ visibility: "visible" }), e(b).remove(), m || p.hide(), i();
    }var a,
        o,
        r,
        h,
        l,
        u,
        d = t.pieces ? Math.round(Math.sqrt(t.pieces)) : 3,
        c = d,
        p = e(this),
        f = e.effects.setMode(p, t.mode || "hide"),
        m = "show" === f,
        g = p.show().css("visibility", "hidden").offset(),
        v = Math.ceil(p.outerWidth() / c),
        y = Math.ceil(p.outerHeight() / d),
        b = [];for (a = 0; d > a; a++) {
      for (h = g.top + a * y, u = a - (d - 1) / 2, o = 0; c > o; o++) {
        r = g.left + o * v, l = o - (c - 1) / 2, p.clone().appendTo("body").wrap("<div></div>").css({ position: "absolute", visibility: "visible", left: -o * v, top: -a * y }).parent().addClass("ui-effects-explode").css({ position: "absolute", overflow: "hidden", width: v, height: y, left: r + (m ? l * v : 0), top: h + (m ? u * y : 0), opacity: m ? 0 : 1 }).animate({ left: r + (m ? 0 : l * v), top: h + (m ? 0 : u * y), opacity: m ? 1 : 0 }, t.duration || 500, t.easing, s);
      }
    }
  }, e.effects.effect.fade = function (t, i) {
    var s = e(this),
        n = e.effects.setMode(s, t.mode || "toggle");s.animate({ opacity: n }, { queue: !1, duration: t.duration, easing: t.easing, complete: i });
  }, e.effects.effect.fold = function (t, i) {
    var s,
        n,
        a = e(this),
        o = ["position", "top", "bottom", "left", "right", "height", "width"],
        r = e.effects.setMode(a, t.mode || "hide"),
        h = "show" === r,
        l = "hide" === r,
        u = t.size || 15,
        d = /([0-9]+)%/.exec(u),
        c = !!t.horizFirst,
        p = h !== c,
        f = p ? ["width", "height"] : ["height", "width"],
        m = t.duration / 2,
        g = {},
        v = {};e.effects.save(a, o), a.show(), s = e.effects.createWrapper(a).css({ overflow: "hidden" }), n = p ? [s.width(), s.height()] : [s.height(), s.width()], d && (u = parseInt(d[1], 10) / 100 * n[l ? 0 : 1]), h && s.css(c ? { height: 0, width: u } : { height: u, width: 0 }), g[f[0]] = h ? n[0] : u, v[f[1]] = h ? n[1] : 0, s.animate(g, m, t.easing).animate(v, m, t.easing, function () {
      l && a.hide(), e.effects.restore(a, o), e.effects.removeWrapper(a), i();
    });
  }, e.effects.effect.highlight = function (t, i) {
    var s = e(this),
        n = ["backgroundImage", "backgroundColor", "opacity"],
        a = e.effects.setMode(s, t.mode || "show"),
        o = { backgroundColor: s.css("backgroundColor") };"hide" === a && (o.opacity = 0), e.effects.save(s, n), s.show().css({ backgroundImage: "none", backgroundColor: t.color || "#ffff99" }).animate(o, { queue: !1, duration: t.duration, easing: t.easing, complete: function complete() {
        "hide" === a && s.hide(), e.effects.restore(s, n), i();
      } });
  }, e.effects.effect.pulsate = function (t, i) {
    var s,
        n = e(this),
        a = e.effects.setMode(n, t.mode || "show"),
        o = "show" === a,
        r = "hide" === a,
        h = o || "hide" === a,
        l = 2 * (t.times || 5) + (h ? 1 : 0),
        u = t.duration / l,
        d = 0,
        c = n.queue(),
        p = c.length;for ((o || !n.is(":visible")) && (n.css("opacity", 0).show(), d = 1), s = 1; l > s; s++) {
      n.animate({ opacity: d }, u, t.easing), d = 1 - d;
    }n.animate({ opacity: d }, u, t.easing), n.queue(function () {
      r && n.hide(), i();
    }), p > 1 && c.splice.apply(c, [1, 0].concat(c.splice(p, l + 1))), n.dequeue();
  }, e.effects.effect.size = function (t, i) {
    var s,
        n,
        a,
        o = e(this),
        r = ["position", "top", "bottom", "left", "right", "width", "height", "overflow", "opacity"],
        h = ["position", "top", "bottom", "left", "right", "overflow", "opacity"],
        l = ["width", "height", "overflow"],
        u = ["fontSize"],
        d = ["borderTopWidth", "borderBottomWidth", "paddingTop", "paddingBottom"],
        c = ["borderLeftWidth", "borderRightWidth", "paddingLeft", "paddingRight"],
        p = e.effects.setMode(o, t.mode || "effect"),
        f = t.restore || "effect" !== p,
        m = t.scale || "both",
        g = t.origin || ["middle", "center"],
        v = o.css("position"),
        y = f ? r : h,
        b = { height: 0, width: 0, outerHeight: 0, outerWidth: 0 };"show" === p && o.show(), s = { height: o.height(), width: o.width(), outerHeight: o.outerHeight(), outerWidth: o.outerWidth() }, "toggle" === t.mode && "show" === p ? (o.from = t.to || b, o.to = t.from || s) : (o.from = t.from || ("show" === p ? b : s), o.to = t.to || ("hide" === p ? b : s)), a = { from: { y: o.from.height / s.height, x: o.from.width / s.width }, to: { y: o.to.height / s.height, x: o.to.width / s.width } }, ("box" === m || "both" === m) && (a.from.y !== a.to.y && (y = y.concat(d), o.from = e.effects.setTransition(o, d, a.from.y, o.from), o.to = e.effects.setTransition(o, d, a.to.y, o.to)), a.from.x !== a.to.x && (y = y.concat(c), o.from = e.effects.setTransition(o, c, a.from.x, o.from), o.to = e.effects.setTransition(o, c, a.to.x, o.to))), ("content" === m || "both" === m) && a.from.y !== a.to.y && (y = y.concat(u).concat(l), o.from = e.effects.setTransition(o, u, a.from.y, o.from), o.to = e.effects.setTransition(o, u, a.to.y, o.to)), e.effects.save(o, y), o.show(), e.effects.createWrapper(o), o.css("overflow", "hidden").css(o.from), g && (n = e.effects.getBaseline(g, s), o.from.top = (s.outerHeight - o.outerHeight()) * n.y, o.from.left = (s.outerWidth - o.outerWidth()) * n.x, o.to.top = (s.outerHeight - o.to.outerHeight) * n.y, o.to.left = (s.outerWidth - o.to.outerWidth) * n.x), o.css(o.from), ("content" === m || "both" === m) && (d = d.concat(["marginTop", "marginBottom"]).concat(u), c = c.concat(["marginLeft", "marginRight"]), l = r.concat(d).concat(c), o.find("*[width]").each(function () {
      var i = e(this),
          s = { height: i.height(), width: i.width(), outerHeight: i.outerHeight(), outerWidth: i.outerWidth() };f && e.effects.save(i, l), i.from = { height: s.height * a.from.y, width: s.width * a.from.x, outerHeight: s.outerHeight * a.from.y, outerWidth: s.outerWidth * a.from.x }, i.to = { height: s.height * a.to.y, width: s.width * a.to.x, outerHeight: s.height * a.to.y, outerWidth: s.width * a.to.x }, a.from.y !== a.to.y && (i.from = e.effects.setTransition(i, d, a.from.y, i.from), i.to = e.effects.setTransition(i, d, a.to.y, i.to)), a.from.x !== a.to.x && (i.from = e.effects.setTransition(i, c, a.from.x, i.from), i.to = e.effects.setTransition(i, c, a.to.x, i.to)), i.css(i.from), i.animate(i.to, t.duration, t.easing, function () {
        f && e.effects.restore(i, l);
      });
    })), o.animate(o.to, { queue: !1, duration: t.duration, easing: t.easing, complete: function complete() {
        0 === o.to.opacity && o.css("opacity", o.from.opacity), "hide" === p && o.hide(), e.effects.restore(o, y), f || ("static" === v ? o.css({ position: "relative", top: o.to.top, left: o.to.left }) : e.each(["top", "left"], function (e, t) {
          o.css(t, function (t, i) {
            var s = parseInt(i, 10),
                n = e ? o.to.left : o.to.top;return "auto" === i ? n + "px" : s + n + "px";
          });
        })), e.effects.removeWrapper(o), i();
      } });
  }, e.effects.effect.scale = function (t, i) {
    var s = e(this),
        n = e.extend(!0, {}, t),
        a = e.effects.setMode(s, t.mode || "effect"),
        o = parseInt(t.percent, 10) || (0 === parseInt(t.percent, 10) ? 0 : "hide" === a ? 0 : 100),
        r = t.direction || "both",
        h = t.origin,
        l = { height: s.height(), width: s.width(), outerHeight: s.outerHeight(), outerWidth: s.outerWidth() },
        u = { y: "horizontal" !== r ? o / 100 : 1, x: "vertical" !== r ? o / 100 : 1 };n.effect = "size", n.queue = !1, n.complete = i, "effect" !== a && (n.origin = h || ["middle", "center"], n.restore = !0), n.from = t.from || ("show" === a ? { height: 0, width: 0, outerHeight: 0, outerWidth: 0 } : l), n.to = { height: l.height * u.y, width: l.width * u.x, outerHeight: l.outerHeight * u.y, outerWidth: l.outerWidth * u.x }, n.fade && ("show" === a && (n.from.opacity = 0, n.to.opacity = 1), "hide" === a && (n.from.opacity = 1, n.to.opacity = 0)), s.effect(n);
  }, e.effects.effect.shake = function (t, i) {
    var s,
        n = e(this),
        a = ["position", "top", "bottom", "left", "right", "height", "width"],
        o = e.effects.setMode(n, t.mode || "effect"),
        r = t.direction || "left",
        h = t.distance || 20,
        l = t.times || 3,
        u = 2 * l + 1,
        d = Math.round(t.duration / u),
        c = "up" === r || "down" === r ? "top" : "left",
        p = "up" === r || "left" === r,
        f = {},
        m = {},
        g = {},
        v = n.queue(),
        y = v.length;for (e.effects.save(n, a), n.show(), e.effects.createWrapper(n), f[c] = (p ? "-=" : "+=") + h, m[c] = (p ? "+=" : "-=") + 2 * h, g[c] = (p ? "-=" : "+=") + 2 * h, n.animate(f, d, t.easing), s = 1; l > s; s++) {
      n.animate(m, d, t.easing).animate(g, d, t.easing);
    }n.animate(m, d, t.easing).animate(f, d / 2, t.easing).queue(function () {
      "hide" === o && n.hide(), e.effects.restore(n, a), e.effects.removeWrapper(n), i();
    }), y > 1 && v.splice.apply(v, [1, 0].concat(v.splice(y, u + 1))), n.dequeue();
  }, e.effects.effect.slide = function (t, i) {
    var s,
        n = e(this),
        a = ["position", "top", "bottom", "left", "right", "width", "height"],
        o = e.effects.setMode(n, t.mode || "show"),
        r = "show" === o,
        h = t.direction || "left",
        l = "up" === h || "down" === h ? "top" : "left",
        u = "up" === h || "left" === h,
        d = {};e.effects.save(n, a), n.show(), s = t.distance || n["top" === l ? "outerHeight" : "outerWidth"](!0), e.effects.createWrapper(n).css({ overflow: "hidden" }), r && n.css(l, u ? isNaN(s) ? "-" + s : -s : s), d[l] = (r ? u ? "+=" : "-=" : u ? "-=" : "+=") + s, n.animate(d, { queue: !1, duration: t.duration, easing: t.easing, complete: function complete() {
        "hide" === o && n.hide(), e.effects.restore(n, a), e.effects.removeWrapper(n), i();
      } });
  };
});

},{}],6:[function(require,module,exports){
'use strict';

var _index = require('../../index.js');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Created by lucas on 11/2/2016.
 */

var explorer = new _index2.default(600, 400);
//enable debug (will show some warns if something get wrong)
explorer.debugMode = true;
//let the user select multiple files (default: false)
explorer.multiSelect = true;

/*
I am sure you'll get it.
explorer.CONTEXT_MENU_OPTIONS.DELETE_ALL = explorer.HIDDEN;
explorer.CONTEXT_MENU_OPTIONS.MOVE_ALL = explorer.HIDDEN;
explorer.CONTEXT_MENU_OPTIONS.UPLOAD_ALL = explorer.HIDDEN;
explorer.CONTEXT_MENU_OPTIONS.SHARE_ALL = explorer.HIDDEN;
explorer.CONTEXT_MENU_OPTIONS.DOWNLOAD_ALL = explorer.HIDDEN;
explorer.CONTEXT_MENU_OPTIONS.DELETE = explorer.HIDDEN;
explorer.CONTEXT_MENU_OPTIONS.MOVE = explorer.HIDDEN;
explorer.CONTEXT_MENU_OPTIONS.UPLOAD = explorer.HIDDEN;
explorer.CONTEXT_MENU_OPTIONS.SHARE = explorer.HIDDEN;
explorer.CONTEXT_MENU_OPTIONS.DOWNLOAD = explorer.HIDDEN;
explorer.CONTEXT_MENU_OPTIONS.RENAME = explorer.HIDDEN;
explorer.CONTEXT_MENU_OPTIONS.NEW_FOLDER = explorer.HIDDEN;*/
explorer.CONTEXT_MENU_OPTIONS.OPEN = explorer.DISABLED;
//Since we did not set our container (div), run createExplorer to create an element where Explorer will put its stuff.
explorer.createExplorer();
//Overrides default dbclick behavior
explorer.dbclick = function (file) {
    if (file.ext !== "dir") {
        explorer.share(file);
    } else {
        explorer.open(file);
    }
};
//Add some files (you can do whenever you want)
explorer.addFiles(new _index.File(1, "Resumé", "ps"));
explorer.addFiles(new _index.File(2, "Folder", "dir"));
explorer.addFiles(new _index.File(4, "Picture", "pic", 3));
explorer.addFiles(new _index.File(5, "Sorry", "mp3", 3));
explorer.addFiles(new _index.File(6, "HW", "docx", 3));
explorer.addFiles(new _index.File(3, "Music", "dir"));
explorer.setIconsBackgroundColor("#1A9ADA");
//Explorer's div border
explorer.border = "5px dashed gray";
/*
Overrides default behavior
explorer.upload = function (){console.info("upload")};
explorer.open = function (file){console.info("open "+file.name)};
explorer.newFolder = function (){console.info("newFolder")};
explorer.share = function (file){console.info("share "+file.name)};
explorer.rename = function (file){console.info("rename "+file.name)};
explorer.download = function (file){console.info("download "+file.name)};
explorer.delete = function (file){console.info("delete "+file.name)};
explorer.move = function (file){console.info("move "+file.name)};*/
//Add a context menu custom option
explorer.customMenuOption = function (file) {
    return explorer.buildCustomMenuOption("Office", openOffice, { title: "Office", disabled: false });
};
//create a function to run when the context menu option is clicked
function openOffice() {
    explorer.createBaseDialog(window.innerWidth * .85, "auto", { "min-width": 300, "min-height": 300, "style": true });
    //explorer.loadBaseDialog("<p class='gray bold txtcenter ft14'> "+explorer.TEMP_VAR.name+" </p><center><iframe src='https://docs.google.com/gview?url="+APP_URL+"/download/"+explorer.TEMP_VAR.id+"?officeAccessKey="+data.key+"' style='width:"+window.innerWidth * 0.8+"px; height:"+window.innerHeight * 0.7+"px; border: 1px solid gray;'> </iframe></center>");
    explorer.loadBaseDialog("<p class='gray bold txtcenter ft14'> Titulo </p><center><iframe src='https://docs.google.com/gview?url=http://infolab.stanford.edu/pub/papers/google.pdf&embedded=true' style='width:" + window.innerWidth * 0.7 + "px; height:" + window.innerHeight * 0.7 + "px; border: 1px solid gray;'> </iframe></center>");
    explorer.showBaseDialog();
}
//starts Explorer
explorer.start();

},{"../../index.js":1}]},{},[6]);

//# sourceMappingURL=explorer.js.map
