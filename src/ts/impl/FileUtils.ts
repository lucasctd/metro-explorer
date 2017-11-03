import File from '../interfaces/File';

export default class FileUtils {

    private static FILE_WIDTH: number = 110;
    private static FILE_HEIGHT: number = 140;

    public static getLeftPos(file: File, numGridX: number, fileField?: number): number {

        let field = null;
        fileField = fileField !== undefined ? fileField : file.field;
        if(fileField < numGridX){
            field = fileField;
        }else{
            field = (fileField / numGridX) - Math.trunc(fileField / numGridX);
            field*=numGridX;
        }
        return (field * 5) + (field * FileUtils.FILE_WIDTH);
    }

    public static getTopPos(file: File, numGridX: number, fileField?: number): number {
        let top = Math.trunc((fileField ? fileField : file.field) / numGridX);
        return (5 * top) + (top * FileUtils.FILE_HEIGHT);
    }
}