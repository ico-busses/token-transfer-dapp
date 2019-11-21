import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'semantic-ui-react';
import copy from 'clipboard-copy';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const wrapperStyle = {
  width: 'auto',
  minWidth: '150px',
  flex: '1',
};

const textStyle = {
  flex: '0',
  display: 'inline-block',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '75%',
};

const defaultIconStyle = {
  cursor: 'pointer',
  verticalAlign: 'top',
  margin: 'auto 4px',
};

const notify = msg => {
  const options = {
    type: 'info',
    autoClose: 300,
  };
  toast(<div style={{ wordBreak: 'break-all' }}>{msg}</div>, options);
};

export default function Address({
  address,
  url,
  hideCopy,
  onCopy,
  iconStyle,
  style,
}) {
  const anchorProps = {
    title: url || address,
    style: Object.assign({}, textStyle, style || {}),
  };
  if (url) {
    anchorProps.href = url;
  }

  return (
    <span style={wrapperStyle}>
      <a {...anchorProps} target="_blank" rel="noopener noreferrer">
        {address}
      </a>
      {!hideCopy && (
        <Icon
          name="copy outline"
          title="copy"
          style={Object.assign({}, defaultIconStyle, iconStyle || {})}
          onClick={async () => {
            await copy(address);
            notify('Copied!');
            onCopy && (await onCopy(address));
          }}
        />
      )}
    </span>
  );
}

Address.propTypes = {
  address: PropTypes.string.isRequired,
  url: PropTypes.string,
  hideCopy: PropTypes.bool,
  onCopy: PropTypes.func,
  style: PropTypes.object,
  iconStyle: PropTypes.object,
};
