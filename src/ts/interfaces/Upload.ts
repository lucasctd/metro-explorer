import File from './File';

abstract class Upload{
    abstract upload(file: File) : void;
}

export default Upload;