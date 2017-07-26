import {Option} from './Option';

export abstract class ContextMenu {
    abstract show (): void;
    abstract close (): void;
    abstract addOption (option: Option): void;
}