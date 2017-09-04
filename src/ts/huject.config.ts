import {Container} from 'huject';

import {Draggable as DraggableInterface} from './interfaces/Draggable';
import Draggable from './impl/Draggable';
import Draggabilly from './impl/Draggabilly';

import Upload from './impl/Upload';
import UploadInterface from './interfaces/Upload';

class DependencyInjector {

    private container;

    constructor() {
        this.container = new Container();
        this.register();
    }

    protected register(): void {
        this.container.register(UploadInterface, Upload);
        this.container.register(DraggableInterface, Draggabilly);
    }

    public getContainer (): Container{
        return this.container;
    }
}

export {DependencyInjector};
export default DependencyInjector;
