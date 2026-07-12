import axios from 'axios'
import { HMS_Base_Url } from '../../baseUrl'
import ErrorHandles from '../../errorHandles'
import { medicineEndpoints } from './medicineEndpoints'



export default async function medicineListApi (token:string){
const url = HMS_Base_Url + medicineEndpoints.List

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