import React, { Component } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

class HasAlert extends Component {
  notify = ({ msg, type = 'error', autoClose = false }) => {
    const options = {
      type,
      autoClose,
    };
    type === 'success' && !autoClose ? (options.autoClose = 5000) : null;
    toast(<div style={{ wordBreak: 'break-all' }}>{msg}</div>, options);
  };
}

export default HasAlert;
