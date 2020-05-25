import JsonToTable from '../JsonToTable';

const getFlatObject = (object) => {
    function iter(o, p) {
        if (o && typeof o === 'object') {
            Object.keys(o).forEach(function (k) {
                iter(o[k], p.concat(k));
            });
            return;
        }
        path[p.join('.')] = o;
    }

    var path = {};
    iter(object, []);
    return path;
}

function Actor({ id, state = "", className }) {
    const actorParsed = JSON.parse(state);
    const actorStateParsed = JSON.parse(actorParsed.State);
    const actorStateFlatObject = getFlatObject(actorStateParsed);

    let classNameProcessed = "bg-blue-500 p-4";
    
    if (className) {
        classNameProcessed += ` ${className}`;
    }

    return (
        <div className={classNameProcessed}>
            <h1 className="text-center font-bold">{id}</h1>
            
            <div className="mt-4 p-4 rounded bg-gray-800">
                {Object.keys(actorStateFlatObject).map(i => (
                    <div><strong>{i}:</strong> {actorStateFlatObject[i]}</div>
                ))}
            </div>
        </div>
    );
}

export default Actor;