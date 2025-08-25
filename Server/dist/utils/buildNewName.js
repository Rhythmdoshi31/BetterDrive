"use strict";
function buildNewName(oldName, newBaseName) {
    const dotIndex = oldName.lastIndexOf(".");
    if (dotIndex === -1) {
        return newBaseName; // no extension originally
    }
    const extension = oldName.substring(dotIndex); // includes the dot
    return `${newBaseName}${extension}`;
}
//# sourceMappingURL=buildNewName.js.map