import { useSelector, useDispatch } from 'react-redux';
import Blockies from 'react-blockies';
import logo from '../assets/logo.png';
import eth from '../assets/eth.svg';
import { loadAccounts } from '../store/interaction.js';
import config from '../config.json';

const Navbar = () =>{
	const provider = useSelector(state => state.provider.connection)
	const chainId  = useSelector(state => state.provider.chainId)
	const account = useSelector(state => state.provider.account)
	const balance = useSelector(state => state.provider.balance)

	const dispatch = useDispatch()

	const connectHandler = async () =>{
		await loadAccounts(provider,dispatch)
	}
	const networkHandler = async (event)=>{
		await window.ethereum.request({
			method: 'wallet_switchEthereumChain',
			params: [{ chainId: event.target.value }]
		})
		console.log('network changing')
	}

   return(
   		<div className='exchange__header grid'>
   			<div className='exchange__header--brand flex'>
   				<img src={logo} className='logo' alt='DApp Logo'/>
   				<h1>DApp Token Exchange</h1>
   			</div>

   			<div className='exchange__header--networks flex'>
   			    <img src={eth} className='eth logo' alt='Eth Logo'/>

   			    { chainId && (

   			    <select name='networks' is='networks' value={ config[chainId] ? `0x${chainId.toString(16)}` : `	0`} onChange={networkHandler}>
   			     <option value='0' disabled>Select Network</option>
   			     <option value='0x7A69'>Localhost</option>
   			     <option value='0x5'>Goerli</option>
                </select>

   			    )}

   	
   			</div>   

   			<div className='exchange__header--account flex'>
				{balance ? 
				<p><small>My Balance</small>{Number(balance).toFixed(4)}</p>
				: <p><small>My Balance</small> 0 ETH</p>}
				{account ? 
				<a href=''>{account.slice(0,5)+'...'+account.slice(38,42)}
				<Blockies 
					seed={account}
					size={10}
					scale={3}
					color='#2187D0'
					bgColor='#F1F2F9'
					spotColor='#767F92'
					className='identicon'
				/>
				</a>
				: <button className='button' onClick={connectHandler}> Connect </button>	 
			}	

   			</div>
   		</div>
   	)
}

export default Navbar;