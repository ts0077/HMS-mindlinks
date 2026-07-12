import axios from 'axios'
import { HMS_Base_Url } from '../../baseUrl'
import ErrorHandles from '../../errorHandles'
import { investigationEndpoint } from './investigationEndpoints'

type dataprops = {
    testName: string
    price: number 
    reportingTime: number
    testID: number
}


export default async function investigationUpdateApi ({testName,price,reportingTime,testID}:dataprops,token:string){
const url = HMS_Base_Url + investigationEndpoint.Update

try{
 const res = await axios.post (url,
    {
        testName,
        price,
        reportingTime,
        testID
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