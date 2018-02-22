import React from 'react';
import ReactDOM from 'react-dom';
import Home from './components/Home';

const render = (Component) => {
    ReactDOM.render(
        <Component />,
        document.getElementById('root'),
    );
};

render(Home);