import React from 'react';
import ReactDOM from 'react-dom';
import Home from './Home';

const render = (Component) => {
    ReactDOM.render(
        <Component />,
        document.getElementById('root'),
    );
};

export default render(Home);
