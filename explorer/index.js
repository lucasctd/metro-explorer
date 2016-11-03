/**
 * Created by lucas on 11/2/2016.
 */

import jquery from 'jquery';
window.jQuery = jquery;
window.$ = jquery;

require('./resources/assets/js/jquery-ui-1.11.4.min.js');

import Explorer from './resources/assets/js/explorer.js';
import exUpload from './resources/assets/extensions/ExUpload/exUpload.js';
import file from './resources/assets/js/file.js';

export default Explorer;
export const jQuery = jquery;
export const File = file;
export const ExUpload = exUpload;
