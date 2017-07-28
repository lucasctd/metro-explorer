abstract class Draggable {
	el: any;
    grid: number;
	limit: any;
	moveCursor: boolean;
	
	/* Events */
	abstract onDrag(event, args);
	abstract onDragging(event, args);
	abstract onDrop(event, args);
	
	/* Methods */
	abstract getCoord() : any;
	abstract setCoord(x: number, y: number);
	
	abstract destroy();
	abstract start() : void;
}
export default Draggable;
export {Draggable};