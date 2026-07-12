import axios from 'axios'
import { HMS_Base_Url } from '../../baseUrl'
import ErrorHandles from '../../errorHandles'
import { premorbidEndpoints } from './premorbidEndpoints'



export default async function premorbidListApi (token:string){
const url = HMS_Base_Url + premorbidEndpoints.List

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