
import JSONToTableUtils from './JSONToTableUtils';
import EnumJsonObjectType from './EnumJsonObjectType';

function JsonToTable({ json = {} }) {
    const renderObject = (obj, header, idx) => {
        const phrase = [];
        let tmp;
        if (header) {
            phrase.push(renderRowHeader(header));
        }

        const objType = JSONToTableUtils.getObjectType(obj);

        switch (objType) {
            case EnumJsonObjectType.ObjectWithNonNumericKeys:
                tmp = header ? (
                    <div className="table" key={`__j2t_tableObj${idx}`}>
                        <div className="table-row-group" key={`__j2t_bObj${idx}`}>
                            {renderRows(obj)}
                        </div>
                    </div>
                ) : (
                    renderRows(obj)
                );
                break;
            case EnumJsonObjectType.Array:
                tmp = header ? (
                    <div className="table" key={`__j2t_tableArr${idx}`}>
                        <div className="table-row-group" key={`__j2t_bArr${idx}`}>
                            {parseArray(obj)}
                        </div>
                    </div>
                ) : (
                    parseArray(obj)
                );
                break;
        }
        phrase.push(tmp);
        const retval = phrase.map(p => p);
        return header ? (
            <div className="table-row" key={`__j2t_trObj${idx}`}>{renderCell({content: retval, colspan: 2})}</div>
        ) : (
            retval
        );
    };

    const renderCell = (params) => {
        const {content, colspan, isHeader} = params;
        const valueDisplay = isHeader ? <strong>{content}</strong> : content;
        return <div className="table-cell py-1 px-3 text-left" colSpan={colspan ? colspan : 0} key={`__j2t_trObj${valueDisplay}`}>{valueDisplay}</div>;
    };

    const renderHeader = (labels) => {
        return (
            <div className="table-row" key={`__j2t_trHeader`}>
                {labels.map((v) => {
                    return renderCell({content: v});
                })}
            </div>
        );
    };

    const renderValues = (values) => {
        return (
            <div className="table-row" key={`__j2t_trArrString`}>
                {values.map(k => {
                    return renderCell({content: k});
                })}
            </div>
        );
    };

    const renderRowValues = (anArray, labels) => {
        return anArray.map((item, idx) => {
            return (
                <div className="table-row" key={`__j2t_Arr${idx.toString()}`}>
                    {labels.map(k => {
                        const isValuePrimitive = JSONToTableUtils.getObjectType(k) === EnumJsonObjectType.Primitive;

                        return isValuePrimitive
                            ? renderCell({content: item[k]})
                            : renderObject(item[k], k, idx);
                    })}
                </div>
            );
        });
    };

    const parseArray = (anArray) => {
        const phrase = [];
        const labels = JSONToTableUtils.getUniqueObjectKeys(
            anArray
        );

        if (JSONToTableUtils.checkLabelTypes(labels.labels) !== "number") {
            phrase.push(renderHeader(labels.labels));
            phrase.push(renderRowValues(anArray, labels.labels));
        } else {
            phrase.push(renderValues(anArray));
        }
        
        return phrase;
    };

    const renderRow = (k, v, idx) => {
        return (
            <div className="table-row" key={`__j2t_tr${idx}`}>
                <div className="table-cell py-1 px-3 text-left" key={`__j2t_tdk${idx}`}>
                    <strong>{k}</strong>
                </div>

                <div className="table-cell break-all py-1 px-3 text-left" key={`__j2t_tdv${idx}`}>{v}</div>
            </div>
        );
    };

    const renderRowHeader = (label) => {
        return (
            <div key={`__j2t_rw${label}`}>
                <strong>{label}</strong>
            </div>
        );
    };

    const renderRows = (obj, labelKey) => {
        return Object.keys(obj).map((k, idx) => {
            const value = obj[k];
            const isValuePrimitive =
                JSONToTableUtils.getObjectType(value) === EnumJsonObjectType.Primitive;
            // render row when value is primitive otherwise inspect the value and make the key as header
            const retval = isValuePrimitive
                ? renderRow(k, value, idx)
                : renderObject(value, k, idx);

            return retval;
        });
    };

    return (
        <div className="table w-full">
            <div className="table-row-group">{renderObject(json, undefined, 0)}</div>
        </div>
    )
}

export default JsonToTable;