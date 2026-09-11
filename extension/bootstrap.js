import {localConversionService} from './services/conversion-service.js';
import {localAccessService} from './services/access-service.js';
import {DownloadService} from './services/download-service.js';
export const services=Object.freeze({conversion:localConversionService,access:localAccessService,downloads:new DownloadService()});
