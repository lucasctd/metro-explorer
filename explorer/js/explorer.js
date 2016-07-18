function Explorer(width, height, container, position, fileList){
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
        CONTEXT_MENU_OPTIONS: {DOWNLOAD: 0, DOWNLOAD_ALL: 0, UPLOAD: 0, UPLOAD_ALL: 0, MOVE: 0, MOVE_ALL: 0,
        DELETE: 0, DELETE_ALL: 0, SHARE: 0, SHARE_ALL: 0, RENAME: 0, NEW_FOLDER: 0, OPEN: 0},
        DOWNLOAD: 0, DOWNLOAD_ALL: 1, UPLOAD : 2, UPLOAD_ALL: 3, MOVE: 4, MOVEL_ALL: 5, DELETE : 6, DELETE_ALL: 7,
        SHARE : 8, SHARE_ALL: 9, RENAME : 10, NEW_FOLDER : 11, OPEN : 12,
        ROOT: 0,
        GO_UP_ID: -1,
        baseDialogEffect: "fade",
        debugMode: false,
        container: container === undefined ? "#explorerContainer" : container,
        element: "#explorer",
        fields: {"fieldList" : [], "usedFields" : 0},
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
        browserContextMenuDisabled: true,//Browser Context Menu must be disabled to make everything works fine
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
        addFiles: function (param, resize, def) {
            var listfilesWithField = [], listfilesWithoutAField = [];
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
                //console.log($(".file, .field"));
                $(explorer.element).find(".file, .field").remove();
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
                    // do not show it on the screen
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
                if(file.field != -1){//load files on each list
                    listfilesWithField.push(file);
                }else{
                    listfilesWithoutAField.push(file);
                }
               // if(file.field !== undefined && file.field != -1 && explorer.fields.fieldList[file.field] !== undefined){
                   
              //  }else{
              //      explorer.placeFileAutomatically(file);
              //  }
                index = explorer.checkIfExists(file.id);
                explorer.fileList[index].placed = true; //field's index
                if(explorer.fileList[index].uploading === true){
                    explorer.fileList[index].uploader.fileIndex = index;
                    explorer.fileList[index].uploader.createProgressStructure(file.id);
                    explorer.fileList[index].uploader.progressEvent({lengthComputable: null}, true);
                }
            });
            $.each(listfilesWithField, function(i, file) {//first load files that already has a field
              explorer.placeFileWithField(file, resize);
            });
            $.each(listfilesWithoutAField, function(i, file) {//then, load files which does not have a field (-1)
              explorer.placeFileAutomatically(file);
            });
            explorer.initMouseOverEvent();
            if(def !== undefined){
              def.resolve();
            }
        },
        placeFileWithField: function (file, resize){
            let top = (explorer.fields.fieldList[file.field].top + 5)+"px;";
            let left = (explorer.fields.fieldList[file.field].left + 5)+"px;";
            $(explorer.element).append("<div id='"+file.id+"' class='file fileButton draggable displayNone' style='position: absolute; top:"+ top +
                "left:"+left+"'> <div class='center iconBorder'><div class='"+file.ext+" center'></div></div> "+
                "<div id='input"+file.id+"' style='display:inline-block; position:relative;' title='"+file.name+"'> "+
                "<input class='txtcenter ft11 inputFileName'"+
                "maxlength='30' readonly='readonly' title='"+file.name+"' value='"+file.getName().replace(/'/g,"&apos;")+"'/>"+
                "<div style='position:absolute; left:0; right:0; top:0; bottom:0;'></div></div> <div id='selec_id"+file.id+"' class='opacity4'> </div> <div class=\"moveToTooltip\">Move to</div>"+
                "</div>");
            explorer.fields.fieldList[file.field].filesOn.push(file.id);
            let field = explorer.fields.fieldList[file.field];
            file.getElement().css("top", (field.filesOn.length > 1 ? field.top + 5 - ((field.filesOn.length-1)*3)  : field.top + 5) +"px");
            file.getElement().css("left", (field.filesOn.length > 1 ? field.left + 5 + ((field.filesOn.length-1)*3) : field.left + 5) + "px");
            if(resize === true){
                file.getElement().css("display", "block");
            }else{
                file.getElement().fadeIn(300);
            }
            explorer.fields.usedFields++;
            explorer.loadFileEvents(file);
        },
        placeFileAutomatically: function (file, resize){
            for(let x=0; x < explorer.fields.fieldList.length; x++){
                if(explorer.fields.fieldList[x].filesOn.length === 0){
                    let top = (explorer.fields.fieldList[x].top + 5)+"px;";
                    let left = (explorer.fields.fieldList[x].left + 5)+"px;";
                    $(explorer.element).append("<div id='"+file.id+"' class='file fileButton draggable displayNone' style='position: absolute; top:"+top+
                        "left:"+left+"'> <div class='center iconBorder'><div class='"+file.ext+" center'></div></div>"+
                        "<div id='input"+file.id+"' style='display:inline-block; position:relative;' title='"+file.name+"'> "+
                        "<input class='txtcenter ft11 inputFileName' "+
                        "maxlength='30' readonly='readonly' title='"+file.name+"' value='"+file.getName().replace(/'/g,"&apos;")+"' />"+
                        "<div style='position:absolute; left:0; right:0; top:0; bottom:0;'></div></div> <div id='selec_id"+file.id+"' class='opacity4'> </div> <div class=\"moveToTooltip\">Move to</div>"+
                        "</div>");
                    if(resize === true){
                        file.getElement().css("display", "block");
                    }else{
                        file.getElement().fadeIn(300);
                    }
                    explorer.fields.fieldList[x].filesOn.push(file.id);
                    explorer.fields.usedFields++;
                    let index = explorer.checkIfExists(file.id);
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
                "<div class='center iconBorder'><div class='goUp center'></div></div><br /><p class='txtcenter ft11'>"+explorer.LANG_LBL_UP+"</p></div>");
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
            var fileElem = file.getElement();
            //rename event
            fileElem.find("input").on("blur", function (e){
                explorer.rename(file, true);
            });
            //double click event
            fileElem.dblclick(function() {
                explorer.dbclick(file);
            });
            //Add click event
            fileElem.on("mousedown", function(e){
                $(document).trigger( "contextMenuEvent", {event: e, file: file});
                if((!$(e.target).is('._selected') && e.which == 3) || !explorer.multiSelect){//if it was not selected and it is a right click,
                    explorer.selectedFiles = [];//clean the list to add a new one
                    $("._selected").removeClass('_selected');
                    $(".file").css("border", "1px solid darkgray");
                }
                var result = $.grep(explorer.selectedFiles,function(e){return e.id == file.id;});//check if this file is already in the list
                if(result.length === 0){//if not, add it
                    explorer.selectedFiles.push(file);
                }
                if($(e.currentTarget).hasClass("uploading")){//if it is uploading, does not handle any event
                    return;
                }
                if(e.which == 1){//check if it is a left click
                    explorer.hide([".contextMenuFile", ".contextMenuFolder", "#contextIdTools"]);
                    if(!$(e.target).is('._selected') && fileElem.find("input").is('[readonly]') && !$(e.target).is(".errorStyle, .errorFont")){//if it is not selected, add selected class
                        fileElem.css("border", "1px solid blue");
                        fileElem.find("#selec_id"+file.id).addClass("_selected");
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
            const fileDivWidth = 130;
            const fileDivHeight = 150;
            var fieldListSize = explorer.fields.fieldList.length;
            var filePerLine = parseInt(explorer.getExplorerCurrentWidth() / fileDivWidth);
            for(let x = fieldListSize; x < (fieldListSize + numberFields); x++){
               // var create = (function () {//necessary to fix js escope problems :/ 'Let' keyword would solve this problem :S
                let field = new Field(x, $("<div id='field_"+x+"' class='field' style='top:"+((parseInt(x/filePerLine)*fileDivHeight)+8)+"px; left: "+(parseInt(x%filePerLine)*fileDivWidth)+"px;'/>"),
                    [], parseInt(x/filePerLine)*fileDivHeight, parseInt(x%filePerLine)*fileDivWidth);
                $(explorer.element).append(field.element);
                field.element.droppable({
                    drop: function( event, ui ) {
                        field.element.css("border-width","0px");
                        var file = explorer.getFileById(ui.draggable.context.id);
                        var topFile = field.filesOn[field.filesOn.length - 1];
                        file.getElement().find(".moveToTooltip").fadeOut();
                        if(topFile == explorer.GO_UP_ID){//move to parent's folder
                          explorer.selectedFiles = [file];
                          let parent = explorer.getFileById(explorer.currentParent);
                          explorer.clientMove(parent.parent, true);
                          return;
                        }else{//move to this folder
                            topFile = explorer.getFileById(topFile);
                          if(topFile && topFile.ext == "dir" && topFile.id != file.id){//move it to this folder
                            explorer.selectedFiles = [file];
                            explorer.clientMove(topFile.id);
                            return;
                          }
                        }//if the top file is not a folder, place it on the top
                        if($.inArray(file.id, field.filesOn) == -1){//do not repeat files on the field...
                          field.filesOn.push(Number(file.id));
                          var index = explorer.checkIfExists(file.id);
                          explorer.fileList[index].field = field.fieldNumber();//update file field
                        }
                        $(field.element).trigger("fileUpdateEvent", [{"file":file}, explorer.EVENT_DROP]);//fire event
                            file.getElement().animate({//organize stack of files
                                left: field.filesOn.length > 1 ? field.left + 5 + ((field.filesOn.length-1)*3) : field.left + 5,
                                top: field.filesOn.length > 1 ? field.top + 5 - ((field.filesOn.length-1)*3)  : field.top + 5
                            },
                            {//it's an animate's method
                                start: function (e){
                                    $("#"+e.elem.id).css("z-index", field.filesOn.length * 20);//make sure it will be visible
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
                        var topFile = field.filesOn[field.filesOn.length - 1];
                        var file = explorer.getFileById(ui.draggable.context.id);
                        if(topFile == explorer.GO_UP_ID){//if it is goUp, do not try to get the top file.
                          var parent = explorer.getFileById(explorer.currentParent);
                          var parentName = parent.parent == explorer.ROOT ? "Root" : explorer.getFileById(parent.parent).name;
                          //file.getElement().find(".moveToTooltip").html("<span style='color: #101973'>Move to <b>"+parent.name+"</b> parent folder</span> (".concat(parentName+")")).fadeIn();
                          file.getElement().find(".moveToTooltip").html("<span style='color: #101973'>Move to ".concat(parentName)).fadeIn();
                        }else{
                          topFile = explorer.getFileById(topFile);
                          if(topFile && topFile.ext == "dir" && topFile.id != file.id){//if it is a folder
                            file.getElement().find(".moveToTooltip").html("<span style='color: #101973'>Move to</span> ".concat(topFile.name)).fadeIn();
                          }else{
                            file.getElement().find(".moveToTooltip").fadeOut();
                          }
                        }
                    }
                  });
                  explorer.fields.fieldList.push(field);
                  if(isGoUp === true){
                      explorer.fields.fieldList[0].filesOn = [explorer.GO_UP_ID];
                  }
                //});
               // create();
            }
        },
        getFileById: function(id){
          return explorer.fileList[explorer.checkIfExists(id)];
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
            var currentPath = [];
            var quickAccess= $("#quickAccess");
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
            $("#expNewFolder").on("click", function (){
                explorer.newFolder();
            });
            $("#expUpload").on("click", function (){
                explorer.upload();
            });
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
            $(".contextMenuOption").on("click", function (){
              if(isNotDisabled(this)){
                  $("#contextIdTools").fadeOut("fast");
              }
            });
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
            var language = explorer.language;
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
            $("body").prepend("<div id='"+explorer.container.substr(1)+"'> </div>");
        },
        checkIfContainerExist: function (){
            if(!$(explorer.container).length){
                explorer.log(explorer.container +"'s <div> does not exist. You must either create the element that Explorer will use to create its structure, for" +
                    " example: <div id='explorerContainer' /> or just run explorer.createExplorer();" +
                    " right after you have instantiated explorer, and it will be build between your <body> tags. Explorer will not work without it.");
                return false;
            }
            if(!$(explorer.element).length){
                $(explorer.container).append("<div id='"+explorer.element.substr(1)+"'></div>");
            }
            return true;
        },
        start: function (){
            //setting default language
            this.language = this.language === undefined ? explorer.getExplorerRootFolder()+"/lang/en-US.json": this.language;
            this.loadLanguage();
            var resizeId = null, preload = null;
            if(explorer.checkIfContainerExist() === false) {
                return;
            }
            window.AVAILABLE_ICON_EXTENSIONS = explorer.getAvailableIconExtensions();
            if(window.AVAILABLE_ICON_EXTENSIONS === null){
                explorer.log("It looks like you have not include 'explorerIcons.css' on your html document. Explorer will not start without it. :/");
                return;
            }
            if(typeof Preload != "undefined"){
              if(preloadIcons){
                 preload = new Preload(explorer.iconPaths, LoadType.ASYNC).run();
              }
            }else{
              explorer.log("Looks like you have not include Preload class. Thus, icons preload will not be done.");
            }
           // preload.run();
            explorer.started = true;
            explorer.createQuickFolderAccess(0);
            explorer.setExplorerPosition();
            $( window ).resize(function() {//it makes explorer responsive.
                explorer.resizeExplorer();
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
            explorer.iconsBackgroundColor = color;
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
            explorer.resizeBaseDialog();
        },
        showEmptyMessage: function (){
            if(explorer.fileList.length === 0) {
                if ($("#emptyMessage").length) {
                    $("#emptyMessage").fadeIn("fast");
                } else {
                    $(explorer.element).append("<p id='emptyMessage' class='gray txtcenter'>" + explorer.LANG_LBL_EMPTY_MESSAGE + "</p>");
                }
            }
        },
        showContextMenu: function(file) {
            var allOptions = null, contextMenu4Files = $("#contextMenu4Files");
            var options = "", contextMenuClass = "contextMenuFile";
            explorer.hide(["#contextMenu4Files", ".contextMenuVoid"]);
            contextMenu4Files.removeClass("contextMenuFile contextMenuFolder");
            if(file == "void"){
                $("#contextIdTools").fadeIn("fast");
            }else{
                contextMenu4Files.empty();
                allOptions = explorer.selectedFiles.length > 1 && explorer.multiSelect;
                options = options.concat(
                  explorer.loadContextMenuOption(explorer.MOVE, allOptions ? explorer.CONTEXT_MENU_OPTIONS.MOVE_ALL : explorer.CONTEXT_MENU_OPTIONS.MOVE, allOptions) +
                  (!allOptions ? explorer.loadContextMenuOption(explorer.RENAME, explorer.CONTEXT_MENU_OPTIONS.RENAME, allOptions) : "") +
                  explorer.loadContextMenuOption(explorer.DELETE, allOptions ? explorer.CONTEXT_MENU_OPTIONS.DELETE_ALL : explorer.CONTEXT_MENU_OPTIONS.DELETE, allOptions) +
                  explorer.loadContextMenuOption(explorer.SHARE, allOptions ? explorer.CONTEXT_MENU_OPTIONS.SHARE_ALL : explorer.CONTEXT_MENU_OPTIONS.SHARE, allOptions) +
                  explorer.loadContextMenuOption(explorer.DOWNLOAD, allOptions ? explorer.CONTEXT_MENU_OPTIONS.DOWNLOAD_ALL : explorer.CONTEXT_MENU_OPTIONS.DOWNLOAD, allOptions)
                );
                if(!allOptions && file.ext == "dir"){
                  options = explorer.loadContextMenuOption(explorer.OPEN, explorer.CONTEXT_MENU_OPTIONS.OPEN, allOptions).concat(options);
                  contextMenuClass = "contextMenuFolder";
                }
                contextMenu4Files.addClass(contextMenuClass);
                options = options.concat(explorer.customMenuOption(file));
                contextMenu4Files.append(options);
                if(contextMenu4Files.html().length < 1){
                  return;
                }
                contextMenu4Files.addClass("opacity9 gray ft12 txtmargin bold");
                contextMenu4Files.fadeIn("fast");
                contextMenu4Files.css("z-index", 9999);
                $(".contextMenuOption").on("click", function (){
                    if(isNotDisabled(this)){
                        contextMenu4Files.fadeOut("fast");
                    }
                });    
                explorer.loadContextMenuOptionEvents(file);
            }
        },
        loadContextMenuOptionEvents: function (file){

          $("#expOpen").on("click", function (e){
              if(isNotDisabled(this)){
                  explorer.open(file);
              }
          });
          $("#expMove").on("click", function (e){
            if(isNotDisabled(this)){
                explorer.move(file);
            }
          });
          $("#expRename").on("click", function (e){
            if(isNotDisabled(this)){
                explorer.rename(file, false);
            }
          });
          $("#expDelete").on("click", function (e){
            if(isNotDisabled(this)){
                explorer.delete(file);
            }
          });
          $("#expShare").on("click", function (e){
            if(isNotDisabled(this)){
                explorer.share(file);
            }
          });
          $("#expDownload").on("click", function (e){
            if(isNotDisabled(this)){
                explorer.download(file);
            }
          });
          
        },
        loadContextMenuOption: function(option, optionMenuState, all){
            var str;
            switch (option){
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
                            str = "<p id='expDelete' class='contextMenuOption disabledContextMenuOption'>" + (all ? explorer.LANG_LBL_DEL_ALL : explorer.LANG_LBL_DEL)+ "</p>";
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
                            str = "<p id='expShare' class='contextMenuOption disabledContextMenuOption'>" + (all ? explorer.LANG_LBL_SHARE_ALL : explorer.LANG_LBL_SHARE)+ "</p>";
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
                            str = "<p id='expDownload' class='contextMenuOption disabledContextMenuOption'>" + (all ? explorer.LANG_LBL_DOWNLOAD_ALL : explorer.LANG_LBL_DOWNLOAD)+ "</p>";
                            break;
                        case explorer.HIDDEN:
                            str = "";
                            break;
                    }
                    break;
                case explorer.NEW_FOLDER:
                    switch (optionMenuState) {
                        case explorer.ENABLED:
                            str =  "<p id='expNewFolder' class='contextMenuOption handCursor' style='margin-top:10px;'>"+explorer.LANG_LBL_NEW_FOLDER+"</p>";
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
                            str =  "<p id='expUpload' class='contextMenuOption handCursor'>"+explorer.LANG_LBL_UPLOAD+"</p>";
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
                            str =  "<p id='expRename' class='contextMenuOption handCursor'>"+explorer.LANG_LBL_RENAME+"</p>";
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
                            str =  "<p id='expOpen' class='contextMenuOption handCursor'>"+explorer.LANG_LBL_OPEN+"</p>";
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
        createBaseDialog: function(width, height, options) {
            if(options === undefined){
                options = [];
            }
            if(width === undefined){
                width = "auto";
            }
            options["width"] = $.isNumeric(width) ? width+"px" : width;
            if(height === undefined){
                height = "auto";
            }
            options["height"] = $.isNumeric(height) ? height+"px" : height;
            if(options !== undefined){
                if(options["min-width"] === undefined){
                    options["min-width"] = $.isNumeric(width) ? width : 0;
                }
                if(options["min-height"] === undefined){
                    options["min-height"] = $.isNumeric(height) ? height : 0;
                }
                if(options["style"] === undefined){
                    options["style"] = "";
                }
                if(options["class"] === undefined){
                    options["class"] = "";
                }
            }
            explorer.getBaseDialog().remove();
            $("body").append("<div class='baseDialog radius10 opacity98 "+options["class"]+"' style='"+options["style"]+"'><input id='defaultWidth' type='hidden' value='"+options["width"]+"'/>"+
                "<input id='defaultHeight' type='hidden' value='"+options["height"]+"'/></div>");
            explorer.getBaseDialog().css({width: options["width"], height: options["height"], "min-width": options["min-width"], "min-height" : options["min-height"]});
            var baseDialog = explorer.getBaseDialog();
            baseDialog.append("<div class='closeBaseDialog handCursor displayNone' style='top: 10px; margin-right: 10px; float: right;'" +
                "title='Close' alt='Close'/> <br />");
            $(".closeBaseDialog").on("click", function (){
              explorer.closeBaseDialog();
            });
            baseDialog.append("<div id='baseDialogContent' class='baseDialogContent'> </div>");
        },
        loadBaseDialog: function(content, def) {
            var baseDialogContent = $("#baseDialogContent");
            var patt = /\.tmp$|\.html/i;
            if(patt.test(content) === true){//if it is a template file, load it
                baseDialogContent.load(content, function (){
                    if(typeof def != 'undefined'){
                        def.resolve();
                    }
                });
            }else{
                baseDialogContent.append(content);
            }
        },
        showBaseDialog: function(hideCloseButton, def) {
            var baseDialog = explorer.getBaseDialog();
            if(!baseDialog.ready()){
                this.showBaseDialog(hideCloseButton, def);
                return;
            }
            if(hideCloseButton !== true) {
                $(".closeBaseDialog").fadeIn("fast");
            }
            baseDialog.ready(function (){
                if(def !== undefined){
                    def.resolve();
                }
            });
            if(baseDialog.find("#defaultHeight").val() != "auto" && baseDialog.find("#defaultWidth").val() != "auto"){
              //explorer.centralize(explorer.baseDialogId);
              explorer.resizeBaseDialog();
            }else{
              baseDialog.css("opacity", 0);
            }
            baseDialog.show(explorer.baseDialogEffect, {}, 500, function (){
              if(baseDialog.find("#defaultHeight").val() == "auto" || baseDialog.find("#defaultWidth").val() == "auto"){
                //explorer.centralize(explorer.baseDialogId);
                explorer.resizeBaseDialog();
                baseDialog.animate({
                  opacity: 1
                }, 300);
              }
            });
            var height = baseDialog.height(), width = baseDialog.width();
            var interval = setInterval(function (){
                if(height != baseDialog.height() || width !=  baseDialog.width()){
                    height = baseDialog.height();
                    width =  baseDialog.width();
                    baseDialog.trigger($.Event('resize'));
                }
            }, 5);
            baseDialog.resize(function() {
                explorer.resizeBaseDialog();
            });
            baseDialog.on("closeDialogEvent", function (){
                clearInterval(interval);
            });
            $(document).on("keyup", function (e){
                if(e.keyCode == 27 && explorer.closeBaseDialogOnEsc === true && $(explorer.baseDialogId).length){//ESC
                    explorer.closeBaseDialog();
                }
            });
        },
        closeBaseDialog: function() {
          var baseDialog = explorer.getBaseDialog();
          $(".closeBaseDialog").fadeOut(100);
            baseDialog.hide( explorer.baseDialogEffect, {}, 300, function (){
              baseDialog.empty();
          });
          baseDialog.trigger("closeDialogEvent");
        },
        resizeBaseDialog: function (){
          var baseDialog = explorer.getBaseDialog();
            if($("#baseDialogContent").length){//if base dialog is visible, reposition it
                var baseDialogWidth = baseDialog.outerWidth();
                var baseDialogMinWidth = Number(baseDialog.css("min-width").replace("px", ""));
                var baseDialogDefaultWidth = Number(baseDialog.find("#defaultWidth").val().replace("px", ""));
                var windowWidth = $(window).width();
                if($.isNumeric(baseDialogDefaultWidth) && (baseDialogWidth != baseDialogMinWidth && baseDialogWidth > windowWidth && baseDialogMinWidth < windowWidth) || (baseDialogWidth < windowWidth && baseDialogWidth < baseDialogDefaultWidth)){
                    baseDialog.css("width", (windowWidth - 10) + "px");
                }
                var baseDialogHeight = baseDialog.outerHeight();
                var baseDialogMinHeight = Number(baseDialog.css("min-height").replace("px", ""));
                var baseDialogDefaultHeight = Number(baseDialog.find("#defaultHeight").val().replace("px", ""));
                var windowHeight = $(window).height();
                if($.isNumeric(baseDialogDefaultHeight) && (baseDialogHeight != baseDialogMinHeight && baseDialogHeight > windowHeight && baseDialogMinHeight < windowHeight) || (baseDialogHeight < windowHeight && baseDialogHeight < baseDialogDefaultHeight)){
                    baseDialog.css("height", (windowHeight - 10) + "px");
                }
                explorer.centralize(explorer.baseDialogId);
            }
        },
        getBaseDialog: function (){
            return $(explorer.baseDialogId);
        },
        centralize: function (id) {
            var width = $(id).outerWidth() / 2;
            var windowWidth = $(window).width() / 2;
            var height = $(id).outerHeight() / 2;
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
            return scripts[index].attributes.src.value.replace("js/explorer.js","");
        },
        destroy: function (element, explode){
            if(element === undefined || element === null){
                $(explorer.element).remove();
            }else{
                var patt = /#|\.*/i;
                if(patt.test(element) === true){//if it is a class or id of an element
                    if(explode){
                        $(element).effect("explode", null, 700, function (){
                          $(this).remove();
                        });
                    }
                }else{
                    explorer.log("You must enter a valid id, or css class. For example, '#my_id' or '.my_class'.");
                }
            }
        },
        open: function(file) {
            var folderId = file.id;
            var def = $.Deferred();
            explorer.selectedFiles = [];
            $(".file").fadeOut(200, function (){
              explorer.addFiles(Number(folderId), null, def);
            });
            var item = new QuickAccessItem(folderId, explorer.getFileById(folderId).name);
            explorer.currentPath.push(item);
            $.when(def).done(function () {
                $(".file").fadeIn("fast");
            });
        },
        rename: function(_file, save){
          var id = _file.id;
          var file = {id:  $("#"+id), inputDiv: $("#"+id).find("#input"+id), input: $("#"+id).find("#input"+id).find("input"), cover:$("#"+id).find("#input"+id).find("div")};
            if(save){//if the user has finished renaming this file.
                var index = explorer.checkIfExists(id);
                var newName = file.input.val();
                if(newName.trim() === ""){
                    newName = "none";
                    file.input.val(newName);
                }
                explorer.fileList[index].name = newName;
                file.input.attr({readonly: "readonly", title: newName });
                file.input.val(explorer.fileList[index].getName());
                file.input.css({border: "none", cursor: "default"});
                file.inputDiv.prop("title", newName);
                file.cover.css("display", "block");
                file.id.trigger( "fileUpdateEvent", [{"file": explorer.fileList[index]}, explorer.EVENT_RENAME]);
            }else{
                file.input.val(file.inputDiv.prop("title"));
                file.cover.css("display", "none");
                file.id.find("._selected").remove();
                file.id.css("border", "1px solid darkgray");
                file.input.removeAttr("readonly");
                file.input.css({"border":"2px dashed gray", "cursor": "text"});
                setTimeout( function () {moveCursorToEnd(file.input);}, 300);
            }
        },
        move: function() {
            var def = $.Deferred();
            var numFolders = 0;
            explorer.createBaseDialog(600);
            explorer.loadBaseDialog(explorer.getExplorerRootFolder()+"/templates/move.html", def);
            $.when(def).then(function () {
                var btMoveFiles = $("#buttonMoveFiles");
                explorer.showBaseDialog(false);
                $("#moveHeader").text(explorer.LANG_LBL_MOVE_HEADER);
                btMoveFiles.append(explorer.LANG_LBL_MOVE_BT_MOVE);
                btMoveFiles.prop("title",explorer.LANG_LBL_MOVE_BT_MOVE_TITLE);
                if(explorer.currentParent != explorer.ROOT){
                    numFolders++;
                    explorer.createDestFolder(explorer.ROOT);
                }
                $.grep(explorer.fileList, function(file, i) {//A folder should not be able to move to itself right?
                    if(file.ext == "dir" && file.id != explorer.currentParent && !inArray(explorer.selectedFiles, file)){
                      //creating folders to move your files to
                      numFolders++;
                      explorer.createDestFolder(file);
                    }
                });
                if(numFolders === 0){
                  $("#foldersList").append("<br /><p class='gray ft10'>"+explorer.LANG_LBL_NO_FOLDERS_FOUND+"</p>");
                }
                btMoveFiles.on("click", function () {explorer.clientMove(explorer.TEMP_VAR);});
            });
        },
        createDestFolder: function (file){
            var id = null, name = null;
            if(isNaN(file)){//it is a custom folder
                id = file.id;
                name = file.name;
            }else{//it is ROOT folder
                id = file;
                name = explorer.LANG_LBL_ROOT_FOLDER;
            }
            $("#foldersList").append("<div id='mv_"+id+"' class='file mvFolderItem fileButton' style='float:left;'>"+
                "<div class='center iconBorder'><div class='dir center'></div></div> <input class='txtcenter ft11 inputFileName'"+
                "maxlength='13' readonly='readonly' value='"+name+"'/></div>");
            $("#mv_"+id).on("mousedown", function () {
                $(".movFolderSelect").remove();
                $(".mvFolderItem").css("border", "1px solid gray");
                $(this).append("<div id='selec_mv_id"+id+"' class='opacity4 _selected movFolderSelect'> </div>");
                $(this).css("border", "1px solid blue");
                $("#buttonMoveFiles").removeProp("disabled");
                $("#buttonMoveFiles").removeClass("explorerButtonDisabled");
                explorer.TEMP_VAR = this.id.replace("mv_", "");
            });
            explorer.initMouseOverEvent();
        },
        clientMove: function(destFolderId, goUp){
            var fileIndex = -1, destFolder = null;
            var def = $.Deferred();
            var folders = [];
            var files = [];
            for(let x = 0; x < explorer.selectedFiles.length; x++) {//create a list of files and folders that are going to be moved
                fileIndex = explorer.checkIfExists(explorer.selectedFiles[x].id);
                //destFolderIndex = explorer.checkIfExists(destFolderId);
                if (explorer.selectedFiles[x].ext == "dir") {
                    var subfolders = explorer.getMySubFolders(explorer.selectedFiles[x].id);
                    if ($.inArray(destFolderId, subfolders) != -1) {//if moving folder to inside itself
                        $(document).trigger( "movingToItself", [{file: explorer.selectedFiles[x], msg: explorer.LANG_LBL_MOVE_FOLDER_ERROR_MSG.replace("{folderName}", "<b>" + explorer.selectedFiles[x].name + "</b>")}] );
                        explorer.selectedFiles.splice(x, 1);
                    }else{
                        folders.push(explorer.selectedFiles[x]);
                    }
                }else{
                    files.push(explorer.selectedFiles[x]);
                }
            }
            explorer.serverMove(destFolderId,files, folders, def);
            $.when(def).then(function(response){//wait for server response
                if(response === true){
                    explorer.closeBaseDialog();
                    for(let x = 0; x < explorer.selectedFiles.length; x++){
                        let file = explorer.getFileById(explorer.selectedFiles[x].id);
                        destFolder = explorer.getFileById(destFolderId);
                        //if it's in the same folder of the new folder
                        if(destFolderId != explorer.ROOT && file.parent == explorer.currentParent && destFolder.parent == explorer.currentParent){
                            file.getElement().css("z-index",999).animate({
                                top: destFolder.getElement().css("top"),
                                left: destFolder.getElement().css("left")
                            }, 1000 + (x * 500) , function () {
                                $(this).hide("scale", {percent: 0}, 700, function (){
                                  file.getElement().css("z-index",1);
                                });
                            });
                        }else if(goUp){//if it was dropped on the goUp 'file'
                          file.getElement().hide("slide", {direction: "up"}, 500);
                        }else{
                            let destFolderParent = null;
                            if(explorer.currentParent !== explorer.ROOT){
                                destFolderParent = explorer.getFileById(explorer.currentParent).parent;
                            }
                            if(destFolderId == destFolderParent){
                                file.getElement().css("z-index",999).animate({
                                    top: explorer.fields.fieldList[0].element.css("top"),
                                    left: explorer.fields.fieldList[0].element.css("left")
                                }, 1000 + (x * 500), function () {//a small delay between the files
                                    file.getElement().hide("slide", {direction: "up"}, 500);
                                });
                            }else{
                              file.getElement().hide("clip", {}, 500);
                            }
                        }
                        fileIndex = explorer.checkIfExists(file.id);
                        explorer.fileList[fileIndex].parent = Number(destFolderId);
                        explorer.fileList[fileIndex].placed = false;
                        explorer.fileList[fileIndex].field = -1;
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
                //Assim, quando o usuário clicar no link de acesso r?pido, ele ser? renderizado novamente.
                for(let x = 0; x < explorer.fileList.length; x++){
                    explorer.fileList[x].placed = false;
                }
            }
            explorer.currentParent = -1;
            $(".file, .field").remove();//Delete each file and field on the screen before add the new ones.
            for(let x = 0; x < explorer.fileList.length; x++){
                if(explorer.fileList[x].name.toLowerCase().indexOf(string.toLowerCase()) != -1){
                    let file = explorer.fileList[x];
                    file.found = true;
                    explorer.addFiles(file);
                    noFile = false;
                }
            }
            var emptyMessage = $("#emptyMessage");
            if(noFile){
                emptyMessage.text("No file found for: "+string);
                emptyMessage.fadeIn("fast");
            }else{
                emptyMessage.text(explorer.LANG_LBL_EMPTY_MESSAGE);
            }
        },
        serverMove: function(destFolderId, files, folders, def){
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
            folders = $.grep(folders.split(","), function(val, i) { if(val !== "") return val; });
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
                    for (let x = 0; x < explorer.selectedFiles.length; x++) {
                        if (explorer.selectedFiles[x].ext == "dir") {
                            explorer.deleteFolderRecursively(explorer.selectedFiles[x].id);
                        }
                        let index = explorer.checkIfExists(explorer.selectedFiles[x].id);//its index will change since his children will be removed from the list first
                        let list = explorer.fields.fieldList[explorer.fileList[index].field].filesOn;
                        explorer.fields.fieldList[explorer.fileList[index].field].filesOn = $.grep(list, function (val) {
                            return val != explorer.fileList[index].id; //remove file from field
                        });
                        if (explorer.fields.fieldList[explorer.fileList[index].field].filesOn.length === 0) {
                            explorer.fields.usedFields -= 1;
                        }
                        explorer.destroy("#" + explorer.selectedFiles[x].id, true);
                        explorer.fileList = $.grep(explorer.fileList, function (val, i) {
                            return val.id != explorer.fileList[index].id;//remove file from list
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
                explorer.open(file);
            }else{
                explorer.preview(file);
            }
        },
        newFolder: function() {
            var def = $.Deferred();
            explorer.createBaseDialog(400);
            explorer.loadBaseDialog(explorer.getExplorerRootFolder()+"/templates/newFolder.html", def);
            $.when(def).then(function () {
                explorer.showBaseDialog();
                var btCreateFolder = $("#buttonCreateFolder");
                var inpFolderName =  $("#inpFolderName");
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
        buildCustomMenuOption: function (label, callback, options){
            var id = null, interval = null, clazz = "", title = "";
            id = explorer.customOptionId++;
            interval = setInterval(function () {
                if($("#contextMenuOption"+id).length){
                    $("#contextMenuOption"+id).on("click", function (e) {
                      if(isNotDisabled(this)){
                          callback(explorer.selectedFiles);
                      }
                    });
                    clearInterval(interval);
                }
            }, 50);
            if(options){
              if(options.disabled){
                  clazz = "disabledContextMenuOption";
              }
              if(options.title){
                  title = options.title;
              }
            }
            return "<p title='"+title+"' id='contextMenuOption"+id+"'class='contextMenuOption handCursor "+clazz+"'>"+label+"</p>";
        },
        preview: function (file){

        },
        getAvailableIconExtensions: function (){
            var files = document.styleSheets;
            var extensions = [];
            var path = null;
            for(var x = 0; x < files.length; x++){
                if(files[x].href === null || files[x].href === undefined){
                    continue;
                }
                if(files[x].href.indexOf("explorerIcons") != -1){
                    for(var y = 0; y < files[x].cssRules.length; y++){
                        path = getValueBetweenQuotes(files[x].cssRules[y].style.background).replace("..", "");
                        if($.inArray(path, explorer.iconPaths) == -1){
                            explorer.iconPaths.push(path);
                        }
                        extensions.push(files[x].cssRules[y].selectorText.replace(".", ""));
                    }
                    break;
                }
            }
            return extensions.length === 0 ? null : extensions;
        },
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
        var extensions = [];
        for(var x = 0; x < files.length; x++){
            if(files[x].href === null || files[x].href === undefined ){
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
        if(typeof window.AVAILABLE_ICON_EXTENSIONS == 'undefined' || window.AVAILABLE_ICON_EXTENSIONS === null){
            window.AVAILABLE_ICON_EXTENSIONS = this.getAvailableIconExtensions();
            if(window.AVAILABLE_ICON_EXTENSIONS === null){
                return;
            }
        }
        var extIndex = window.AVAILABLE_ICON_EXTENSIONS.indexOf(ext.toLowerCase());
        if(extIndex == -1 || window.AVAILABLE_ICON_EXTENSIONS.indexOf("_".concat(ext.toLowerCase())) != -1){
            return "noIcon";
        }else{
            return ext.toLowerCase();
        }
    };
    this.getName = function(){
        var name = this.name;
        if(name.length > 12){
            name = name.substring(0, 12) + "...";
        }
        return name;
    };
    this.getExtension = function (file){
        file = file === undefined ? this.ext : file;
        var str = file.split(".");
        var ext = str[str.length - 1];
        return ext;
    };
    this.getElement = function (){
      return $("#"+this.id);
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

function QuickAccessItem(id, name){
    this.id = id;
    this.name = name;
}

function moveCursorToEnd(input) {
    var originalValue = input.val();
    input.val('');
    input.focus().val(originalValue);
}

function getValueBetweenQuotes(str){
    var ret = "";
    if ( /"/.test( str ) ){
        ret = str.match( /"(.*?)"/ )[1];
    } else {
        ret = str;
    }
    return ret;
}

function isNotDisabled(element){
    return !$(element).hasClass("disabledContextMenuOption");
}

function inArray(array, obj, fieldstoCompare){
  "use strict";
  var properties = [];
  var equals = false;
  if(fieldstoCompare === undefined){
    for(let x = 0; x < array.length; x++){
      for(let prop in obj){
        if($.isFunction(array[x][prop])) continue;
        equals = obj[prop] === array[x][prop];
        if(!equals){
          break;
        }
      }
      if(equals){
        return equals;
      }
    }
    return equals;
  }else{
    for(let x = 0; x < array.length; x++){
      equals = true;
      for(let y = 0; y < fieldstoCompare.length; y++){
        let prop = fieldstoCompare[y];
        if($.isFunction(array[x][prop])) continue;
        properties[y] = array[x][prop] === obj[prop];
      }
      for(let y = 0; y < properties.length; y++){
        if(properties[y] === false){
          equals = false;
          break;
        }
      }
      if(equals === true){
        return equals;
      }
    }
    return equals;
  }
}