import File from "./File";

abstract class Draggable {
	el: any;
    grid: any;
	limit: any;
	file: File;
	explorerId: string;	
	
	/* Events */
	abstract onDrag(element, args);
	abstract onDragging(element, args);
	abstract onDrop(element, args);
	
	/* Methods */
	abstract getCoord() : any;
	abstract setCoord(x: number, y: number);
	
	abstract destroy();
	abstract start() : void;
}
export default Draggable;
export {Draggable};