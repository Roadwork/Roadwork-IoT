import EnumJsonObjectType from './EnumJsonObjectType';

class JsonToTableUtils {
    /**
     * Get object type
     */
    static getObjectType(obj) {
        if (obj !== null && typeof obj === "object") {
            if (Array.isArray(obj)) {
                return EnumJsonObjectType.Array;
            } else {
                if (Object.keys(obj).length) {
                    return EnumJsonObjectType.ObjectWithNonNumericKeys;
                } else {
                    return EnumJsonObjectType.Object;
                }
            }
        } else {
            return EnumJsonObjectType.Primitive;
        }
    }

    static checkLabelTypes(labels) {
        const reduced = labels.reduce(
            (accumulator, value) =>
                accumulator + (isNaN(Number(value)) ? value : Number(value)),
            0
        );
        return typeof reduced === "number" ? "number" : "string";
    }

    static getUniqueObjectKeys(anArray) {
        let labels = [];
        const objectType = EnumJsonObjectType.Object;
        anArray.forEach(item => {
            labels = labels.concat(Object.keys(item)).filter((elem, pos, arr) => {
                return arr.indexOf(elem) === pos;
            });
        });

        return { labels, type: objectType };
    }
}

export default JsonToTableUtils;