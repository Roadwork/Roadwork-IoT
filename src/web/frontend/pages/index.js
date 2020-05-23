import { useEffect, useState } from 'react';
import fetch from 'isomorphic-fetch';

function HomePage() {
    const [ actors, setActors ] = useState([]);

    useEffect(() => {
        async function initActors() {
            const res = await fetch(`http://localhost:9000/actors`);
            const json = await res.json();
            setActors(json);
        }

        initActors();
    }, []);

    return (
        <div>
            {actors && actors.map(i => <p>{i.name}</p>)}
        </div>
    )
}

export default HomePage