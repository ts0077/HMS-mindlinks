import axios from 'axios'
import { HMS_Base_Url } from '../../baseUrl'
import ErrorHandles from '../../errorHandles'
import { BillingEndpoints } from './BillingEndpoints'

type dataprops = {
    visitID: number
    totalAmount: number
    paidAmount: number  
    type: string
    paymentMode: string
    remarks:string
   
}


export default async function BillingTransactionAddApi ({visitID,totalAmount,paidAmount,type,paymentMode,remarks}:dataprops,token:string){
const url = HMS_Base_Url + BillingEndpoints.Add

try{
 const res = await axios.post (url,
    {
        visitID,
        totalAmount,
        paidAmount,
        type,
        paymentMode,
        remarks
    }
    ,{
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