import { useSelector, useDispatch } from 'react-redux';
import config from '../config.json';
import { loadTokens } from '../store/interaction';

const Markets = () =>{
	const provider  = useSelector(state => state.provider.connection)
	const chainId  = useSelector(state => state.provider.chainId) 

	const dispatch = useDispatch()

	const marketHandler = async (e)=>{
		loadTokens((e.target.value).split(','),provider,dispatch)
	}

	return (
		<div className='component exchange__markets'>

			<div className='component__header'>
				<h2>Select Market </h2>
			</div>

				{ chainId && config[chainId] ? (
					<select name='markets' id='markets' onChange={marketHandler}>
						<option value={`${config[chainId].Dapp.address},${config[chainId].mETH.address}`}>Dapp / mETH</option>
						<option value={`${config[chainId].Dapp.address},${config[chainId].mDAI.address}`}>Dapp / mDAI</option>
					</select>
					) : (
					<div> Not deployed to network </div>
					)}


			<hr />
		</div>
		)
}

export default Markets;