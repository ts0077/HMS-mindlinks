import axios from 'axios'
import { HMS_Base_Url } from '../../baseUrl'
import ErrorHandles from '../../errorHandles'
import { investigationEndpoint } from './investigationEndpoints'



export default async function investigationListApi (token:string){
const url = HMS_Base_Url + investigationEndpoint.List

try{
 const res = await axios.get (url,
    {
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