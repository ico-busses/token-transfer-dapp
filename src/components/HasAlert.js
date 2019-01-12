import React, { Component } from 'react';
import { ToastContainer, toast } from 'react-toastify';

class HasAlert extends Component {
    notify = ({ msg, type='error', autoClose= false  }) => {
        const options = {
            type,
            autoClose
        };
        type === 'success' ? options.autoClose = 5000 : null;
        toast( <div style={{ wordBreak: 'break-all' }}>{ msg }</div>, options );
    }

    render() {
        return (
            <div>
                <ToastContainer />
            </div>
        );
    }
}

export default HasAlert;