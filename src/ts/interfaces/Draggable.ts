abstract class Draggable {
	el: string;
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
export {Draggable};