import React, { useState} from 'react';
import TreeChart from './TreeChart.jsx';
import './App.css';

const initialData = {
    name: "A",
    children: [
        {name: 'B', children: [{name:"C"}, {name:"D"}, {name:"E"}]},
        {name: 'F'}
    ]
};

function App() {

    const [data, setData] = useState(initialData);

    return (
        <React.Fragment>
            <h1>Tree Chart</h1>
            <TreeChart data={data}/>
            <button onClick={() => setData(initialData.children[0])}>
                Update Data
            </button>
        </React.Fragment>
    );
}

export default App;
