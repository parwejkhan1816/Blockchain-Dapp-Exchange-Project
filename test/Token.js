const { expect } = require('chai');
const { ethers } =  require('hardhat');

const tokens = (n) =>{
    return ethers.utils.parseUnits(n.toString(),'ether');
}

describe('Token', ()=>{
    let token,accounts,deployer,receiver,exchange;
    beforeEach(async ()=>{
        //Code goes here...
        const Token = await ethers.getContractFactory('Token');
        token = await Token.deploy('Dapp University','DAPP','1000000');
        accounts = await ethers.getSigners();
        deployer = accounts[0]; 
        receiver = accounts[1];
        exchange = accounts[2];
    })

 describe('Deployement' , ()=>{

      const name = 'Dapp University';
      const symbol = 'DAPP';
      const decimals = '18';
      const totalSupply =  tokens('1000000');

      it('has correct name ', async ()=>{
        expect(await token.name()).to.equal(name);
      })

      it('has correct symbol ' , async ()=>{      
        expect(await token.symbol()).to.equal(symbol);
      })

      it('has correct decimals ', async ()=>{
        expect(await token.decimals()).to.equal('18');
      })

      it('has correct total supply ', async ()=>{
        expect(await token.totalSupply()).to.equal(tokens('1000000'));
      })

      it('assign total supply to deployer ', async ()=>{
        expect(await token.balanceOf(deployer.address)).to.equal(totalSupply);
      })
 })

 describe('Sending Tokens ' , ()=>{
    let amount,transaction,result;

    describe('Success' , ()=>{

     beforeEach( async ()=>{
        amount = tokens(100);
        transaction = await token.connect(deployer).transfer(receiver.address,amount);
        result = await transaction.wait();
     })

     it('transfering token balances ' , async ()=>{
        expect(await token.balanceOf(deployer.address)).to.equal(tokens(999900));
        expect(await token.balanceOf(receiver.address)).to.equal(amount);
     })

     it('emits a transfer Event ', async ()=>{
        const event = result.events[0];
        expect(event.event).to.equal('Transfer');
        const args = event.args;
        expect(args.from).to.equal(deployer.address);
        expect(args.to).to.equal(receiver.address);
        expect(args.value).to.equal(amount);
      })    

    })

     describe('Failure', ()=>{

        it('reject insufficents balances' , async ()=>{
         const invalidAmount = tokens(100000000);
         await expect(token.connect(deployer).transfer(receiver.address,invalidAmount)).to.be.reverted;
        })

        it('reject invliad address',async ()=>{
        const amount = tokens(100);
         await expect(token.connect(deployer).transfer('0x0000000000000000000000000000000000000000',amount)).to.be.reverted;
        })

     })

  })

 describe('Approving tokens', ()=>{
    let amount,transaction,result;
    beforeEach( async ()=>{
        amount = tokens(100);
        transaction = await token.connect(deployer).approve(exchange.address,amount);
        result = await transaction.wait();
    })

    describe('success', ()=>{

        it('allocate an allowance for delegated token spending ', async ()=>{
          expect(await token.connect(deployer).allowance(deployer.address,exchange.address)).to.equal(amount);
        })

        it('emits an approval event', async ()=>{
           const event = result.events[0];
           expect(event.event).to.equal('Approval');
           const args= event.args;
           expect(args.owner).to.equal(deployer.address);
           expect(args.spender).to.equal(exchange.address);
           expect(args.value).to.equal(amount);
        })

    })

    describe('Failure', ()=>{

        it('rejects an invalid address', async()=>{
          await expect(token.connect(deployer).approve('0x0000000000000000000000000000000000000000',amount)).to.be.reverted;
        })

    })
 })
 
 describe('Delegated token transfer', ()=>{
    let amount , transaction , result;

    beforeEach(async ()=>{
        amount = tokens(100);
        transaction = await token.connect(deployer).approve(exchange.address,amount);
        result = await transaction.wait();
    })

    describe('success', ()=>{

        beforeEach(async ()=>{
            transaction = await token.connect(exchange).transferFrom(deployer.address,receiver.address,amount);
            result = await transaction.wait();
        })

        it('Transfer Token balances ', async ()=>{
            expect(await token.balanceOf(deployer.address)).to.equal(tokens(999900));
            expect(await token.balanceOf(receiver.address)).to.equal(tokens(100));
        })

        it('resert the allowance balanace ', async ()=>{
            expect(await token.allowance(deployer.address,exchange.address)).to.be.equal(0);
        })

        it('emits a transfer Event ', async ()=>{
            const event = result.events[0];
            expect(event.event).to.equal('Transfer');
            const args = event.args;
            expect(args.from).to.equal(deployer.address);
            expect(args.to).to.equal(receiver.address);
            expect(args.value).to.equal(amount);
        })   
    })

    describe('failure', ()=>{

        it('failed while passing an invalid amount', async ()=>{
          const invalidAmount = tokens(100000000);
          await expect(token.connect(exchange).transferFrom(deployer.address,receiver.address,invalidAmount)).to.be.reverted;
        })

    })

 })

})