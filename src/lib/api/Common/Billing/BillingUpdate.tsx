import axios from 'axios'
import { HMS_Base_Url } from '../../baseUrl'
import ErrorHandles from '../../errorHandles'
import { BillingEndpoints } from './BillingEndpoints'




export default async function BillingTransactionUpdateApi (billID: number,newAmount:number,token:string){
const url = HMS_Base_Url + BillingEndpoints.Update

try{
 const res = await axios.post (url,
    {
    
    }
    ,{
        params: {
                billID,
                newAmount
        },
    headers:{
        "Content-Type" : "application/json",
        Accept: "*/*",
        Authorization: `Bearer ${token}`
       
    }
 })
 return res.data
}
catch(error)
{
     ErrorHandles(error);
    throw error
}

}