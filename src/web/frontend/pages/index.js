import { useEffect, useState } from 'react';
import fetch from 'isomorphic-fetch';
import Actor from '../components/Actor';

function HomePage() {
    const [ actors, setActors ] = useState([]);

    useEffect(() => {
        async function initActors() {
            console.log("Updating")
            const res = await fetch(`http://localhost:9000/actors`);
            const json = await res.json();
            setActors(json);
        }

        // Update our actors every second
        setInterval(() => initActors(), 1000);
    }, []);

    return (
        <div className="p-12 min-h-screen h-screen flex flex-col">
            <h1 className="text-2xl text-center">Actors</h1>

            <div className="h-full overflow-y-auto mt-4 rounded border border-blue-500 flex flex-wrap -mx-4 overflow-hidden justify-between">
                {actors && actors.map(i => <Actor className="flex-grow my-4 mx-4 w-full overflow-hidden sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/6" id={i.name} state={i.state} />)}
            </div>
        </div>
    )
}

export default HomePage