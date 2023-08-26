import type { BaseTranslation } from '../i18n-types';

import archive from './archive';
import footer from "./footer";
import header from "./header";
import post from "./post";
import sidebar from "./sidebar";


const zh_CN = {
    footer,
    header,
    post,
    sidebar,
    archive
} satisfies BaseTranslation

export default zh_CN
