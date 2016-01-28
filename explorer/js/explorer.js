function Explorer(width, height, container, position, fileList){
    explorer = {
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
        LANG_LBL_MOVE_FOLDER_ERROR_TITLE: "Moving Error",
        LANG_LBL_MOVE_FOLDER_ERROR_MSG: "You cannot move {folderName} to its sub folder.",
        LANG_LBL_DELETE_FOLDER_WARNING_MSG: "You selected a folder and/or other files. The folder have you selected and" +
        " its files and subfolders will be deleted. Are you sure you want to delete them?",
        LANG_LBL_DELETE_FOLDER_WARNING_TITLE: "Attention",
        LANG_LBL_DELETE_FOLDER_WARNING_BT_YES:"Yes",
        LANG_LBL_DELETE_FOLDER_WARNING_BT_NO:"No",
        LANG_LBL_PREVIEW_HEADER:"Title",
        LANG_LBL_PREVIEW_ENLARGE: "Click to Enlarge",
        LANG_LBL_PREVIEW_NO_VIDEO_SUPPORT:"Your browser does not support the video tag.",
        LANG_LBL_NEW_FOLDER_HEADER: "Create a new Folder",
        LANG_LBL_NEW_FOLDER_FOLDER_NAME: "Folder Name:",
        LANG_LBL_NEW_FOLDER_BT_CREATE: "Create",
        LANG_EMPTY_MESSAGE: "Oh gosh, you've no files yet, try dragging and dropping a file over here :)",
        TEMP_VAR: undefined,
        EVENT_DROP: 1,EVENT_RENAME: 2,
        ENABLED: 0, HIDDEN: 1,DISABLED: 2,
        CONTEXT_MENU_OPTIONS: {DOWNLOAD: 0, UPLOAD: 0, OPEN: 0, MOVE: 0, RENAME: 0, DELETE: 0, SHARE: 0, NEW_FOLDER: 0},
        DOWNLOAD: 0,UPLOAD : 1, OPEN : 2, MOVE: 3, RENAME : 4, DELETE : 5, SHARE : 6, NEW_FOLDER : 7,
        ROOT: 0,
        baseDialogEffect: "fade",
        debugMode: false,
        container: container === undefined ? "#explorerContainer" : container,
        element: "#explorer",
        fields: {"fieldList" : new Array(), "usedFields" : 0},
        width: width === undefined ? 800 : width,
        height: height === undefined ? 600 : height,
        position: position === undefined ? 2 : position, //center, by default
        cssPosition: "relative",
        fileList: fileList === undefined ? new Array() : fileList,
        fileUpdateEvent: "fileUpdateEvent",
        border: "0px solid gray",
        language: undefined,
        currentPath: new Array(),
        top: 0,
        left: 0,
        selectedFiles: new Array(),
        started: false,
        browserContextMenuDisabled: true,//Browser Context Menu must be disabled to make everything works fine
        currentParent: 0,
        availableIconExtensions: null,
        iconsBackgroundColor: "#00ABA9",
        addFiles: function (param, resize) {
            if($("#emptyMessage").length){
                $("#emptyMessage").fadeOut("fast");
            }
            if(param === undefined){
                explorer.log("You are passing an undefined parameter to addFiles()");
                return;
            }
            if($.isArray(param)){
                $.each(param, function(i, file) {
                    explorer.addFiles(file);
                });
                return;
            }
            if (explorer.checkIfContainerExist() === false) {
                return;
            }
            if(!explorer.started){
                $(explorer.element).css("display","none");
            }
            if($.isNumeric(param)) {//if it is going to open a folder
                var parentId = param;
                if(explorer.currentParent == parentId && resize !== true){
                    return;
                }
                explorer.fields.fieldList = [];
                explorer.fields.usedFields = 0;
                $(".file, .field").remove();//Delete each file and field on the screen before add the new ones.
                explorer.currentParent = parentId;
                explorer.createQuickFolderAccess(parentId);
                if(parentId !== 0){ //if it is not the root, create a link to go back to its parent
                    explorer.createUpButton(parentId);
                }
            }else{//if it is an object
                var file = param;
                var index = explorer.checkIfExists(file.id);
                if(index != -1 && file.found === undefined){//&& explorer.fileList[index].name != file.name){
                    explorer.log("Explorer already has a file/folder with this id ("+file.id+"). '"+file.name+"' will not be added to the fileList.");
                    return;
                }else if(index == -1){
                    //add to fileList
                    explorer.fileList.push(file);
                }
                if(file.found !== undefined){
                    explorer.createFieldsIfNecessary(file);
                    explorer.placeFileAutomatically(file);
                    return;
                }
            }
            $.each(explorer.fileList, function(i, file) {
                var index = explorer.checkIfExists(file.id);
                if(file.parent != explorer.currentParent){ //If it is not in the same folder that the file was uploaded to,
                    // do not create it on the screen
                    explorer.fileList[index].placed = false;
                    return;
                }
                if(file.placed && resize !== true){
                    return;
                }
                explorer.createFieldsIfNecessary(file);
                if(explorer.fields.fieldList[file.field] === undefined && file.field != -1){
                    explorer.log(file.name+"'s field does not exist. It will be placed on an existing free field. "+
                        "Make sure you are running createFields(number_of_fields); with enough number of fields to place '"+file.name+"' on.");
                }
                if(file.field !== undefined && file.field != -1 && explorer.fields.fieldList[file.field] !== undefined){
                    var top = (explorer.fields.fieldList[file.field].top + 5)+"px;";
                    var left = (explorer.fields.fieldList[file.field].left + 5)+"px;";
                    $(explorer.element).append("<div id='"+file.id+"' class='file fileButton draggable displayNone' style='position: absolute; top:"+ top +
                        "left:"+left+"'> <div class='center iconBorder'><div style='margin-left: 3px;' class='"+file.ext+"'></div></div> <input class='txtcenter ft11 inputFileName'"+
                        "maxlength='13' readonly='readonly' title='"+file.name+"' value='"+file.getName().replace(/'/g,"&apos;")+"'/></div>");
                    explorer.fields.fieldList[file.field].filesOn.push(file.id);
                    var field = explorer.fields.fieldList[file.field];
                    $("#"+file.id).css("top", (field.filesOn.length > 1 ? field.top + 5 - ((field.filesOn.length-1)*3)  : field.top + 5) +"px");
                    $("#"+file.id).css("left", (field.filesOn.length > 1 ? field.left + 5 + ((field.filesOn.length-1)*3) : field.left + 5) + "px");
                    $("#"+file.id).fadeIn(300);
                    explorer.fields.usedFields++;
                    explorer.loadFileEvents(file);
                }else{
                    explorer.placeFileAutomatically(file);
                }
                index = explorer.checkIfExists(file.id);
                explorer.fileList[index].placed = true; //field's index
            });
            explorer.initMouseOverEvent();
        },
        placeFileAutomatically: function (file){
            for(var x=0; x < explorer.fields.fieldList.length; x++){
                if(explorer.fields.fieldList[x].filesOn.length === 0){
                    var top = (explorer.fields.fieldList[x].top + 5)+"px;";
                    var left = (explorer.fields.fieldList[x].left + 5)+"px;";
                    $(explorer.element).append("<div id='"+file.id+"' class='file fileButton draggable displayNone' style='position: absolute; top:"+top+
                        "left:"+left+"'> <div class='center iconBorder'><div style='margin-left: 3px;' class='"+file.ext+"'></div></div> <input class='txtcenter ft11 inputFileName' "+
                        "maxlength='13' readonly='readonly' title='"+file.name+"' value='"+file.getName().replace(/'/g,"&apos;")+"' /></div>");
                    $("#"+file.id).fadeIn(1000);
                    explorer.fields.fieldList[x].filesOn.push(file.id);
                    explorer.fields.usedFields++;
                    index = explorer.checkIfExists(file.id);
                    if(!file.found){
                        explorer.fileList[index].field = x; //field's index
                    }
                    explorer.loadFileEvents(file);
                    break;
                }
            }
        },
        createFieldsIfNecessary: function (file){
            //add new fields, if necessary
            if(file.field == -1){
                if(explorer.fields.fieldList.length <= explorer.fileList.length){
                    explorer.createFields(1);
                }
            }else if(file.field > (explorer.fields.fieldList.length - 1)){
                explorer.createFields(file.field - explorer.fields.fieldList.length + 1);
            }
            if(explorer.fields.fieldList.length - explorer.fileList.length < 2){
                explorer.createFields(1);
            }
        },
        createUpButton: function (parentId){
            explorer.createFields(1, true);
            var grandpaId = $.grep(explorer.fileList, function(e){ return e.id == parentId; });
            $(explorer.element).append("<div id='goup' class='file fileButton' style='float:left; top: 5px; left: 5px; position: absolute'>" +
                "<div class='center iconBorder'><div style='margin-left: 3px;' class='goUp'></div></div><p class='txtcenter ft11'>"+explorer.LANG_LBL_UP+"</p></div>");
            $("#goup").on("click", function() {
                $(".file").fadeOut("slow");
                explorer.hide([".contextMenuFile", ".contextMenuFolder", ".contextMenuVoid"]);
                setTimeout( function() {
                    explorer.addFiles(grandpaId[0].parent);
                }, 200);
                setTimeout( function() {
                    $(".file").fadeIn("fast");
                }, 250);
            });
        },
        loadFileEvents: function (file){
            //rename event
            $("#"+file.id).find("input").on("blur", function (e){
                explorer.rename(file.id, true);
            });
            //double click event
            $("#"+file.id).dblclick(function() {
                explorer.dbclick(file);
            });
            //Add click event
            $("#"+file.id).on("mousedown", function(e){
                if(!$(e.target).is('._selected') && e.which == 3){//if it was not selected and it is a right click,
                    explorer.selectedFiles = [];//clean the list to add a new one
                    $("._selected").removeClass('_selected');
                    $(".file").css("border", "1px solid darkgray");
                }
                var result = $.grep(explorer.selectedFiles,function(e){return e.id == file.id;});//check if this file is already in the list
                if(result.length === 0){//if not
                    explorer.selectedFiles.push(file);
                }
                if($(e.currentTarget).hasClass("uploading")){
                    return;
                }
                if(e.which == 1){//check if it is a left click
                    explorer.hide([".contextMenuFile", ".contextMenuFolder", "#contextIdTools"]);
                    if(!$(e.target).is('._selected') && $("#"+file.id).find("input").is('[readonly]') && !$(e.target).is(".errorStyle, .errorFont")){//if it is not selected, add selected class
                        $("#"+file.id).css("border", "1px solid blue");
                        $("#"+file.id).append("<div id='selec_id"+file.id+"' class='opacity4 _selected'> </div>");
                    }
                }else if(e.which == 3){//create a contextMenu
                    $("#contextMenu4Files").css("top", (e.pageY - 5) + "px");
                    $("#contextMenu4Files").css("left", (e.pageX - 5) + "px");
                    explorer.showContextMenu(file);//Create a new Context Menu to this file
                }
            });
            explorer.initDraggable();
        },
        checkIfExists: function (id){
            for (var i = 0; i < explorer.fileList.length; i++){
                if (explorer.fileList[i].id == id){
                    return i;
                }
            }
            return -1;
        },
        createFields: function(numberFields, isGoUp){
            var fileDivWidth = 130; var fileDivHeight = 150;
            var fieldListSize = explorer.fields.fieldList.length;
            var filePerLine = parseInt(explorer.getExplorerCurrentWidth() / fileDivWidth);
            for(var x = fieldListSize; x < (fieldListSize + numberFields); x++){
                create = (function () {
                    var field = new Field(x, $("<div id='field_"+x+"' class='field' style='top:"+((parseInt(x/filePerLine)*fileDivHeight)+8)+"px; left: "+(parseInt(x%filePerLine)*fileDivWidth)+"px;'/>"),
                        new Array(), parseInt(x/filePerLine)*fileDivHeight, parseInt(x%filePerLine)*fileDivWidth);
                    $(explorer.element).append(field.element);
                    field.element.droppable({
                        drop: function( event, ui ) {
                            var file = explorer.fileList[explorer.checkIfExists(ui.draggable.context.id)];
                            $(field.element).trigger("fileUpdateEvent", [{"file":file}, explorer.EVENT_DROP]);
                            field.element.css("border-width","0px");
                            $("#"+ui.draggable.context.id).animate({
                                    left: field.filesOn.length > 1 ? field.left + 5 + ((field.filesOn.length-1)*3) : field.left + 5,
                                    top: field.filesOn.length > 1 ? field.top + 5 - ((field.filesOn.length-1)*3)  : field.top + 5
                                },
                                {//it's an animate's method
                                    start: function (e){
                                        $("#"+e.elem.id).css("z-index", field.filesOn.length * 20);
                                    }
                                },300
                            );
                        },
                        out: function( event, ui ) {
                            field.element.css("border-width","0px");
                            field.filesOn = $.grep(field.filesOn, function(val, index) {
                                return val != ui.draggable.context.id;
                            });
                            if(field.filesOn.length === 0){
                                explorer.fields.usedFields-=1;
                            }
                        },
                        over: function( event, ui ) {
                            field.element.css("border-width","1px");
                            if($.inArray(ui.draggable.context.id, field.filesOn) == -1){
                                field.filesOn.push(ui.draggable.context.id);
                                var index = explorer.checkIfExists(ui.draggable.context.id);
                                explorer.fileList[index].field = field.fieldNumber();
                            }
                        }
                    });
                    explorer.fields.fieldList.push(field);
                    if(isGoUp === true){
                        explorer.fields.fieldList[0].filesOn = [1];
                    }
                });
                create();
            }
        },
        getSelectedFiles: function(){
            return explorer.selectedFiles;
        },
        disableBrowserContextMenu: function (){
            if(explorer.browserContextMenuDisabled){
                $(document).ready(function() {
                    $(document).bind("contextmenu",function(e){
                        e.preventDefault();
                    });
                });
            }
        },
        initDraggable: function(){
            $(".draggable").draggable({
                cursor: "move",
                revert: "invalid",
                start: function( event, ui ){
                    $("#"+ui.helper.context.id).css("z-index", "9000");
                }
            });
        },
        hide: function (elements){
            $.each(elements, function(i, element) {
                $(element).css("display", "none");
            });
        },
        setExplorerPosition: function(){
            var height = explorer.getExplorerCurrentHeight();
            var width = explorer.getExplorerCurrentWidth();

            if(explorer.position == explorer.POSITION_CENTER){
                var left = (($(explorer.container).parent().width()/2) - (width/2) + explorer.left);
                left = left < 0 ? 0: left;
                $(explorer.container).css("left", left+"px");
                $(explorer.container).css("top", explorer.top+"px");
            }else if(explorer.position == explorer.POSITION_LEFT){
                $(explorer.container).css("left", explorer.left+"px");
                $(explorer.container).css("top", explorer.top+"px");
            }else if(explorer.position == explorer.POSITION_RIGHT){
                $(explorer.container).css("left", ($(explorer.container).parent().width() - width + explorer.left)+"px");
                $(explorer.container).css("top", explorer.top+"px");
            }
            $(explorer.container).css({"position": explorer.cssPosition, "width": width+"px", "height": height+"px", "min-width": "150px", "min-height": "170px", "border": explorer.border});
            $(explorer.element).css({"width": "100%", "height": "90%", "overflow-y": "auto", "overflow-x": "hidden", "position": "relative"});
        },
        getExplorerCurrentHeight: function(){
            var height = null;
            if(explorer.height > $( window ).height()){
                height = $( window ).height() - 50;
                explorer.log("The height you have set is higher than screen's height, so we have now set Explorer's height to "+($( window ).height() - 50));
            }else{
                height = explorer.height;
            }
            return height;
        },
        getExplorerCurrentWidth: function(){//Explorer will have diferent dimension depend on browser window size. To get original size, access it directly (eg. explorer.height)
            var width = null;
            if(explorer.width > $( window ).width()){
                width = $( window ).width() - 20;
                explorer.log("The width you have set is larger than screen's width, so we have now set Explorer's width to "+$( window ).width());
            }else{
                width = explorer.width;
            }
            return width;
        },
        createQuickFolderAccess: function (stopAt){
            var currentPath = new Array();
            if(!$("#quickAccess").length){
                $(explorer.container).prepend("<div id='quickAccess' style='width: auto; height: 20px; position: relative;' style='margin-left: 10px;'></div>");
            }else{
                $("#quickAccess").empty();
            }
            $("#quickAccess").append("<span id='quick_root' class='text-small bold handCursor quickAccessLink' style='margin-bottom: 10px; margin-left: 10px;'>/ </span>");
            $("#quick_root").on("click", function () {explorer.addFiles(0);});
            $.each(explorer.currentPath, function(i, item) {
                // for(var item of explorer.currentPath){
                if(stopAt === 0){
                    return false;
                }else if(item.id != stopAt){
                    currentPath.push(item);
                }else{
                    currentPath.push(item);
                    return false;
                }
            });
            $.each(currentPath, function(i, item) {
                $("#quickAccess").append("<span id='quick_"+item.id+"'class='text-small bold handCursor quickAccessLink'>"+item.name+"/</span> ");
                $("#quick_"+item.id).on("click", function () {explorer.addFiles(item.id);});
            });
            explorer.currentPath = currentPath;
        },
        initContextMenuEvent: function(e){
            //create contextMenuVoid
            $("body").append("<div id='contextIdTools'" +
                "class='opacity9 txtmargin contextMenuVoid gray ft12 bold displayNone'>" +
                explorer.loadContextMenuOption(explorer.NEW_FOLDER, explorer.CONTEXT_MENU_OPTIONS.NEW_FOLDER, false) +
                explorer.loadContextMenuOption(explorer.UPLOAD, explorer.CONTEXT_MENU_OPTIONS.UPLOAD, false) +
                explorer.customMenuOption() +
                "</div>");
            //If the user clicks on the void
            $(document).on("mousedown", function(event) {
                if($(event.target).is('.field,#explorer,#quickAccess')){
                    explorer.hide([".contextMenuFile", ".contextMenuFolder", ".contextMenuVoid"]);
                    $(".file").css("border", "1px solid darkgray");
                    $("._selected").removeClass("_selected");
                    explorer.selectedFiles = [];
                    if(event.which == 3 && ($(event.target).is(explorer.element) || $(event.target).is(".field")) &&(
                        explorer.CONTEXT_MENU_OPTIONS.NEW_FOLDER != explorer.HIDDEN ||
                        explorer.CONTEXT_MENU_OPTIONS.UPLOAD != explorer.HIDDEN)){
                        $("#contextIdTools").css("top", (event.pageY - 5) + "px");
                        $("#contextIdTools").css("left", (event.pageX - 5) + "px");
                        explorer.showContextMenu("void");
                    }
                }
            });
            $(".contextMenuOption").on("mousedown", function (){$("#contextIdTools").fadeOut("fast");});
            //create contextMenu for files
            $("body").append("<div id='contextMenu4Files' style='position:absolute;' class='displayNone'> </div>");
        },
        initMouseOverEvent: function(){
            $(".fileButton").mouseover(function(event) {
                if(document.getElementById(this.id).style.border.indexOf("blue") == -1){
                    $(this).css("border", "1px solid yellow");
                }
            }).mouseout(function() {
                if(document.getElementById(this.id).style.border.indexOf("blue") == -1){
                    $(this).css("border", "1px solid darkgray");
                }
            });
        },
        loadLanguage: function (){
            var patt = /\.json$/i;
            var language = explorer.getExplorerRootFolder()+"/lang/" + explorer.language;
            if(patt.test(language) === true){//if it is a json file, load it
                $.get(language, function(data){
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
                    explorer.LANG_LBL_DELETE_FOLDER_WARNING_MSG = explorer.loadLanguageCheckIfDefined(data.LANG_LBL_DELETE_FOLDER_WARNING_MSG, explorer.LANG_LBL_DELETE_FOLDER_WARNING_MSG);
                    explorer.LANG_LBL_DELETE_FOLDER_WARNING_TITLE = explorer.loadLanguageCheckIfDefined(data.LANG_LBL_DELETE_FOLDER_WARNING_TITLE, explorer.LANG_LBL_DELETE_FOLDER_WARNING_TITLE);
                    explorer.LANG_LBL_DELETE_FOLDER_WARNING_BT_YES = explorer.loadLanguageCheckIfDefined(data.LANG_LBL_DELETE_FOLDER_WARNING_BT_YES, explorer.LANG_LBL_DELETE_FOLDER_WARNING_BT_YES);
                    explorer.LANG_LBL_DELETE_FOLDER_WARNING_BT_NO = explorer.loadLanguageCheckIfDefined(data.LANG_LBL_DELETE_FOLDER_WARNING_BT_NO, explorer.LANG_LBL_DELETE_FOLDER_WARNING_BT_NO);
                    explorer.LANG_LBL_PREVIEW_HEADER = explorer.loadLanguageCheckIfDefined(data.LANG_LBL_PREVIEW_HEADER, explorer.LANG_LBL_PREVIEW_HEADER);
                    explorer.LANG_LBL_PREVIEW_ENLARGE = explorer.loadLanguageCheckIfDefined(data.LANG_LBL_PREVIEW_ENLARGE, explorer.LANG_LBL_PREVIEW_ENLARGE);
                    explorer.LANG_LBL_PREVIEW_NO_VIDEO_SUPPORT = explorer.loadLanguageCheckIfDefined(data.LANG_LBL_PREVIEW_NO_VIDEO_SUPPORT, explorer.LANG_LBL_PREVIEW_NO_VIDEO_SUPPORT);
                    explorer.LANG_LBL_NEW_FOLDER_HEADER = explorer.loadLanguageCheckIfDefined(data.LANG_LBL_NEW_FOLDER_HEADER, explorer.LANG_LBL_NEW_FOLDER_HEADER);
                    explorer.LANG_LBL_NEW_FOLDER_FOLDER_NAME = explorer.loadLanguageCheckIfDefined(data.LANG_LBL_NEW_FOLDER_FOLDER_NAME, explorer.LANG_LBL_NEW_FOLDER_FOLDER_NAME);
                    explorer.LANG_LBL_NEW_FOLDER_BT_CREATE = explorer.loadLanguageCheckIfDefined(data.LANG_LBL_NEW_FOLDER_BT_CREATE, explorer.LANG_LBL_NEW_FOLDER_BT_CREATE);
                }, "json")
                    .fail(function (){
                        explorer.log("Looks like '"+language+"' does not have a correct json structure or does not exist.");
                        explorer.log("Default language, English, will be loaded.");
                    })
                    .always(function (){
                        explorer.initContextMenuEvent();
                    });
            }else{
                explorer.log(explorer.language+" is not a .json file.");
                explorer.log("Default language, English, will be loaded.");
                explorer.initContextMenuEvent();
            }
        },
        loadLanguageCheckIfDefined: function(customLabel, defaultLabel){
            return customLabel !== undefined ? customLabel : defaultLabel;
        },
        createExplorer: function(){
            $("body").append("<div id='"+explorer.container.substr(1)+"'> </div>");
        },
        checkIfContainerExist: function (){
            if(!$(explorer.container).length){
                explorer.log(explorer.container +"'s <div> does not exist. You must either create the element that Explorer will use to create its structure, for" +
                    " example: <div id='explorerContainer' /> or just run explorer.createExplorer();" +
                    " before explorer.start(), and it will be build between your <body> tags. Explorer will not work without it.");
                return false;
            }
            if(!$(explorer.element).length){
                $(explorer.container).append("<div id='"+explorer.element.substr(1)+"'></div>");
            }
            return true;
        },
        start: function (){
            var resizeId = null;
            if(explorer.checkIfContainerExist() === false) {
                return;
            }
            window.AVAILABLE_ICON_EXTENSIONS = explorer.getAvailableIconExtensions();
            if(window.AVAILABLE_ICON_EXTENSIONS === null){
                explorer.log("It looks like you have not include 'explorerIcons.css' on your html document. Explorer will not start without it. :/");
                return;
            }
            explorer.started = true;
            explorer.createQuickFolderAccess(0);
            explorer.setExplorerPosition();
            $( window ).resize(function() {//it makes explorer responsive.
                explorer.resizeExplorer(); //irei acompanhar o desempenho da aplica??o em stage para ver se uso o truque abaixo ou n?o
                //clearTimeout(resizeId);//little trick to resize Explorer only after resizing get done.
                //resizeId = setTimeout(explorer.resizeExplorer, 50);
            });
            explorer.disableBrowserContextMenu();
            if(explorer.language !== undefined){
                explorer.loadLanguage();
            }else{
                explorer.initContextMenuEvent();
            }
            $(explorer.element).fadeIn("fast");
            explorer.showEmptyMessage();
            explorer.setIconsBackgroundColor(explorer.iconsBackgroundColor);
            $(explorer.container).on("drop", function (){
                if(explorer.currentParent == -1){
                    explorer.log("While searching dropped files will be uploaded at the root.", 1);
                    $(document).trigger( "droppedWhenSearching", ["While searching dropped files will be uploaded at the root."]);
                }
            });
        },
        setIconsBackgroundColor: function (color){
            var id = $("#iconsBackgroundColor");
            if(id.length){
                id.empty();
                id.append(".iconBorder{ background-color:"+color+"; }");
            }else{
                $("head").append("<style id=\"iconsBackgroundColor\"> .iconBorder{ background-color:"+color+"; }");
            }
        },
        resizeExplorer: function(){
            explorer.setExplorerPosition(); //resize Explorer
            explorer.addFiles(explorer.currentParent, true); //reorganize files' position.
			explorer.repositionBaseDialog();            
        },
        showEmptyMessage: function (){
            if(explorer.fileList.length === 0) {
                if ($("#emptyMessage").length) {
                    $("#emptyMessage").fadeIn("fast");
                } else {
                    $(explorer.element).append("<p id='emptyMessage' class='gray txtcenter'>" + explorer.LANG_EMPTY_MESSAGE + "</p>");
                }
            }
        },
        showContextMenu: function(file) {
            explorer.hide(["#contextMenu4Files", ".contextMenuVoid"]);
            $("#contextMenu4Files").removeClass("contextMenuFile contextMenuFolder");
            if(file == "void"){
                $("#contextIdTools").fadeIn("fast");
            }else{
                $("#contextMenu4Files").empty();
                if(explorer.selectedFiles.length > 1){
                    $("#contextMenu4Files").addClass("contextMenuFile");
                    $("#contextMenu4Files").append(
                        explorer.loadContextMenuOption(explorer.MOVE, explorer.CONTEXT_MENU_OPTIONS.MOVE, true) +
                        explorer.loadContextMenuOption(explorer.DELETE, explorer.CONTEXT_MENU_OPTIONS.DELETE, true) +
                        explorer.loadContextMenuOption(explorer.SHARE, explorer.CONTEXT_MENU_OPTIONS.SHARE, true) +
                        explorer.loadContextMenuOption(explorer.DOWNLOAD, explorer.CONTEXT_MENU_OPTIONS.DOWNLOAD, true) +
                        "</div>");
                }else{
                    var contextMenu = "contextMenuFile";
                    var openOption = "";
                    if(file.ext == "dir"){//if it is a folder, create an 'Open' option at the context menu.
                        openOption = explorer.loadContextMenuOption(explorer.OPEN, explorer.CONTEXT_MENU_OPTIONS.OPEN, false, file);
                        contextMenu = "contextMenuFolder";
                    }
                    $("#contextMenu4Files").append(
                        openOption +
                        explorer.loadContextMenuOption(explorer.MOVE, explorer.CONTEXT_MENU_OPTIONS.MOVE, false) +
                        explorer.loadContextMenuOption(explorer.RENAME, explorer.CONTEXT_MENU_OPTIONS.RENAME, false, file) +
                        explorer.loadContextMenuOption(explorer.DELETE, explorer.CONTEXT_MENU_OPTIONS.DELETE, false) +
                        explorer.loadContextMenuOption(explorer.SHARE, explorer.CONTEXT_MENU_OPTIONS.SHARE, false) +
                        explorer.loadContextMenuOption(explorer.DOWNLOAD, explorer.CONTEXT_MENU_OPTIONS.DOWNLOAD, false)+
                        explorer.customMenuOption(file)+
                        "</div>");
                    $("#contextMenu4Files").addClass(contextMenu);
                }
                $("#contextMenu4Files").addClass("opacity9 gray ft12 txtmargin bold");
                $("#contextMenu4Files").fadeIn("fast");
                $("#contextMenu4Files").css("z-index", 9999);
                $(".contextMenuOption").on("mousedown", function (){$("#contextMenu4Files").fadeOut("fast");});
            }
        },
        loadContextMenuOption: function(option, optionMenuState, all, file){
            var str;
            switch (option){
                case explorer.MOVE:
                    switch (optionMenuState) {
                        case explorer.ENABLED:
                            str = "<p class='contextMenuOption handCursor' onmousedown='explorer.move();'>" + (all ? explorer.LANG_LBL_MOVE_ALL : explorer.LANG_LBL_MOVE) + "</p>";
                            break;
                        case explorer.DISABLED:
                            str = "<p class='disabledContextMenuOption'>" + (all ? explorer.LANG_LBL_MOVE_ALL : explorer.LANG_LBL_MOVE) + "</p>";
                            break;
                        case explorer.HIDDEN:
                            str = "";
                            break;
                    }
                    break;
                case explorer.DELETE:
                    switch (optionMenuState) {
                        case explorer.ENABLED:
                            str = "<p class='contextMenuOption handCursor' onmousedown='explorer.delete();'>" + (all ? explorer.LANG_LBL_DEL_ALL : explorer.LANG_LBL_DEL) + "</p>";
                            break;
                        case explorer.DISABLED:
                            str = "<p class='disabledContextMenuOption'>" + (all ? explorer.LANG_LBL_DEL_ALL : explorer.LANG_LBL_DEL)+ "</p>";
                            break;
                        case explorer.HIDDEN:
                            str = "";
                            break;
                    }
                    break;
                case explorer.SHARE:
                    switch (optionMenuState) {
                        case explorer.ENABLED:
                            str = "<p class='contextMenuOption handCursor' onmousedown='explorer.share();'>" + (all ? explorer.LANG_LBL_SHARE_ALL : explorer.LANG_LBL_SHARE) + "</p>";
                            break;
                        case explorer.DISABLED:
                            str = "<p class='disabledContextMenuOption'>" + (all ? explorer.LANG_LBL_SHARE_ALL : explorer.LANG_LBL_SHARE)+ "</p>";
                            break;
                        case explorer.HIDDEN:
                            str = "";
                            break;
                    }
                    break;
                case explorer.DOWNLOAD:
                    switch (optionMenuState) {
                        case explorer.ENABLED:
                            str = "<p class='contextMenuOption handCursor' onmousedown='explorer.download();'>" + (all ? explorer.LANG_LBL_DOWNLOAD_ALL : explorer.LANG_LBL_DOWNLOAD) + "</p>";
                            break;
                        case explorer.DISABLED:
                            str = "<p class='disabledContextMenuOption'>" + (all ? explorer.LANG_LBL_DOWNLOAD_ALL : explorer.LANG_LBL_DOWNLOAD)+ "</p>";
                            break;
                        case explorer.HIDDEN:
                            str = "";
                            break;
                    }
                    break;
                case explorer.NEW_FOLDER:
                    switch (optionMenuState) {
                        case explorer.ENABLED:
                            str =  "<p class='contextMenuOption handCursor' style='margin-top:10px;' onmousedown='explorer.newFolder();'>"+explorer.LANG_LBL_NEW_FOLDER+"</p>";
                            break;
                        case explorer.DISABLED:
                            str = "<p class='disabledContextMenuOption' style='margin-top:10px;'>" + explorer.LANG_LBL_NEW_FOLDER + "</p>";
                            break;
                        case explorer.HIDDEN:
                            str = "";
                            break;
                    }
                    break;
                case explorer.UPLOAD:
                    switch (optionMenuState) {
                        case explorer.ENABLED:
                            str =  "<p class='contextMenuOption handCursor' onmousedown='explorer.upload();'>"+explorer.LANG_LBL_UPLOAD+"</p>";
                            break;
                        case explorer.DISABLED:
                            str = "<p class='disabledContextMenuOption'>" + explorer.LANG_LBL_UPLOAD + "</p>";
                            break;
                        case explorer.HIDDEN:
                            str = "";
                            break;
                    }
                    break;
                case explorer.RENAME:
                    switch (optionMenuState) {
                        case explorer.ENABLED:
                            str =  "<p class='contextMenuOption handCursor' onmousedown='explorer.rename("+file.id+", false);'>"+explorer.LANG_LBL_RENAME+"</p>";
                            break;
                        case explorer.DISABLED:
                            str = "<p class='disabledContextMenuOption'>" + explorer.LANG_LBL_RENAME + "</p>";
                            break;
                        case explorer.HIDDEN:
                            str = "";
                            break;
                    }
                    break;
                case explorer.OPEN:
                    switch (optionMenuState) {
                        case explorer.ENABLED:
                            str =  "<p class='contextMenuOption handCursor' onmousedown='explorer.open("+file.id+");'>"+explorer.LANG_LBL_OPEN+"</p>";
                            break;
                        case explorer.DISABLED:
                            str = "<p class='disabledContextMenuOption'>" + explorer.LANG_LBL_OPEN + "</p>";
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
        createBaseDialog: function(width, height, options) {
            if(options === undefined){
                options = new Array();
            }
            if(width === undefined){
                width = 470;
            }
            options["width"] = $.isNumeric(width) ? width+"px" : width;
            if(height === undefined){
                height = 400;
            }
            options["height"] = $.isNumeric(height) ? height+"px" : height;
            if(options !== undefined){
                if(options["min-width"] === undefined){
                    options["min-width"] = $.isNumeric(width) ? width : 470;
                }
                if(options["min-height"] === undefined){
                    options["min-height"] = $.isNumeric(height) ? height : 400;
                }
            }
            $(".baseDialog").remove();
            $("body").append("<div class='baseDialog radius10 opacity98' ><input id='defaultWidth' type='hidden' value='"+options["width"]+"'/>"+
				"<input id='defaultHeight' type='hidden' value='"+options["height"]+"'/></div>");
            $(".baseDialog").css({width: options["width"], height: options["height"], "min-width": options["min-width"], "min-height" : options["min-height"]});
            var halfScreenWidth = $(window).width()/2;
            var halfBaseDialogWidth = $(".baseDialog").width()/2;
            $(".baseDialog").css("left", (halfScreenWidth - halfBaseDialogWidth ) + "px" );
            $(".baseDialog").css("top", "70px" );
        },
        loadBaseDialog: function(content, def) {
            $(".baseDialog").append("<div class='closeBaseDialog handCursor displayNone' style='top: 10px; margin-right: 10px; float: right;'" +
                "title='Close' alt='Close' onclick='explorer.closeBaseDialog()'/>");
            $(".baseDialog").append("<div id='baseDialogContent' style='top:30px'> </div>");
            var patt = /\.tmp$/i;
            if(patt.test(content) === true){//if it is a template file, load it
                $("#baseDialogContent").load(content, function (){
                    if(typeof def != 'undefined'){
                        def.resolve();
                    }
                });
            }else{
                $("#baseDialogContent").append(content);
            }
			explorer.repositionBaseDialog();
        },
        showBaseDialog: function(hideCloseButton, def) {
            if(!$(".baseDialog").ready()){
                this.showBaseDialog(hideCloseButton, def);
                return;
            }
            $( ".baseDialog" ).show(explorer.baseDialogEffect, {}, 500);
            setTimeout(function () {
                if(hideCloseButton !== true) {
                    $(".closeBaseDialog").fadeIn("fast");
                }
                $(".baseDialog").ready(function (){
                    if(def !== undefined){
                        def.resolve();
                    }
                });
            }, 600);
        },
        closeBaseDialog: function() {
            $(".closeBaseDialog").fadeOut(100);
            $( "#baseDialogContent" ).fadeOut(100);
            setTimeout(function () {
                $( ".baseDialog" ).hide( explorer.baseDialogEffect, {}, 300);
            }, 150);
            setTimeout(function () {
                $('.baseDialog').empty();
            }, 800);
            $(".baseDialog").trigger( "closeDialogEvent");
        },
		repositionBaseDialog: function (){
			if($(".baseDialog").length){//if base dialog exists, reposition it
				var baseDialogWidth = $(".baseDialog").outerWidth();
				var baseDialogMinWidth = Number($(".baseDialog").css("min-width").replace("px", ""));
				var baseDialogDefaultWidth = Number($(".baseDialog").find("#defaultWidth").val().replace("px", ""));
				var windowWidth = $(window).width();
				if((baseDialogWidth != baseDialogMinWidth && baseDialogWidth > windowWidth && baseDialogMinWidth < windowWidth) || (baseDialogWidth < windowWidth && baseDialogWidth < baseDialogDefaultWidth)){
					$(".baseDialog").css("width", (windowWidth - 10) + "px");
				}
				var baseDialogHeight = $(".baseDialog").outerHeight();
				var baseDialogMinHeight = Number($(".baseDialog").css("min-height").replace("px", ""));
				var baseDialogDefaultHeight = Number($(".baseDialog").find("#defaultHeight").val().replace("px", ""));
				var windowHeight = $(window).height();
				if((baseDialogHeight != baseDialogMinHeight && baseDialogHeight > windowHeight && baseDialogMinHeight < windowHeight) || (baseDialogHeight < windowHeight && baseDialogHeight < baseDialogDefaultHeight)){
					$(".baseDialog").css("height", (windowHeight - 10) + "px");
				}
                explorer.centralize(".baseDialog");
            }
		},
        centralize: function (id) {
            var width = $(".baseDialog").outerWidth() / 2;
            var windowWidth = $(window).width() / 2;
            var height = $(".baseDialog").outerHeight() / 2;
            var windowHeight = $(window).height() / 2;
            $(id).css({"left": (windowWidth - width) + "px", "top": (windowHeight - height) + "px"});
        },
        log: function (str, opt){
            if(explorer.debugMode){
                if(opt == 1){
                    console.info(str);
                }else if(opt == 2){
                    console.dir(str);
                }else{
                    console.warn(str);
                }
            }
        },
        getExplorerRootFolder: function (){
            var scripts = document.getElementsByTagName("script");
            var index;
            for(index=0; index < scripts.length; index++){
                if(scripts[index].outerHTML.indexOf("explorer.js") != -1){
                    break;
                }
            }
            //scripts[index].attributes.src.nodeValue deprecated
            return scripts[index].attributes.src.value.replace("/js/explorer.js","");
        },
        destroy: function (element, explode){
            if(element === undefined || element === null){
                $(explorer.element).remove();
            }else{
                var patt = /#|\.*/i;
                if(patt.test(element) === true){//if it is a class or id of an element
                    if(explode){
                        $(element).effect("explode", null, 700);
                    }
                    setTimeout(function () {$(element).remove();}, 750);
                }else{
                    explorer.log("You must enter a valid id, or css class. For example, '#my_id' or '.my_class'.");
                }
            }
        },
        open: function(folderId) {
            explorer.selectedFiles = [];
            $(".file").fadeOut(200);
            var index = explorer.checkIfExists(folderId);
            var item = new quickAccessItem(folderId, explorer.fileList[index].name);
            explorer.currentPath.push(item);
            setTimeout( function() {
                explorer.addFiles(Number(folderId));
            }, 250);
            setTimeout( function() {
                $(".file").fadeIn("fast");
            }, 300);
        },
        rename: function(id, save){
            if(save){//if the user has finished renaming this file.
                var index = explorer.checkIfExists(id);
                var newName = $("#"+id).find("input").val();
                if(newName.trim() === ""){
                    newName = "none";
                    $("#"+id).find("input").val(newName);
                }
                explorer.fileList[index].name = newName;
                $("#"+id).find("input").attr("readonly", "readonly");
                $("#"+id).find("input").css({"border":"none", "cursor": "default"});
                $("#"+id).trigger( "fileUpdateEvent", [{"file": explorer.fileList[index]}, explorer.EVENT_RENAME]);
            }else{
                $("#"+id).find("input").removeAttr("readonly");
                $("#"+id).find("input").css({"border":"2px dashed gray", "cursor": "text"});
                setTimeout( function () {moveCursorToEnd($("#"+id).find("input"));}, 300);
            }
        },
        move: function() {
            var def = $.Deferred();
            explorer.createBaseDialog(600, "auto");
            explorer.loadBaseDialog(explorer.getExplorerRootFolder()+"/templates/move.tmp", def);
            $.when(def).then(function () {
                explorer.showBaseDialog(false);
                $("#moveHeader").text(explorer.LANG_LBL_MOVE_HEADER);
                $("#buttonMoveFiles").append(explorer.LANG_LBL_MOVE_BT_MOVE);
                $("#buttonMoveFiles").prop("title",explorer.LANG_LBL_MOVE_BT_MOVE_TITLE);
                if(explorer.currentParent != explorer.ROOT){
                    explorer.createDestFolder(explorer.ROOT);
                }
                $.each(explorer.fileList, function(i, file) {
                    //for(var file of explorer.fileList){
                    if(file.ext == "dir" && file.id != explorer.currentParent){
                        var isMovingToItself = $.grep(explorer.selectedFiles, function(val, i) {//A folder should not be able to move to itself right?
                            if(val.id == file.id){
                                return this;
                            }
                        });
                        if(isMovingToItself.length > 0){
                            return;
                        }
                        //creating folders to move your files in
                        explorer.createDestFolder(file);
                    }
                });
                $("#buttonMoveFiles").on("click", function () {explorer.clientMove(explorer.TEMP_VAR);});
            });
        },
        createDestFolder: function (file){
            if(isNaN(file)){//it is a custom folder
                var id = file.id;
                var name = file.name;
            }else{//it is ROOT folder
                var id = file;
                var name = "Root";
            }
            $("#foldersList").append("<div id='mv_"+id+"' class='file mvFolderItem fileButton' style='float:left;'>"+
                "<div class='center iconBorder'><div style='margin-left: 3px;' class='dir'></div></div> <input class='txtcenter ft11 inputFileName'"+
                "maxlength='13' readonly='readonly' value='"+name+"'/></div>");
            $("#mv_"+id).on("mousedown", function () {
                $(".movFolderSelect").remove();
                $(".mvFolderItem").css("border", "0px solid blue");
                $(this).append("<div id='selec_mv_id"+id+"' class='opacity4 _selected movFolderSelect'> </div>");
                $(this).css("border", "1px solid blue");
                $("#buttonMoveFiles").removeProp("disabled");
                $("#buttonMoveFiles").removeClass("explorerButtonDisabled");
                explorer.TEMP_VAR = this.id.replace("mv_", "");
            });
            explorer.initMouseOverEvent();
        },
        clientMove: function(newFolderId){
            var fileIndex = -1, destFolderIndex = -1;
            var def = $.Deferred();
            var folders = new Array();
            var files = new Array();
            for(var x = 0; x < explorer.selectedFiles.length; x++) {
                fileIndex = explorer.checkIfExists(explorer.selectedFiles[x].id);
                destFolderIndex = explorer.checkIfExists(newFolderId);
                if (explorer.selectedFiles[x].ext == "dir") {
                    var subfolders = explorer.getMySubFolders(explorer.selectedFiles[x].id);
                    if ($.inArray(newFolderId, subfolders) != -1) {
                        $(document).trigger( "movingToItself", [explorer.selectedFiles[x], explorer.LANG_LBL_MOVE_FOLDER_ERROR_MSG.replace("{folderName}", "<b>" + explorer.selectedFiles[x].name + "</b>")] );
                        explorer.selectedFiles.splice(x, 1);
                    }else{
                        folders.push(explorer.selectedFiles[x]);
                    }
                }else{
                    files.push(explorer.selectedFiles[x]);
                }
            }
            explorer.serverMove(newFolderId,files, folders, def);
            $.when(def).then(function(response){
                if(response === true){
                    explorer.closeBaseDialog();
                    for(var x = 0; x < explorer.selectedFiles.length; x++){
                        fileIndex = explorer.checkIfExists(explorer.selectedFiles[x].id);
                        destFolderIndex = explorer.checkIfExists(newFolderId);
                        if(destFolderIndex != -1 && explorer.fileList[fileIndex].parent == explorer.currentParent && explorer.fileList[destFolderIndex].parent == explorer.currentParent){
                            $("#"+explorer.fileList[fileIndex].id).css("z-index",999).animate({
                                top: $("#"+explorer.fileList[destFolderIndex].id).css("top"),
                                left: $("#"+explorer.fileList[destFolderIndex].id).css("left")
                            }, 1000, function () {
                                $(this).hide("scale", {percent: 0}, 700);
                                setTimeout(function (){$("#"+explorer.fileList[fileIndex].id).css("z-index",1);}, 750);
                            });
                        }else{
                            $( "#"+explorer.fileList[fileIndex].id ).hide("clip", {}, 500);
                        }
                        explorer.fileList[fileIndex].parent = Number(newFolderId);
                        explorer.fileList[fileIndex].placed = false;
                        //explorer.fileList[fileIndex].field = -1;
                    }
                }
            });
        },
        search: function (string){
            var noFile = true;
            if(string.trim() === ""){
                explorer.addFiles(0);
                return;
            }
            explorer.fields.fieldList = [];
            explorer.fields.usedFields = 0;
            $(".quickAccessLink").css("text-decoration", "line-through");
            if(explorer.currentParent != -1){//ao pesquisar, todos os arquivos que estavam sendo exibidos no momento, devem perder seus lugares na tela
                //Assim, quando o usu?rio clicar no link de acesso r?pido, ele ser? renderizado novamente.
                for(var x = 0; x < explorer.fileList.length; x++){
                    explorer.fileList[x].placed = false;
                }
            }
            explorer.currentParent = -1;
            $(".file, .field").remove();//Delete each file and field on the screen before add the new ones.
            for(var x = 0; x < explorer.fileList.length; x++){
                if(explorer.fileList[x].name.toLowerCase().indexOf(string.toLowerCase()) != -1){
                    var file = explorer.fileList[x];
                    file.found = true;
                    explorer.addFiles(file);
                    noFile = false;
                }
            }
            if(noFile){
                $("#emptyMessage").text("No file found for: "+string);
                $("#emptyMessage").fadeIn("fast");
            }else{
                $("#emptyMessage").text(explorer.LANG_EMPTY_MESSAGE);
            }
        },
        serverMove: function(newFolderId, files, folders, def){
            def.resolve(true);
        },
        getMySubFolders: function (folderId){
            var folders = "";
            $.each(explorer.fileList, function(i, item) {
                //for (item of explorer.fileList){
                if(item.ext == "dir" && item.parent == folderId){
                    folders+= item.id + "," +explorer.getMySubFolders(item.id);
                }
            });
            folders = $.grep(folders.split(","), function(val, i) { if(val !== "") return this; });
            return folders;
        },
        delete: function() {
            explorer.clientDelete();
        },
        clientDelete: function (){
            var def = $.Deferred();
            explorer.serverDelete(def);
            $.when(def).then(function(success){
                if(success === true) {
                    for (var x = 0; x < explorer.selectedFiles.length; x++) {
                        if (explorer.selectedFiles[x].ext == "dir") {
                            explorer.deleteFolderRecursively(explorer.selectedFiles[x].id);
                        }
                        var index = explorer.checkIfExists(explorer.selectedFiles[x].id);//its index will change since his children will be removed from the list first
                        var list = explorer.fields.fieldList[explorer.fileList[index].field].filesOn;
                        explorer.fields.fieldList[explorer.fileList[index].field].filesOn = $.grep(list, function (val) {
                            return val != explorer.fileList[index].id;
                        });
                        if (explorer.fields.fieldList[explorer.fileList[index].field].filesOn.length === 0) {
                            explorer.fields.usedFields -= 1;
                        }
                        explorer.destroy("#" + explorer.selectedFiles[x].id, true);
                        explorer.fileList = $.grep(explorer.fileList, function (val, i) {
                            return val.id != explorer.fileList[index].id;
                        });
                    }
                    explorer.selectedFiles = [];
                    explorer.showEmptyMessage();
                }else{
                    explorer.log("Looks like your server side delete function did not return true, so explorer is not going to delete the selected files.");
                }
            });
        },
        deleteFolderRecursively: function(folderId){
            for(var x = 0; x < explorer.fileList.length; x++){
                if(explorer.fileList[x].parent == folderId){
                    if(explorer.fileList[x].ext == "dir"){
                        var subfolderId = explorer.fileList[x].id;
                        explorer.deleteFolderRecursively(explorer.fileList[x].id);
                        explorer.fileList = $.grep(explorer.fileList, function(val, i) {
                            return val.id != subfolderId;
                        });
                        x = 0; //reset the counter cuz fileList has changed its files indexes
                    }else{
                        explorer.fileList = $.grep(explorer.fileList, function(val, i) {
                            return val.id != explorer.fileList[x].id;
                        });
                        x = 0; //reset the counter cuz fileList has changed its files indexes
                    }
                }
            }
        },
        serverDelete: function (def){
            def.resolve(true);
        },
        share: function() {

        },
        download: function() {

        },
        dbclick: function(file){
            explorer.TEMP_VAR = file;
            if(file.ext == "dir"){
                explorer.open(file.id);
            }else{
                explorer.preview(file);
            }
        },
        newFolder: function() {
            var def = $.Deferred();
            explorer.createBaseDialog(400, 300);
            explorer.loadBaseDialog(explorer.getExplorerRootFolder()+"/templates/newFolder.tmp", def);
            $.when(def).then(function () {
                explorer.showBaseDialog();
                $("#inpFolderName").on("keyup", function () {
                    if ($(this).val().length < 1) {
                        $("#buttonCreateFolder").addClass("explorerButtonDisabled");
                        $("#buttonCreateFolder").prop("disabled", "disabled");
                    } else {
                        $("#buttonCreateFolder").removeClass("explorerButtonDisabled");
                        $("#buttonCreateFolder").removeProp("disabled");
                    }
                });
                $("#buttonCreateFolder").on("click", function () {
                    explorer.clientNewFolder($("#inpFolderName").val());
                });
                $("#inpFolderName").focus();
                $("#newFolderHeader").text(explorer.LANG_LBL_NEW_FOLDER_HEADER);
                $("#folderName").text(explorer.LANG_LBL_NEW_FOLDER_FOLDER_NAME);
                $("#buttonCreateFolder").html(explorer.LANG_LBL_NEW_FOLDER_BT_CREATE);
            });
        },
        clientNewFolder: function(folderName){
            var def = $.Deferred();
            explorer.serverNewFolder(folderName, def);
            $.when(def).then(function(folderId) {
                if($.isNumeric(folderId)){
                    explorer.addFiles(new File(folderId, folderName, "dir", explorer.currentParent));
                    explorer.closeBaseDialog();
                }else{
                    explorer.log("explorer.serverNewFolder() either did not return the folder ID or its result is not a number. Result: "+folderId);
                }
            });
        },
        serverNewFolder: function(folderName, def) {
            return def.resolve(Math.floor((Math.random() * 500) + 200));
        },
        upload: function() {

        },
        customMenuOption: function (file){
          return "";
        },
        preview: function (file){
            var def = $.Deferred();
            explorer.TEMP_VAR = file;
            explorer.createBaseDialog("auto", "auto", {"min-width": "350px", "min-height": "300px"});
            explorer.loadBaseDialog(explorer.getExplorerRootFolder()+"/templates/preview.tmp", def);
            $.when(def).then(function (){
                explorer.showBaseDialog(false);
                if($("#previewHeader").length && $("#previewHeader").text().length === 0){
                    $("#previewHeader").text(explorer.LANG_LBL_PREVIEW_HEADER);
                }
                if($("#previewEnlarge").length && $("#previewEnlarge").text().length === 0){
                    $("#previewEnlarge").html(explorer.LANG_LBL_PREVIEW_ENLARGE);
                }
                $("#previewNoVideoSupport").text(explorer.LANG_LBL_PREVIEW_NO_VIDEO_SUPPORT);
            });
        },
        getAvailableIconExtensions: function (){
            var files = document.styleSheets;
            var extensions = new Array();
            for(var x = 0; x < files.length; x++){
                if(files[x].href === null || files[x].href === undefined){
                    continue;
                }
                if(files[x].href.indexOf("explorerIcons") != -1){
                    for(var y = 0; y < files[x].cssRules.length; y++){
                        extensions.push(files[x].cssRules[y].selectorText.replace(".", ""));
                    }
                    break;
                }
            }
            return extensions.length === 0 ? null : extensions;
        }
    };
    return explorer;
}
function removeClass(objs,classes){
    $.each(objs, function(i, obj) {
        $.each(classes, function(i, clasS) {
            $(obj).removeClass(clasS);
        });
    });
}
function addClass(objs,classes){
    $.each(objs, function(i, obj) {
        $.each(classes, function(i, clasS) {
            $(obj).addClass(clasS);
        });
    });
}

function File(id, name, ext, parent, field){
    this.id = id;
    this.parent = parent === undefined || parent === null ? 0 : parent;
    this.field = field === undefined || field === null ? -1 : field;
    this.placed = false;
    this.name = name;
    this.getAvailableIconExtensions = function (){
        var files = document.styleSheets;
        var extensions = new Array();
        for(var x = 0; x < files.length; x++){
            if(files[x].href === null || files[x].href === undefined){
                continue;
            }
            if(files[x].href.indexOf("explorerIcons") != -1){
                for(var y = 0; y < files[x].cssRules.length; y++){
                    extensions.push(files[x].cssRules[y].selectorText.replace(".", ""));
                }
                break;
            }
        }
        return extensions.length === 0 ? null : extensions;
    };
    this.checkIcon = function(){
        ext = ext === undefined ? "" : ext;
        if(typeof AVAILABLE_ICON_EXTENSIONS == 'undefined' || AVAILABLE_ICON_EXTENSIONS === null){
            AVAILABLE_ICON_EXTENSIONS = this.getAvailableIconExtensions();
            if(AVAILABLE_ICON_EXTENSIONS === null){
                return;
            }
        }
        var extIndex = AVAILABLE_ICON_EXTENSIONS.indexOf(ext.toLowerCase());
        if(extIndex == -1 || AVAILABLE_ICON_EXTENSIONS.indexOf("_".concat(ext.toLowerCase())) != -1){
            return "noIcon";
        }else{
            return ext.toLowerCase();
        }
    };
    this.getName = function(){
        var name = this.name;
        if(name.length > 13){
            name = name.substring(0, 13) + "...";
        }
        return name;
    };
    this.getExtension = function (file){
        file = file === undefined ? this.ext : file;
        var str = file.split(".");
        var ext = str[str.length - 1];
        return ext;
    };
    this.ext = this.checkIcon();
}

function Field(id, element, filesOn, top, left){
    this.id = "field_"+id;
    this.element = element;
    this.filesOn = filesOn;
    this.top = top;
    this.left = left;
    this.fieldNumber = function () {
        return Number(this.id.replace("field_",""));
    };
}

function quickAccessItem(id, name){
    this.id = id;
    this.name = name;
}

function moveCursorToEnd(input) {
    var originalValue = input.val();
    input.val('');
    input.focus().val(originalValue);
}