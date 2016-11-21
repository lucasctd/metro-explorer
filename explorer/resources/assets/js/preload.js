var Preload = (function () {
    function Preload(paths, loadType) {
        if (loadType === void 0) { loadType = LoadType.ASYNC; }
        this.paths = paths;
        this.loadType = loadType;
        return this;
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
            for (var x_1 = 0; x_1 < this.paths.length; x_1++) {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', this.paths[x_1]);
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
