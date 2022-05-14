import DStorage from '../abis/DStorage.json'
import React, { Component } from 'react';
import Navbar from './Navbar'
import Main from './Main'
import Web3 from 'web3';
// import './App.css';

//Declare IPFS

const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }) // leaving out the arguments will default to these values

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.ethereum) {
      window.web3 = new Web3(window.currentProvider)
    }
    else {
      window.alert('No Ethereum browser detected. You should consider downloading MetaMask')
    }
  }

  async loadBlockchainData() {
    // talking to web3
    const web3 = window.web3
    console.log(web3)

    //Load account

    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] });

    // web3framework connects smart contracts with react using Ayscronized Methods + backend data form wallets or metamask and web3 methods


    // Network ID
    const networkId = await web3.eth.net.getId()
    const networkData = DStorage.networks[networkId]
    if (networkData) {
      // Assign contract
      const dstorage = new web3.eth.Contract(DStorage.abi, networkData.address)
      this.setState({ dstorage })
      // Get files amount
      const filesCount = await dstorage.methods.fileCount().call()
      this.setState({ filesCount })
      // Load files&sort by the newest
      for (var i = filesCount; i >= 1; i--) {
        const file = await dstorage.methods.files(i).call()
        this.setState({
          files: [...this.state.files, file]
        })
      }
    } else {
      window.alert('DStorage contract not deployed to detected network.')
    }

  }

  // Get file from user
  captureFile = event => {
    event.preventDefault()

    const file = event.target.files[0]
    const reader = new window.FileReader()

    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.setState({
        buffer: Buffer(reader.result),
        type: file.type,
        name: file.name
      })
      console.log('buffer', this.state.buffer)
    }
  }



  //Upload File
  uploadFile = description => {
    console.log("submitting file to ipfs")
    ipfs.add(this.state.buffer, (error, result) => {
      console.log('IPFS result', result.size)
      if (error) {
        console.error(error)
        return
      }

      this.setState({ loading: true })
      // Assign value for the file without extension
      if (this.state.type === '') {
        this.setState({ type: 'none' })
      }
      this.state.dstorage.methods.uploadFile(result[0].hash, result[0].size, this.state.type, this.state.name, description).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({
          loading: false,
          type: null,
          name: null
        })
        window.location.reload()
      }).on('error', (e) => {
        window.alert('Error')
        this.setState({ loading: false })
      })
    })
    //add file to the ipfs

    //Add file to the IPFS

    //Check If error
    //Return error

    //Set state to loading

    //Assign value for the file without extension

    //Call smart contract uploadFile function 

  }

  //Set states
  constructor(props) {
    super(props)
    this.state = {
      account: "",
      dstroage: null,
      files: [],
      loading: false,
      type: null,
      name: null
    }

    //Bind functions
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        {this.state.loading
          ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
          : <Main
            files={this.state.files}
            captureFile={this.captureFile}
            uploadFile={this.uploadFile}
          />
        }
      </div>
    );
  }
}

export default App;