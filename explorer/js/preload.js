var Preload = (function () {
    function Preload(paths, loadType) {
        if (loadType === void 0) { loadType = LoadType.ASYNC; }
        this.paths = paths;
        this.loadType = loadType;
    }
    Preload.prototype.run = function () {
        if (this.loadType == LoadType.SYNC) {
            var images = [];
            for (var x = 0; x < this.paths.length; x++) {
                images[x] = new Image();
                images[x].src = this.paths[x];
            }
        }
        else {
            var xhr = new XMLHttpRequest();
            for (var x = 0; x < this.paths.length; x++) {
                xhr.open('GET', this.paths[x]);
                xhr.send('');
            }
        }
    };
    return Preload;
})();
;
var LoadType;
(function (LoadType) {
    LoadType[LoadType["SYNC"] = 0] = "SYNC";
    LoadType[LoadType["ASYNC"] = 1] = "ASYNC";
})(LoadType || (LoadType = {}));
;
