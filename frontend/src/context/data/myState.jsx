import React, { useState } from 'react';
import MyContext from './myContext';

function MyState(props) {
    const [searchkey, setSearchkey] = useState('');

    return (
        <MyContext.Provider value={{ mode: 'light', searchkey, setSearchkey }}>
            {props.children}
        </MyContext.Provider>
    );
}

export default MyState;
