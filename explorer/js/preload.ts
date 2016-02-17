class Preload{
  
  constructor(private paths: string[], private loadType = LoadType.ASYNC){}
  
  public run() : void{
      if(this.loadType == LoadType.SYNC){
        var images = [];
        for(var x = 0; x < this.paths.length; x++){
          images[x] = new Image()
          images[x].src = this.paths[x];
        }
      }else{
        var xhr = new XMLHttpRequest();
        for(var x = 0; x < this.paths.length; x++){
          xhr.open('GET', this.paths[x]);
		      xhr.send('');
        }
      }
  }
};
enum LoadType{SYNC, ASYNC};