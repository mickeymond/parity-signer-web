import React from 'react';

import QrReader from 'react-qr-reader';

class Login extends React.Component {
  handleScan = data => {
    if (data) {
      localStorage.setItem('address', data);
      this.props.history.replace('/');
    }
  }

  handleError = error => {
    console.log(error);
  }

  render() {
    return (
      <div className="login-container">
        <QrReader
          delay={1000}
          style={{ width: '400px', height: '400px' }}
          onScan={this.handleScan}
          onError={this.handleError}
        />
      </div>
    );
  }
}

export default Login;
