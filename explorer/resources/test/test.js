/**
 * Created by lucas on 11/2/2016.
 */

import Explorer from '../../index.js';
import {File} from '../../index.js';

var explorer = new Explorer(600, 400);
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
explorer.dbclick = function (file){
    if(file.ext !== "dir"){
        explorer.share(file);
    }else{
        explorer.open(file);
    }
};
//Add some files (you can do whenever you want)
explorer.addFiles(new File(1, "Resumé", "ps"));
explorer.addFiles(new File(2, "Folder", "dir"));
explorer.addFiles(new File(4, "Picture", "pic", 3));
explorer.addFiles(new File(5, "Sorry", "mp3", 3));
explorer.addFiles(new File(6, "HW", "docx", 3));
explorer.addFiles(new File(3, "Music", "dir"));
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
explorer.customMenuOption = function(file){
    return explorer.buildCustomMenuOption("Office", openOffice, {title: "Office", disabled: false});
};
//create a function to run when the context menu option is clicked
function openOffice(){
    explorer.createBaseDialog(window.innerWidth * .85, "auto", {"min-width": 300, "min-height": 300, "style" : true});
    //explorer.loadBaseDialog("<p class='gray bold txtcenter ft14'> "+explorer.TEMP_VAR.name+" </p><center><iframe src='https://docs.google.com/gview?url="+APP_URL+"/download/"+explorer.TEMP_VAR.id+"?officeAccessKey="+data.key+"' style='width:"+window.innerWidth * 0.8+"px; height:"+window.innerHeight * 0.7+"px; border: 1px solid gray;'> </iframe></center>");
    explorer.loadBaseDialog("<p class='gray bold txtcenter ft14'> Titulo </p><center><iframe src='https://docs.google.com/gview?url=http://infolab.stanford.edu/pub/papers/google.pdf&embedded=true' style='width:"+window.innerWidth * 0.7+"px; height:"+window.innerHeight * 0.7+"px; border: 1px solid gray;'> </iframe></center>");
    explorer.showBaseDialog();
}
//starts Explorer
explorer.start();
