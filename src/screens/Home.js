import React from 'react';
import Dialog from 'rc-dialog';
import QRCode from 'qrcode.react';
import QrReader from 'react-qr-reader';

import { ethers } from 'ethers';
import ethersProvider from '../services/ethersProvider';

class Home extends React.Component {
  state = {
    address: '',
    balance: 0,
    ensName: '',
    input: '',
    amount: 2,
    resolved: '',
    recipient: '0x0000000000000000000000000000000000000000',
    isDialogueVisisble: false,
    rawData: {},
    isScanningSignedTx: false
  }

  UNSAFE_componentWillMount() {
    const addressString = localStorage.getItem('address');
    if (!addressString) {
      return this.props.history.replace('/login');
    }
    let address = addressString.split(':')[1].split('@')[0];
    ethersProvider.getBalance(address).then(balance => {
      this.setState(previousState => ({balance: ethers.utils.formatEther(balance)}));
      // console.log(ethers.utils.formatEther(balance));
    });

    ethersProvider.lookupAddress(address).then(ensName => {
      this.setState(previousState => ({ensName}));
      // console.log(ensName);
    })
    this.setState(previousState => ({address}));
  }

  handleInputChange = event => {
    let inputVal = event.target.value;
    this.setState(previousState => ({input: inputVal}));
    try {
      ethersProvider.lookupAddress(inputVal).then(ensName => {
        this.setState(previousState => ({resolved: ensName, recipient: inputVal}));
      });
    } catch (error) {
      try {
        ethersProvider.resolveName(inputVal).then(address => {
          if (address) {
            this.setState(previousState => ({resolved: address, recipient: address}));
          } else {
            this.setState(previousState => ({resolved: ''}));
          }
        })
      } catch (error) {
        this.setState(previousState => ({resolved: ''}));
      }
    }
  }

  handleAmountChange = event => {
    let amount = event.target.value;
    this.setState(previousState => ({amount}));
  }

  onDialogueClose = () => {
    this.setState(previousState => ({isDialogueVisisble: false}));
    this.render();
  }

  onScanSignedTx = () => {
    this.setState(previousState => ({isScanningSignedTx: true}));
  }

  sendEther = () => {
    const { address, recipient, amount } = this.state;
    ethersProvider.getTransactionCount(address).then(nonce => {
      ethersProvider.getGasPrice().then(gasPrice => {
        let rawData = {
          to: recipient,
          nonce: nonce,
          gasPrice: gasPrice.toNumber(),
          data: '0x',
          value: amount * 1000000000,
          chainId: 3
        }
        ethersProvider.estimateGas(rawData).then(gasLimit => {
          rawData.gasLimit = gasLimit.toNumber();
          this.setState(previousState => ({rawData, isDialogueVisisble: true}));
          // console.log(ethers.utils.splitSignature(ethers.utils.serializeTransaction(rawData)));
        })
      })
    })
  }

  handleScan = data => {
    if (data) {
      const provider = ethers.getDefaultProvider('ropsten');
      provider.sendTransaction('0x' + data);
      // console.log(ethers.utils.parseTransaction('0x' + data));
    }
  }

  handleError = error => {
    console.log(error);
  }

  render() {
    const { address, ensName, balance, resolved, input, amount,
      isDialogueVisisble, rawData, isScanningSignedTx } = this.state;
    return (
      <div style={{ margin: '100px', display: 'flex', justifyContent: 'center' }}>
        <div>
          <Dialog
            visible={isDialogueVisisble}
            title="Scan Raw TX for Signing"
            footer={
              [
                <button
                  type="button"
                  className="btn btn-default"
                  key="close"
                  onClick={this.onDialogueClose}
                >
                Close
                </button>,
                <button
                  type="button"
                  className="btn btn-primary"
                  key="save"
                  onClick={this.onScanSignedTx}
                >
                Scan Signed Tx
                </button>,
              ]
            }
          >
            <div className="d-flex justify-content-center">
              {!isScanningSignedTx ? <QRCode
                value={JSON.stringify({
                  action: "signTransaction",
                  data: {
                    account: address.substr(2),
                    rlp: ethers.utils.serializeTransaction(rawData).substr(2)
                  }
                })}
                size={256}
              />:
              <QrReader
                delay={1000}
                style={{ width: '400px', height: '400px' }}
                onScan={this.handleScan}
                onError={this.handleError}
              />}
            </div>
          </Dialog>
          <h1 className="text-center">Account Details</h1>
          <p>Ethereum Address: <strong>{address}</strong></p>
          <p>Balance: <strong>{balance} ETH</strong></p>
          <p>ENS Name: <strong>{ensName}</strong></p>
          <h1 className="text-center">Transfer Ether</h1>
          <div className="form-group">
            <label>Enter Recepient Address / ENS</label>
            <input
              onChange={this.handleInputChange}
              className="form-control"
              placeholder="Address / ENS"
              value={input}
            />
            <input
              value={resolved}
              className="form-control"
              disabled
            />
          </div>
          <div className="form-group">
            <label>Enter Amount In Ether to Send</label>
            <input
              onChange={this.handleAmountChange}
              className="form-control"
              placeholder="Ether to Send"
              value={amount}
            />
          </div>
          <br />
          <div className="d-flex justify-content-center">
            <button
              className="btn btn-primary"
              disabled={resolved === ''}
              onClick={this.sendEther}
            >
              Send ETH
              </button>
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
