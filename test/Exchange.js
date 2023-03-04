const { expect } = require('chai');
const { ethers } = require('hardhat');


const tokens = (n) =>{
  return ethers.utils.parseUnits(n.toString(),'ether'); 
}

describe('Exchange' , () =>{
    let deployer , feeAccount , exchange;
    const feePercent = 10;

	beforeEach( async ()=>{
		const Exchange = await ethers.getContractFactory('Exchange');
		const Token = await ethers.getContractFactory('Token');

		token1 = await Token.deploy('Dapp University','DAPP','1000000');
		token2 = await Token.deploy('Mock Dai','wDAI','1000000');

		const accounts = await ethers.getSigners();
		deployer = accounts[0];
		feeAccount = accounts[1];
		user1 =accounts[2];
		user2 =accounts[3];
    
		let transaction = await token1.connect(deployer).transfer(user1.address,tokens(100));
		await transaction.wait();

 		exchange = await Exchange.deploy(feeAccount.address,feePercent);

	})

	describe('Deployement' , ()=>{

		  it('tracks the feeAccount address', async ()=> {
	      	expect(await exchange.feeAccount()).to.equal(feeAccount.address);
	    })

	    it('tracks the feePercent ', async ()=>{
	    	  expect(await exchange.feePercent()).to.equal(feePercent);
	    })

	})

	describe('Depositing tokens' , ()=>{
		let amount , transaction , result;
		amount = tokens(10);
		
		beforeEach(async ()=>{

			transaction = await token1.connect(user1).approve(exchange.address,amount);
			await transaction.wait();

			transaction = await exchange.connect(user1).depositToken(token1.address,amount);
			result = await transaction.wait();
			
		})

		describe('Success' , async ()=>{
			it('tracks the token deposit ', async ()=>{
				expect(await token1.balanceOf(exchange.address)).to.equal(amount);
				expect(await exchange.tokens(token1.address,user1.address)).to.equal(amount);
			})

			it('it tracks the balance of user', async ()=>{
				expect(await exchange.balanceOf(token1.address,user1.address)).to.equal(amount)
			})

			it('emits the Deposit event', async ()=>{
				let event = await result.events[1];
				expect(event.event).to.equal('Deposit');
       
				let args = event.args;
				expect(args.token).to.equal(token1.address);
				expect(args.user).to.equal(user1.address);
				expect(args.amount).to.equal(amount);
				expect(args.balance).to.equal(amount);
			})

		})

		describe('Failure', async ()=>{

			it('it fails when no token approved', async ()=>{
				await expect(exchange.connect(user1).depositToken(token1.address,amount)).to.be.reverted;
			})

		})

	})

	describe('withdrawing tokens', ()=>{
		let amount,transaction , result;
		amount = tokens(10);
		
		beforeEach(async ()=>{
			//approving token before withdrawing

			transaction = await token1.connect(user1).approve(exchange.address,amount);
			await transaction.wait();

			//send token to wallets after approving the tokens
			transaction =  await exchange.connect(user1).depositToken(token1.address,amount);
			await transaction.wait();

			//transfering token to user from exchange or withdrawing token back to user account

			transaction = await exchange.connect(user1).withdrawToken(token1.address,amount);
			result = await transaction.wait()
		})

		describe('Success', ()=>{

			it('withdraw token funds', async ()=>{
				expect(await token1.balanceOf(exchange.address)).to.equal(0);
				expect(await exchange.tokens(token1.address,exchange.address)).to.equal(0);
			})

			it('emits the Deposit event', async ()=>{
				let event = await result.events[1];
				expect(event.event).to.equal('Withdraw');
       
				let args = event.args;
				expect(args.token).to.equal(token1.address);
				expect(args.user).to.equal(user1.address);
				expect(args.amount).to.equal(amount);
				expect(args.balance).to.equal(0);
			})

		})

		describe('Failure', ()=>{

			it('attempts to withdraw insufficents balance', async ()=>{
				await expect(exchange.connect(user1).withdrawToken(token1.address,amount)).to.be.reverted;
			})

		})

	})

	describe('checking balances', ()=>{

		let transaction,amount;
		amount = tokens(1);

		beforeEach(async ()=>{
			transaction = await token1.connect(user1).approve(exchange.address,amount);
			await transaction.wait();

			transaction = await exchange.connect(user1).depositToken(token1.address,amount);
			await transaction.wait();
		})

		it('returns user balances', async ()=>{
			expect(await exchange.balanceOf(token1.address,user1.address)).to.equal(amount);
		})

	})

  describe('make orders', ()=>{
  	let transaction ,result, amount;
  	amount = tokens(1);


  	describe('success', ()=>{

  	beforeEach(async ()=>{
  		transaction = await token1.connect(user1).approve(exchange.address,amount);
  		result = await transaction.wait();

  		transaction = await exchange.connect(user1).depositToken(token1.address,amount);
  		result = await transaction.wait();

  		transaction = await exchange.connect(user1).makeOrder(token2.address,amount,token1.address,amount);
  		result =await transaction.wait();
  	})

  		 it('tracks the newly created order', async ()=>{
  		 	expect(await exchange.orderCount()).to.equal(1);
  		 })

  		 it('emits the Order event', async ()=>{
  		 	let event = result.events[0];
  		 	expect(event.event).to.equal('Order');

  		 	let args = event.args;
  		 	expect(args.id).to.equal(1);
  		 	expect(args.user).to.equal(user1.address);
  		 	expect(args.tokenGet).to.equal(token2.address);
  		 	expect(args.amountGet).to.equal(amount);
  		 	expect(args.tokenGive).to.equal(token1.address);
  		 	expect(args.amountGive).to.equal(amount);
  		 	expect(args.timestamp).to.at.least(1);
  		 })

  	})


  	describe('failure', ()=>{
  		
  		it('rejects with no balance ', async ()=>{
  			await expect(exchange.connect(user1).makeOrder(token2.address,amount,token1.address,amount)).to.be.reverted;
  		})

  	})

  })

  describe('Order action', ()=>{
  	let transaction,result,amount;
  	amount = tokens(1);

  	beforeEach(async ()=>{
  		transaction = await token1.connect(user1).approve(exchange.address,amount);
  		result = await transaction.wait();

  		transaction = await exchange.connect(user1).depositToken(token1.address,amount);
  		result = await transaction.wait();

  		transaction = await token2.connect(deployer).transfer(user2.address,tokens(100));
  		result = await transaction.wait();

  		transaction = await token2.connect(user2).approve(exchange.address,tokens(2));
  		result = await transaction.wait();

  		transaction = await exchange.connect(user2).depositToken(token2.address,tokens(2));

  		transaction = await exchange.connect(user1).makeOrder(token2.address,amount,token1.address,amount);
  		result =await transaction.wait();
  	})

  	describe('Cancelling orders ', ()=>{
  		
  		describe('success',()=>{
  			
  			beforeEach(async ()=>{
  				transaction = await exchange.connect(user1).cancelOrder(1);
  				result = await transaction.wait();
  			})

  			it('update cancelled orders', async ()=>{
  				expect(await exchange.orderCancelled(1)).to.equal(true);
  			})

  			it('emits the Cancel event', async ()=>{
  		 	let event = result.events[0];
  		 	expect(event.event).to.equal('Cancel');

  		 	let args = event.args;
  		 	expect(args.id).to.equal(1);
  		 	expect(args.user).to.equal(user1.address);
  		 	expect(args.tokenGet).to.equal(token2.address);
  		 	expect(args.amountGet).to.equal(amount);
  		 	expect(args.tokenGive).to.equal(token1.address);
  		 	expect(args.amountGive).to.equal(amount);
  		 	expect(args.timestamp).to.at.least(1);
  		 })

  		})

  		describe('failure', async ()=>{

  			beforeEach(async ()=>{
  				transaction = await token1.connect(user1).approve(exchange.address,amount);
      		result = await transaction.wait();

  	    	transaction = await exchange.connect(user1).depositToken(token1.address,amount);
  		    result = await transaction.wait();

  		    transaction = await exchange.connect(user1).makeOrder(token2.address,amount,token1.address,amount);
  		    result =await transaction.wait();
  			})

  			it('rejects invalid order ids ', async ()=>{
  				const invalidID = 999999;
  				await expect(exchange.connect(user1).cancelOrder(invalidID)).to.be.reverted;
  			})

  			it('rejects unauthorized cancellation', async ()=>{
  				await expect(exchange.connect(user2).cancelOrder(1)).to.be.reverted;
  			})

  	  })
  	  
  	  })

  	describe('filling orders', ()=>{

  		describe('Success', ()=>{
  			beforeEach(async ()=>{
  			transaction = await exchange.connect(user2).fillOrder(1);
  			result = await transaction.wait(); 
  		})

  		it('executes the trade and charge fees', async ()=>{
  			expect(await exchange.balanceOf(token1.address,user1.address)).to.be.equal(tokens(0));
  			expect(await exchange.balanceOf(token1.address,user2.address)).to.be.equal(tokens(1));
  			expect(await exchange.balanceOf(token1.address,feeAccount.address)).to.be.equal(tokens(0));

  			expect(await exchange.balanceOf(token2.address,user1.address)).to.be.equal(tokens(1));
  			expect(await exchange.balanceOf(token2.address,feeAccount.address)).to.be.equal(tokens(0.1));
  			expect(await exchange.balanceOf(token2.address,user2.address)).to.be.equal(tokens(0.9));
  		})

  		it('updates the filled order', async ()=>{
  			expect(await exchange.orderFilled(1)).to.equal(true);
  		})

  		it('emits a trade event', async ()=>{
  			let event = result.events[0];
  		 	expect(event.event).to.equal('Trade');

  		 	let args = event.args;
  		 	expect(args.id).to.equal(1);
  		 	expect(args.user).to.equal(user2.address);
  		 	expect(args.tokenGet).to.equal(token2.address);
  		 	expect(args.amountGet).to.equal(tokens(1));
  		 	expect(args.tokenGive).to.equal(token1.address);
  		 	expect(args.amountGive).to.equal(tokens(1));
  		 	expect(args.creator).to.equal(user1.address);
  		 	expect(args.timestamp).to.at.least(1);
  		 })
  		})

  		describe('failure', ()=>{

  			it('rejects invalid ids', async ()=>{
  				let invalidId = 99999;
  				await expect(exchange.connect(user2).fillOrder(invalidId)).to.be.reverted;
  			})

  			it('rejects already filled orders', async ()=>{
  				transaction =await exchange.connect(user2).fillOrder(1);
  				await transaction.wait();

  				await expect(exchange.connect(user2).fillOrder(1)).to.be.reverted;
  			})

  			it('rejects already canceled orders', async ()=>{
  				transaction =await exchange.connect(user1).cancelOrder(1);
  				await transaction.wait();

  				await expect(exchange.connect(user2).fillOrder(1)).to.be.reverted;
  			})

  		})


  	})


  	})


 })

