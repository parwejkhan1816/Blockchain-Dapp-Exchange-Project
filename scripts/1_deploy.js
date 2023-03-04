
async function main() {
	//Fetch contract to deploy

	const accounts = await ethers.getSigners();
	console.log(`Account Fetched : \n${accounts[0].address}\n${accounts[1].address}\n`)

	const Token = await ethers.getContractFactory("Token");
    const Exchange = await ethers.getContractFactory("Exchange");

	const dapp = await Token.deploy('Dapp University','DAPP','1000000');
	dapp.deployed();
	console.log(`DAPP Deployed to : ${dapp.address}`);

	const mETH = await Token.deploy('mETH','mETH','1000000');
	mETH.deployed();
	console.log(`mETH Deployed to : ${mETH.address}`);

	const mDAI = await Token.deploy('mDAI','mDAI','1000000');
	mDAI.deployed();
	console.log(`mDAI Deployed to : ${mDAI.address}`);

	const exchange = await Exchange.deploy(accounts[1].address,10);
    exchange.deployed();
    console.log(`Exchange is deployed to : ${exchange.address}`);
}   

main()
	.then(() => process.exit(0))
	.catch((error)=>{
		console.log(error);
		process.exit(1);
	});