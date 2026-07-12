import axios from 'axios'
import { HMS_Base_Url } from '../../baseUrl'
import ErrorHandles from '../../errorHandles'
import { doctorEndpoints } from './doctorEndpoints'



export default async function docotrListApi (token:string){
const url = HMS_Base_Url + doctorEndpoints.List

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