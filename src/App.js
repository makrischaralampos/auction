import React, { Component } from "react";
import AuctionContract from "./contracts/Auction.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = { highestBid: 0, web3: null, accounts: null, contract: null, input: "", highestBidder: "" };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = AuctionContract.networks[networkId];
      const instance = new web3.eth.Contract(
        AuctionContract.abi,
        deployedNetwork && deployedNetwork.address,
      );
      
      const highestBidResponse = await instance.methods.highestBid().call();
      const highestBidderResponse = await instance.methods.highestBidder().call();

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance, highestBid: highestBidResponse, highestBidder: highestBidderResponse });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  bid = async () => {
    const { accounts, contract, web3 } = this.state;
    const bidValue = await web3.utils.toWei(this.state.input, 'ether');

    // Stores a given value
    await contract.methods.bid().send({ from: accounts[0], value: bidValue });
    this.setState({highestBid: bidValue, highestBidder: accounts[0]});
  };
  
  withdraw = async () => {
      const {accounts, contract} = this.state;
      
      await contract.methods.withdraw().send({from: accounts[0]});
}
  
  myChangeHandler = (event) => {
      this.setState({input: event.target.value}, () => {
          console.log(this.state.input)
    });
}

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Auction !</h1>
        <h2>Auction Information below:</h2>
        <p><div>The Highest Bidder is: {this.state.highestBidder}</div></p>
        <p><div>The Highest Bid is: {this.state.highestBid} Wei</div></p>
        <p><div>Make your Bid NOW ! (Ether)</div></p>
        <input type = 'text' onChange = {this.myChangeHandler}/>
        <button onClick = {this.bid}>Bid</button>
        <p><div>Withdraw your money here ...</div></p>
        <button onClick = {this.withdraw}>Withdraw</button>
      </div>
    );
  }
}

export default App;
