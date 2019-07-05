	
	var privKey;
	var userName;
	var selectedNetwork;
	var contractAddress;
	var contractAbi;
	var contractJsonAbi;
	var contractArtifact;
	var web3;
	var account;
	GetStorageInfo();
	cssRemove();
	if(typeof web3 !== "undefined" && typeof web3.currentProvider !== "undefined") {
		web3 = new Web3(window.web3.currentProvider);
	} else {
		createWeb3();
	}
	document.getElementById("setNet").addEventListener("click", setNetwork);
	document.getElementById("loginButton").addEventListener("click", Login);
	document.getElementById("completeFields").addEventListener("click", CompleteFields);
	document.getElementById("submitButton").addEventListener("click", SubmitToBlockchain);
	document.getElementById("checkButton").addEventListener("click", CheckIntegrity);

	
	function SubmitToBlockchain (){
		
		document.getElementById("error").innerHTML = "";
		document.getElementById("comment").innerHTML = "";
		browser.tabs.query({active: true, currentWindow: true}).then((tabs)=>{
			return [tabs[0].id,tabs[0].url]
		}).then((tab)=>{
			var pathArray = tab[1].split('/');
			if(pathArray[2] == "twitter.com"){
				if(document.getElementById("url_id").value == "" || privKey == "" || document.getElementById("msg").value == ""){
					document.getElementById("error").innerHTML = "There is a problem with input fields, please check them and try again. Url, message and private key.";
					var e = new Error('There is a problem with input fields, please check them and try again. Url, message and private key.'); 
					throw e;
				} else {
					var pathArray = tab[1].split('/');
					var url = document.getElementById("url_id").value;
					var pk = '0x' + document.getElementById("pk").value;
					var message = document.getElementById("msg").value;
					try {
						account = web3.eth.accounts.privateKeyToAccount(pk);
					} catch {
						var e = new Error('Invalid private key'); 
						document.getElementById("error").innerHTML = "Invalid private key";
						throw e;
					}
					contractArtifact.methods.getUserName().call({ from: account.address })
					.then(name => {
						// Compruebo si el user puede registrar el mensaje porque lo ha escrito el.
						if(name == pathArray[3]){
							
							var bytecodeData = contractArtifact.methods.setContent(url, message).encodeABI();
							var p1 = web3.eth.getTransactionCount(account.address, "pending");
							var p2 = web3.eth.getGasPrice();//web3.eth.estimateGas({to: contractAddress,data: bytecodeData});
							Promise.all([p1, p2]).then(values => { 
								var nonceValue = values[0];
								var GasLimit = "1000000";
								var estimatedGas = values[1];
								var nonce = "0x" + (nonceValue).toString(16);
								rawtx = {
										nonce: nonce,
										gasPrice: web3.utils.toHex(estimatedGas),
										gasLimit: web3.utils.toHex(GasLimit),
										to: contractAddress,
										data: bytecodeData
									};
								var tx = new EthJS.Tx(rawtx);
								var privateKey = EthJS.Buffer.Buffer.from(document.getElementById("pk").value, "hex");

								tx.sign(privateKey);
								var raw = "0x" + tx.serialize().toString("hex");
								  
								web3.eth.sendSignedTransaction(raw)
								.once('transactionHash', function(hash){
									document.getElementById("comment").innerHTML = "Transaction sent, please wait til' it is mined"
									//Arranco el spin y el boton
									document.getElementById("spin").style.display = "block";
									document.getElementById("submitButton").style.display = "none";
								})
								.on('error', function(error){
									document.getElementById("comment").innerHTML = "";
									document.getElementById("error").innerHTML = "Error in transaction";
								})
								.then(transactionHash => {
									//Paro el spin
									document.getElementById("spin").style.display = "none"
									document.getElementById("submitButton").style.display = "block";
									document.getElementById("comment").innerHTML = "Transaction Completed"
									return transactionHash;
								}).catch(e => {
									document.getElementById("comment").innerHTML = "";
									document.getElementById("error").innerHTML = "Error in transaction";
									console.error("Error in transaction (sendTx function): ", e);
									throw e;
								});
							});
						} else {
							document.getElementById("error").innerHTML = "You can´t register a message that it is not yours and you must be logged and registered.";
						}
					});
			    }
			} else {
				document.getElementById("error").innerHTML = "You are not in Twitter.";
				console.error("You are not in Twitter.");
			}
		});
	}
	  
	function CheckIntegrity (){
	  
	    document.getElementById("error").innerHTML = "";
		document.getElementById("comment").innerHTML = "";
		if(document.getElementById("url_id").value == "" || document.getElementById("address").value == "" || document.getElementById("msg").value == ""){
			document.getElementById("error").innerHTML = "There is a problem with input fields, please check them and try again. Url, message and address.";
			var e = new Error('There is a problem with input fields, please check them and try again. Url, message and address.'); 
			throw e;
		  
		  } else {

				var url = document.getElementById("url_id").value;
				var userAddress = document.getElementById("address").value;
				var message = document.getElementById("msg").value;
				contractArtifact.methods.checkIntegrity(url, message, userAddress).call()
				.then(result => {
					if (result){
						browser.tabs.query({active: true, currentWindow: true}).then((tabs)=>{
							return [tabs[0].id,tabs[0].url]
						}).then((tab)=>{
							document.getElementById("comment").innerHTML = "Great! It is a consistent message.";
							var css = ".permalink-header a {display: block;width: 60px;height: 60px;background-image: url('https://cdn.pixabay.com/photo/2017/01/13/01/22/ok-1976099_960_720.png');background-position: right 30px center;background-size: 60px;background-repeat: no-repeat;}"; //permalink-header Probar!!
							var insertingCSS = browser.tabs.insertCSS(tab[0], {code: css});
							insertingCSS.then(null, onError);
						});
					} else {
						browser.tabs.query({active: true, currentWindow: true}).then((tabs)=>{
							var cssRight = ".permalink-header a {display: block;width: 60px;height: 60px;background-image: url('https://cdn.pixabay.com/photo/2017/01/13/01/22/ok-1976099_960_720.png');background-position: right 30px center;background-size: 60px;background-repeat: no-repeat;}"; //permalink-header Probar!!
							var removing = browser.tabs.removeCSS(tabs[0].id, {code: cssRight});
							removing.then(null, onError);
							return [tabs[0].id,tabs[0].url]
						}).then((tab)=>{
							document.getElementById("comment").innerHTML = "Ouch! It seems someone has modified this message.";
							var css = ".permalink-header a {display: block;width: 50px;height: 50px;background-image: url('https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/White_X_in_red_background.svg/450px-White_X_in_red_background.svg.png');background-position: right 30px center;background-size: 50px;background-repeat: no-repeat;}";
							var insertingCSS = browser.tabs.insertCSS(tab[0], {code: css});
							insertingCSS.then(null, onError);
						});
					}
				}).catch(err => {
					document.getElementById("comment").innerHTML = "";
					document.getElementById("error").innerHTML = "Error calling Smart Contract";
					throw err;
				});
				
			}
	}
	  
	function Login () {
		document.getElementById("error").innerHTML = "";
		document.getElementById("comment").innerHTML = "";
		//Recupero info de la url de la pestaña actual
		browser.tabs.query({active: true, currentWindow: true}).then((tabs)=>{
			return [tabs[0].id,tabs[0].url]
		}).then((tab)=>{
			var pathArray = tab[1].split('/');
			if(pathArray[2] == "twitter.com"){ //Hago estos dos if´s separados para poder tratar los errores por separado.
				if(document.querySelector("#pk").value.length == 64){
					var passwordInput = document.querySelector("#pk");
					//Coger nombre de usuario de la url
					contractArtifact.methods.getUserAddress(pathArray[3]).call()
					.then(result => {
						//
						///Compruebo que el usuario existe en la blockchain y que la direccion del monedero tambien.
						//
						var pk = '0x' + passwordInput.value;
						var acc = web3.eth.accounts.privateKeyToAccount(pk);
						if (result == acc.address){
							userName = pathArray[3];
							try {
								account = acc;
								browser.storage.local.set({
									authCredentials: {
										privateKey: passwordInput.value
									}
								});
								localStorage.setItem("userName", pathArray[3]);
							} catch {
								console.error("Ups! This Private key is not valid");
							}
							document.getElementById("comment").innerHTML = "This account is yours. Welcome back "+ userName +". You can submit messages.";
							
						} else if (result == "0x0000000000000000000000000000000000000000") {
							//
							///Peticion a blockchain a funcion getUserName y comprobar si lo que me devuelve es un string vacio o no.
							//							
							contractArtifact.methods.getUserName().call({ from: web3.eth.accounts.privateKeyToAccount(pk).address })
							.then(name => {
								if(name == ""){
									userName = pathArray[3];
									try {
										account = web3.eth.accounts.privateKeyToAccount(pk);
										browser.storage.local.set({
											authCredentials: {
												privateKey: passwordInput.value
											}
										});
										localStorage.setItem("userName", pathArray[3]);
									} catch {
										console.error("Ups! This Private key is not valid");
									}
									document.getElementById("comment").innerHTML = "Signing up";
									// you can register this account
									//TX
									var bytecodeData = contractArtifact.methods.setNewUser(userName).encodeABI();
									var p1 = web3.eth.getTransactionCount(account.address, "pending");
									var p2 = web3.eth.getGasPrice();//web3.eth.estimateGas({to: contractAddress,data: bytecodeData});
									Promise.all([p1, p2]).then(values => { 
										var nonceValue = values[0];
										var GasLimit = "1000000";
										var estimatedGas = values[1];
										document.getElementById("comment").innerHTML = "Gasprice "+estimatedGas;
										var nonce = "0x" + (nonceValue).toString(16);
										rawtx = {
												nonce: nonce,
												gasPrice: web3.utils.toHex(estimatedGas),
												gasLimit: web3.utils.toHex(GasLimit),
												to: contractAddress,
												data: bytecodeData
											};
										var tx = new EthJS.Tx(rawtx);
										var privateKey = EthJS.Buffer.Buffer.from(document.getElementById("pk").value, "hex");

										tx.sign(privateKey);
										var raw = "0x" + tx.serialize().toString("hex");
										web3.eth.sendSignedTransaction(raw)
										.once('transactionHash', function(hash){
											document.getElementById("comment").innerHTML = "Transaction sent, please wait til' it is mined";
											//Arranco el spin y oculto el boton
											document.getElementById("spin").style.display = "block";
											document.getElementById("loginButton").style.display = "none";
										})
										.on('error', function(error){
											document.getElementById("comment").innerHTML = "";
											document.getElementById("error").innerHTML = "Error in transaction";
											document.getElementById("spin").style.display = "none"
											document.getElementById("loginButton").style.display = "block";
										})
										.then(transactionHash => {
											//Paro el spin y vuelvo a mostrar el boton
											document.getElementById("spin").style.display = "none"
											document.getElementById("loginButton").style.display = "block";
											document.getElementById("comment").innerHTML = "Transaction Completed"
											return transactionHash;
										}).catch(e => {
											document.getElementById("comment").innerHTML = "";
											document.getElementById("error").innerHTML = "Error in transaction";
											console.error("Error in transaction (sendTx function): ", e);
											throw e;
										});
									});
								} else {
									document.getElementById("error").innerHTML = "This account has not been registered yet but your address has already associated an account. You can not associate two accounts to the same wallet";
									console.error("This account has not been registered yet but your address has already associated an account. You can not associate two accounts to the same wallet");
								}
							}).catch(err => {
								document.getElementById("comment").innerHTML = "";
								document.getElementById("error").innerHTML = "Error calling Smart Contract getUserName function";
								console.error("Error calling Smart Contract : ", err);
							});
						
						} else {
							document.getElementById("address").value = result;
							document.getElementById("comment").innerHTML = "Proceed to check the message.";
							document.getElementById("url_id").value = tab[1];
						}
					}).catch(err => {
						document.getElementById("comment").innerHTML = "";
						document.getElementById("error").innerHTML = "Error calling Smart Contract getUserAddress function";
						console.error("Error calling Smart Contract : ", err);
					});
				} else {
					document.getElementById("comment").innerHTML = "";
					document.getElementById("error").innerHTML = "Ups! PrivateKey length is wrong";
					var err = new Error('Ups! PrivateKey length is wrong');
					console.error(err);
				}
			} else {
				document.getElementById("comment").innerHTML = "";
				document.getElementById("error").innerHTML = "Ups! You are not in twitter";
				var err = new Error('Ups! You are not in twitter');
				console.error(err);
			}	
		});
	}
	
	function CompleteFields(){
		var pathArray;
		browser.runtime.getBackgroundPage().then((get)=>{
			console.log(get.message);
			document.getElementById("msg").value = get.message;
		});
		browser.tabs.query({active: true, currentWindow: true}).then((tabs)=>{
			pathArray = tabs[0].url.split('/');
			if(pathArray[2] == "twitter.com"){
				if(pathArray[5] == undefined){
					document.getElementById("comment").innerHTML = "Please, use autocomplete only if a message is selected.";
				} else {
					document.getElementById("url_id").value = tabs[0].url;
					contractArtifact.methods.getUserAddress(pathArray[3]).call()
					.then(result => {
						if(result == "0x0000000000000000000000000000000000000000"){
							document.getElementById("error").innerHTML = pathArray[3] + " is not register yet. You can´t check his messages";
						} else {
							document.getElementById("address").value = result;
							document.getElementById("comment").innerHTML = "Proceed submitting or checking messages.";
						}
					});				
				}
			} else {
				document.getElementById("error").innerHTML = "Ups! You are not in twitter";
			}
			
		});
	}
	
	function GetStorageInfo () {
		userName = localStorage.getItem("userName");
		selectedNetwork = localStorage.getItem("network");
		if(selectedNetwork == null){
			selectedNetwork = "MainNet";
			document.getElementById("mySelect").selectedIndex = 2;
		}
		const gettingStoredSettings = browser.storage.local.get();
		gettingStoredSettings.then(updateUI, onError);
	}

	function updateUI(restoredSettings) {
		if(restoredSettings.authCredentials == undefined){
			browser.storage.local.set({
				authCredentials: {
					privateKey: ""
				}
			});
		} else {
			document.querySelector("#pk").value = restoredSettings.authCredentials.privateKey;
			privKey = restoredSettings.authCredentials.privateKey;
		}
	    switch(selectedNetwork){
			case "Localhost": document.getElementById("mySelect").selectedIndex = 0; break;
			case "Ropsten": document.getElementById("mySelect").selectedIndex = 1; break;
			case "MainNet": document.getElementById("mySelect").selectedIndex = 2; break;
			default : document.getElementById("mySelect").selectedIndex = 2; break;
		  
	    }
	}
	
	function onError(e) {
	  console.error(e);
	}
	
	function setNetwork() {
	    selectedNetwork = document.getElementById("mySelect").options[document.getElementById("mySelect").selectedIndex].text
	    localStorage.setItem("network", selectedNetwork);
		document.getElementById("comment").innerHTML = selectedNetwork+" Network Selected";
		document.getElementById("error").innerHTML = "";
	    createWeb3();
	}
	
	function cssRemove(){
		browser.tabs.query({active: true, currentWindow: true}).then((tabs)=>{
			var cssRight = ".permalink-header a {display: block;width: 60px;height: 60px;background-image: url('https://cdn.pixabay.com/photo/2017/01/13/01/22/ok-1976099_960_720.png');background-position: right 30px center;background-size: 60px;background-repeat: no-repeat;}"; //permalink-header Probar!!
			var removingRight = browser.tabs.removeCSS(tabs[0].id, {code: cssRight});
			removingRight.then(null, onError);
			var cssWrong = ".permalink-header a {display: block;width: 50px;height: 50px;background-image: url('https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/White_X_in_red_background.svg/450px-White_X_in_red_background.svg.png');background-position: right 30px center;background-size: 50px;background-repeat: no-repeat;}";
			var removingWrong = browser.tabs.removeCSS(tabs[0].id, {code: cssWrong});
			removingWrong.then(null, onError);
		});
	}
	
	function createWeb3(){
		switch (selectedNetwork) {
			case "Ropsten":
					web3 = new Web3();
					var INFURA_URL = "https://ropsten.infura.io/v3/cd5a188472e146d7a8d1dc2bf6468a77";
					web3 = new Web3(new Web3.providers.HttpProvider(INFURA_URL));
					Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send
					contractAddress = "0x7036ea59c37131708289b4b1113bbdd915f69535";
					break;
			case "MainNet":
					web3 = new Web3();
					var INFURA_URL = "https://mainnet.infura.io/v3/cd5a188472e146d7a8d1dc2bf6468a77";
					web3 = new Web3(new Web3.providers.HttpProvider(INFURA_URL));
					Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send
					contractAddress = "0x99dcaa413134b0b38eeceee582161432eb1cbbd4";
					break;
			case "Localhost":
					web3 = new Web3();
					var URL = "http://localhost:7545";
					web3 = new Web3(new Web3.providers.HttpProvider(URL));
					Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send
					contractAddress = "0x9ab56344fd3033d8339eb0b9a6723442adfab3a7";
					break;
		}
		
		contractAbi = '[{"constant": false,"inputs": [{"name": "_url","type": "string"},{"name": "_msg","type": "string"}],"name": "setContent","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"},{"constant": false,"inputs": [{"name": "_name","type": "string"}],"name": "setNewUser","outputs": [],"payable": false,"stateMutability": "nonpayable","type": "function"},{"inputs": [],"payable": false,"stateMutability": "nonpayable","type": "constructor"},{"constant": true,"inputs": [{"name": "_url","type": "string"},{"name": "_msg","type": "string"},{"name": "_user","type": "address"}],"name": "checkIntegrity","outputs": [{"name": "","type": "bool"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [{"name": "_url","type": "string"}],"name": "getInfo","outputs": [{"name": "","type": "bytes32"},{"name": "","type": "address"},{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [{"name": "i","type": "uint256"}],"name": "getMyMessages","outputs": [{"name": "","type": "string"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "getMyNumberOfMessages","outputs": [{"name": "","type": "uint256"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [{"name": "_name","type": "string"}],"name": "getUserAddress","outputs": [{"name": "","type": "address"}],"payable": false,"stateMutability": "view","type": "function"},{"constant": true,"inputs": [],"name": "getUserName","outputs": [{"name": "","type": "string"}],"payable": false,"stateMutability": "view","type": "function"}]';
		contractJsonAbi = JSON.parse(contractAbi);
		contractArtifact = new web3.eth.Contract(contractJsonAbi, contractAddress);
	}
       
	
