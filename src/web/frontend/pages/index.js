import { useEffect, useState } from 'react';
import fetch from 'isomorphic-fetch';
import Actor from '../components/Actor';

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
            {actors && actors.map(i => <Actor id={i.name} state={i.state} />)}
        </div>
    )
}

export default HomePage