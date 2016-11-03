/**
 * Created by lucas on 11/2/2016.
 */

import jQuery from 'jquery';
window.jQuery = jQuery;
window.$ = jQuery;

require('./resources/assets/js/jquery-ui-1.11.4.min.js');

import Explorer from './resources/assets/js/explorer.js';
import ExUpload from './resources/assets/extensions/ExUpload/exUpload.js';
import File from './resources/assets/js/file.js';

export default {Explorer, ExUpload, jQuery, File};