import {Container} from 'huject';

import {Draggable as DraggableInterface} from './interfaces/Draggable';
import Draggable from './impl/Draggable';
import Draggabilly from './impl/Draggabilly';

import Upload from './impl/Upload';
import UploadInterface from './interfaces/Upload';

class DependencyInjection {

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

export {DependencyInjection};
export default DependencyInjection;
