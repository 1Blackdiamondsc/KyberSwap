import React from 'react';
import * as keyService from "./baseKey"
import {newWeb3Instance} from "../web3"

export default class Metamask extends React.Component{

  constructor(props){
    super(props)
    this.web3Service = newWeb3Instance()
  }
  
  getDisconnected(){    
    var web3 = this.web3Service
    return new Promise((resolve, reject) => {     
      web3.getCoinbase().then(address => {
        var addressInterval = setInterval(function() {
          web3.getCoinbase().then(updatedAddress => {
            if (updatedAddress != address){
              clearInterval(addressInterval)
              resolve()              
            }
          })
        }, 1000)
      })          
    })    
  }  

  async signSignature(message, account) {
    try {      
      var signature = await this.web3Service.sign(message)

      return signature
    }catch(err){
      console.log(err)
      throw err
    }    
  }

  async broadCastTx(funcName, ...args) {
    try {
      var txHash = await this.callSignTransaction(funcName, ...args)
      return txHash
    } catch (err) {
      console.log(err)
      throw err
    }
  }

  callSignTransaction = (funcName, ...args) => {
    return new Promise((resolve, reject) => {
      keyService[funcName](...args).then(result => {
        const { txParams, keystring, password } = result
        this.sealTx(txParams, keystring, password).then(result => {
          resolve(result)
        }).catch(e => {
          console.log(e.message)
          reject(e)
        })
      })
    })
  }

  sealTx = (txParams, keystring, password) => {
    txParams.gas = txParams.gasLimit
    delete (txParams.gasLimit)

    return new Promise((resolve, reject) => {
      this.web3Service.web3.eth.sendTransaction(txParams, function (err, transactionHash) {
        if (!err) {
          resolve(transactionHash)
        } else {
          console.log(err)
          reject(err.message)
        }
      })
    })
  }
  
  getWalletName = () => {
    return this.web3Service.getWalletName();
  }
  
  getMetaName = () => {
    return this.web3Service.getWalletName();
  }
}
