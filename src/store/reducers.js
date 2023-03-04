export const provider = (state = {} , action) =>{
	switch(action.type){
	   case 'PROVIDER_LOADED':
	      return {
	      	...state,
	      	connection: action.connection
	      }
	    case 'NETWOTK_LOADED':
	      return {
	      	...state,
	      	chainId: action.chainId
	      }  
	    case 'ACCOUNT_LOADED':
	      return {
	      	...state,
	      	account: action.account
	      }
	    case 'ETHER_BALANCE_LOADED':
	      return {
	      	...state,
	      	balance: action.balance
	      } 

	     default:
	     	return state 
	}	
} 

const DEFAULT_TOKEN_STATE = { 
	loaded:false, 
	contracts:[], 
	symbol: [] 
}

export const tokens = (state = DEFAULT_TOKEN_STATE, action) =>{
	switch(action.type){
		case 'TOKEN_1_LOADED':
			return{
				...state,
				loaded:true,
				contracts: [action.token],
				symbol: [action.symbol]
			}
		case 'TOKEN_1_BALANCE_LOADED':
			return{
				...state,
				balances: [action.balance]
			}
		case 'TOKEN_2_LOADED':
			return{
				...state,
				loaded:true,
				contracts: [...state.contracts, action.token],
				symbol: [...state.symbol , action.symbol]
			}
		case 'TOKEN_2_BALANCE_LOADED':
			return{
				...state,
				balances: [...state.balances,action.balance]
			}

		default:
			return state
	}
}

const DEFAULT_EXCHANGE_STATE = {
	loaded:false, 
	contract:{}, 
	transaction: { 
		isSuccessfull: false
	}, 
	allOrders: {
		loaded: false,
		data: [] 
	},
	cancelledOrders: {
		data: [] 
	},
	filledOrders: {
		data: [] 
	},
	events: [] 
}

export const exchange = (state = DEFAULT_EXCHANGE_STATE,action)=>{
	 let index,data 
	switch(action.type){
		case 'EXCHANGE_LOADED':
			return{
				...state,
				loaded: true,
				contract: action.exchange
			}

		case 'CANCELLED_ORDERS_LOADED':
			return{
				...state,
				cancelledOrders:{
					loaded: true,
					data: action.cancelledOrders
				}
			}

		case 'FILLED_ORDERS_LOADED':
			return{
				...state,
				filledOrders:{
					loaded: true,
					data: action.filledOrders
				}
			}

		case 'ALL_ORDERS_LOADED':
			return{
				...state,
				allOrders:{
					loaded: true,
					data: action.allOrders
				}
			}

		case 'ORDER_CANCEL_REQUEST':
			return {
				...state,
				transaction: {
					transactionType: 'Cancel',
					isPending: true,
					isSuccessfull: false
				}
			}

		case 'ORDER_CANCEL_SUCCESS':
			return {
				...state,
				transaction: {
					transactionType: 'Cancel',
					isPending: false,
					isSuccessfull: true
				},
				cancelledOrders: {
					...state.cancelledOrders,
					data: [
						...state.cancelledOrders.data,
						action.order
					]
				},
				events: [action.event, ...state.events]
			}

		case 'ORDER_CANCEL_FAIL':
			return {
				...state,
				transaction: {
					transactionType: 'Cancel',
					isPending: false,
					isSuccessfull: false,
					isError: true
				}
			}

		case 'ORDER_FILL_REQUEST':
			return{
				...state,
				transaction:{
				transactionType: 'Fill Order',
				isPending: true,
				isSuccessfull: false
				}
			}
		case 'ORDER_FILL_SUCCESS':

			index = state.filledOrders.data.findIndex(order => order.id.toString() === action.order.id.toString())

	    	if(index === -1){
	    		data = [...state.filledOrders.data,action.order]
	    	}else{
	    		data = state.filledOrders.data
	    	} 

			return{
				...state,
				transaction:{
				transactionType: 'Fill Order',
				isPending: false,
				isSuccessfull: true
				},
				filledOrders:{
					...state.filledOrders,
					data
				},
				events: [action.event,...state.events]
			}
		case 'ORDER_FILL_FAIL':
			return{
				...state,
				transaction:{
				transactionType: 'Fill Order',
				isPending: false,
				isSuccessfull: false,
				isError: true
				}
			}

		case 'EXCHANGE_TOKEN_1_BALANCE_LOADED':
			return{
				...state,
				balances: [action.balance]
			}
		case 'EXCHANGE_TOKEN_2_BALANCE_LOADED':
			return{
				...state,
				balances: [...state.balances,action.balance]
			}
		
		case 'TRANSFER_REQUEST':
			return{
				...state,
				transaction:{
					transactionType: 'Transfer',
					isPending: true,
					isSuccessfull: false
				},
				transferInProgress: true
			}
		case 'TRANSFER_SUCCESS':
			return{
				...state,
				transaction:{
					transactionType: 'Transfer',
					isPending: false,
					isSuccessfull: true
				},
				transferInProgress: false,
				events: [action.event, ...state.events]
			}
		case 'TRANSFER_FAIL':
			return{
				...state,
				transaction:{
					transactionType: 'Transfer',
					isPending: false,
					isSuccessfull: false,
					isError: true
				},
				transferInProgress: false
			}	


		case 'NEW_ORDER_REQUEST':
			return{
				...state,
				transaction: {
					transactionType: 'New Order',
					isPending: true,
					isSuccessfull: false
				},
			}
	    
	    case 'NEW_ORDER_SUCCESS':
	    	
	    	index = state.allOrders.data.findIndex(order => order.id.toString() === action.order.id.toString())

	    	if(index === -1){
	    		data = [...state.allOrders.data,action.order]
	    	}else{
	    		data = state.allOrders.data
	    	}   

			return{
				...state,
				allOrders: {
					...state.allOrders,
					data: [...state.allOrders.data,action.order]
				},
				transaction: {
					transactionType: 'New Order',
					isPending: false,
					isSuccessfull: true
				},
				events: [action.event, ...state.events]
			} 


		case 'NEW_ORDER_FAIL':
			return{
				...state,
				transaction: {
					transactionType: 'New Order',
					isPending: false,
					isSuccessfull: false,
					isError: true
				},
			}

		default:
			return state
	}
}