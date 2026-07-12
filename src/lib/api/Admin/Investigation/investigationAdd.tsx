import axios from 'axios'
import { HMS_Base_Url } from '../../baseUrl'
import ErrorHandles from '../../errorHandles'
import { investigationEndpoint } from './investigationEndpoints'

type dataprops = {
    testName: string
    price: number 
    reportingTime: number
}


export default async function investigationAddApi ({testName,price,reportingTime}:dataprops,token:string){
const url = HMS_Base_Url + investigationEndpoint.Add

try{
 const res = await axios.post (url,
    {
        testName,
        price,
        reportingTime
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