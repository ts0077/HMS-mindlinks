import axios from 'axios'
import { HMS_Base_Url } from '../../baseUrl'
import ErrorHandles from '../../errorHandles'
import { dosageEndpoints } from './dosageEndpoints'



export default async function dosageListApi (token:string){
const url = HMS_Base_Url + dosageEndpoints.List

try{
 const res = await axios.get(url,
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