/**
 * Created by lucas on 11/2/2016.
 */

var File = function(id, name, ext, parent, field) {
    this.id = id;
    this.parent = parent === undefined || parent === null ? 0 : parent;
    this.field = field === undefined || field === null ? -1 : field;
    this.placed = false;
    this.name = name;
    this.checkIcon = function (ext) {
        ext = ext !== undefined ? ext : this.ext !== undefined ? this.ext : "";
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

if(typeof module === "object" && module.exports){
    module.exports = File;
}
