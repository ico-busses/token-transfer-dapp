import React, { Component } from 'react';
import { ToastContainer, toast } from 'react-toastify';

class HasAlert extends Component {
    notify = ({ msg, type='error'  }) => {
        const options = {
            type,
            autoClose: false
        };
        type === 'success' ? options.autoClose = 5000 : null;
        toast( msg, options );
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