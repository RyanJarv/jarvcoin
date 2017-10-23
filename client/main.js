import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Template.hello.onCreated(function helloOnCreated() {
  EthBlocks.init();
  EthTools.ticker.start();

  this.srcAccount = EthAccounts.findAll().fetch()[0];
  web3.eth.defaultAccount = this.srcAccount.address;

  this.transMsg = new ReactiveVar("");


  this.destAddr = new ReactiveVar("");
  this.destBalance = new ReactiveVar(0);

});

Template.hello.helpers({
  counter() {
    return Template.instance().counter.get();
  },
  currentBlock() {
    return EthBlocks.latest.number;
  },
  balance() {
    return EthTools.formatBalance(Template.instance().srcAccount.balance, "0,0.00[0000]", "ether")
  },
  balanceUSD() {
    return EthTools.formatBalance(Template.instance().srcAccount.balance, "0,0.00[0000]", "usd")
  },
  ethTicker() {
    return EthTools.ticker.findOne('usd').price;
  },
  transMsg() {
    return Template.instance().transMsg.get();
  },
  destBalance() {
    return EthTools.formatBalance(Template.instance().destBalance.get(), '0,0.00[0000]', 'ether');
  },
  destAddr() {
    return Template.instance().destAddr.get();
  },
});

Template.hello.events({
  'click #send'(event, instance) {
    web3.eth.sendTransaction({to: instance.destAddr.get(), value: EthTools.toWei(1, 'usd')}, function (error, result) {
      if (!error) {
        instance.transMsg.set("$1 inflight!");
      } else {
        instance.transMsg.set("Error sending transaction: " + error);
      }
    });
  },
  'click #update'(event, instance) {
    web3.eth.getBalance(instance.destAddr.get(), function (error, result) {
      if (!error) {
        instance.destBalance.set(result);
      } else {
        instance.destBalance.set(error);
      }
    });
  },
  'change .destAddr': function(error, value){
       instance.destAddr.set(value);
   }
});
