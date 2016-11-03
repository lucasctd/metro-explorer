/**
 * Created by lucas on 11/2/2016.
 */

import app from './index.js';

var Explorer = app.Explorer;
var File = app.File;

var exp = new Explorer(600, 400);
exp.debugMode = true;
exp.multiSelect = true;
/*exp.CONTEXT_MENU_OPTIONS.DELETE_ALL = exp.HIDDEN;
 exp.CONTEXT_MENU_OPTIONS.MOVE_ALL = exp.HIDDEN;
 exp.CONTEXT_MENU_OPTIONS.UPLOAD_ALL = exp.HIDDEN;
 exp.CONTEXT_MENU_OPTIONS.SHARE_ALL = exp.HIDDEN;
 exp.CONTEXT_MENU_OPTIONS.DOWNLOAD_ALL = exp.HIDDEN;
 exp.CONTEXT_MENU_OPTIONS.DELETE = exp.HIDDEN;
 exp.CONTEXT_MENU_OPTIONS.MOVE = exp.HIDDEN;
 exp.CONTEXT_MENU_OPTIONS.UPLOAD = exp.HIDDEN;
 exp.CONTEXT_MENU_OPTIONS.SHARE = exp.HIDDEN;
 exp.CONTEXT_MENU_OPTIONS.DOWNLOAD = exp.HIDDEN;
 exp.CONTEXT_MENU_OPTIONS.RENAME = exp.HIDDEN;
 exp.CONTEXT_MENU_OPTIONS.NEW_FOLDER = exp.HIDDEN;*/
exp.CONTEXT_MENU_OPTIONS.OPEN = exp.DISABLED;
exp.createExplorer();
exp.dbclick = function (file){
    if(file.ext !== "dir"){
        exp.share(file);
    }else{
        exp.open(file);
    }
};
exp.addFiles(new File(1, "Lucia", "ps"));
exp.addFiles(new File(2, "T", "dir"));
exp.addFiles(new File(4, "Picture", "pic", 3));
exp.addFiles(new File(5, "Sorry", "mp3", 3));
exp.addFiles(new File(6, "HW", "docx", 3));
exp.addFiles(new File(3, "Music", "dir"));
exp.setIconsBackgroundColor("#1A9ADA");
exp.border = "5px dashed gray";
/* exp.upload = function (){console.info("upload")};
 exp.open = function (file){console.info("open "+file.name)};
 exp.newFolder = function (){console.info("newFolder")};
 exp.share = function (file){console.info("share "+file.name)};
 exp.rename = function (file){console.info("rename "+file.name)};
 exp.download = function (file){console.info("download "+file.name)};
 exp.delete = function (file){console.info("delete "+file.name)};
 exp.move = function (file){console.info("move "+file.name)};*/
exp.customMenuOption = function(file){
    return exp.buildCustomMenuOption("Office", openOffice, {title: "Office", disabled: false});
};
function openOffice(){
    exp.createBaseDialog(window.innerWidth * .85, "auto", {"min-width": 300, "min-height": 300, "style" : true});
    //explorer.loadBaseDialog("<p class='gray bold txtcenter ft14'> "+explorer.TEMP_VAR.name+" </p><center><iframe src='https://docs.google.com/gview?url="+APP_URL+"/download/"+explorer.TEMP_VAR.id+"?officeAccessKey="+data.key+"' style='width:"+window.innerWidth * 0.8+"px; height:"+window.innerHeight * 0.7+"px; border: 1px solid gray;'> </iframe></center>");
    exp.loadBaseDialog("<p class='gray bold txtcenter ft14'> Titulo </p><center><iframe src='https://docs.google.com/gview?url=http://infolab.stanford.edu/pub/papers/google.pdf&embedded=true' style='width:"+window.innerWidth * 0.7+"px; height:"+window.innerHeight * 0.7+"px; border: 1px solid gray;'> </iframe></center>");
    exp.showBaseDialog();
    setTimeout(function (){
        console.log(exp.baseDialogId);
        console.log($(exp.baseDialogId).height());
        $(exp.baseDialogId).append("<br><br><br><br><p>qweqweqwewqeqwewqeqwp</p>");
        console.log($(exp.baseDialogId).height());
    }, 3000);
}
exp.start();