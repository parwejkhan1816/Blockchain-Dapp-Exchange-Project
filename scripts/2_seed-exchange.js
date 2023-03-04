
const { ethers } = require('hardhat');
const config = require('../src/config.json');


const tokens = (n) =>{
  return ethers.utils.parseUnits(n.toString(),'ether');
}

const wait = (seconds)=>{
	const millSeconds = seconds * 1000;

	return new Promise((resolve)=>{
		setTimeout(resolve,millSeconds)
	})
}

async function main(){

	const accounts = await ethers.getSigners();

	const { chainId } = await ethers.provider.getNetwork();
	console.log('chainId is ', chainId);

	const Dapp = await ethers.getContractAt('Token',config[chainId].Dapp.address);
	console.log(`Dapp token fetched : ${Dapp.address}`);

	const mETH = await ethers.getContractAt('Token',config[chainId].mETH.address);
	console.log(`mETH token fetched : ${mETH.address}\n`);

	const mDAI = await ethers.getContractAt('Token',config[chainId].mDAI.address);
	console.log(`mDAI token fetched : ${mDAI.address}`);

	const exchange = await ethers.getContractAt('Exchange',config[chainId].exchange.address);
	console.log(`exchanges fetched  : ${exchange.address}\n`);

	const sender = accounts[0];
	const receiver = accounts[1];
	let amount = tokens(10000);

	let transaction ,result;

	transaction = await mETH.connect(sender).transfer(receiver.address,amount);
	result = await transaction.wait();
	console.log(`Transferred ${amount} token from ${sender.address} to ${receiver.address}`);

	const user1 = accounts[0];
	const user2 = accounts[1];
	amount = tokens(10000);


	transaction = await Dapp.connect(user1).approve(exchange.address,amount);
	result = await transaction.wait();
	console.log(`approved ${amount} token from ${user1.address} `);

	transaction = await exchange.connect(user1).depositToken(Dapp.address,amount);
	result = await transaction.wait();
	console.log(`deposit ${amount} token from ${user1.address}\n `);

	transaction = await mETH.connect(user2).approve(exchange.address,amount);
	result = await transaction.wait();
	console.log(`approved ${amount} token from ${user2.address} `);

	transaction = await exchange.connect(user2).depositToken(mETH.address,amount);
	result = await transaction.wait();
	console.log(`deposit ${amount} token from ${user2.address} \n`);

	let orderId;
	transaction = await exchange.connect(user1).makeOrder(mETH.address,tokens(100),Dapp.address,tokens(5));
	result = await transaction.wait();
	console.log(`make Order from ${user1.address}`);

	orderId = result.events[0].args.id;
	transaction = await exchange.connect(user1).cancelOrder(orderId);
	result = await transaction.wait();
	console.log(`Cancelled order from ${user1.address}\n`);  

	await wait(1);

	transaction = await exchange.connect(user1).makeOrder(mETH.address,tokens(100),Dapp.address,tokens(5));
	result = await transaction.wait();
	console.log(`make Order from ${user1.address}`);

	orderId = result.events[0].args.id;
	transaction = await exchange.connect(user2).fillOrder(orderId);
	result = await transaction.wait();
	console.log(`Filled order from ${user2.address}\n`);

	await wait(1); 

	transaction = await exchange.connect(user1).makeOrder(mETH.address,tokens(50),Dapp.address,tokens(15));
	result = await transaction.wait();
	console.log(`make Order from ${user1.address}`);

	orderId = result.events[0].args.id;
	transaction = await exchange.connect(user2).fillOrder(orderId);
	result = await transaction.wait();
	console.log(`Filled order from ${user2.address}\n`);

	await wait(1); 

	transaction = await exchange.connect(user1).makeOrder(mETH.address,tokens(200),Dapp.address,tokens(20));
	result = await transaction.wait();
	console.log(`make Order from ${user1.address}`);

	orderId = result.events[0].args.id;
	transaction = await exchange.connect(user2).fillOrder(orderId);
	result = await transaction.wait();
	console.log(`Filled order from ${user2.address}\n`);

	await wait(1); 

	for(let i=1;i<=10;i++)
	{
		transaction = await exchange.connect(user1).makeOrder(mETH.address,tokens(10 * i),Dapp.address,tokens(10));
		result = await transaction.wait();
		console.log(`make  Order from ${user1.address}`)
	}

	for(let i=1;i<=10;i++)
	{
		transaction = await exchange.connect(user2).makeOrder(Dapp.address,tokens(10),mETH.address,tokens(10 * i));
		result = await transaction.wait();
		console.log(`make  Order from ${user2.address}`)
	}

}


main()
	.then(() => process.exit(0))
	.catch((error)=>{
		console.log(error);
		process.exit(1);
	});