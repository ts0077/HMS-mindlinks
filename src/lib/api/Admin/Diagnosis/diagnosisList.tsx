import axios from 'axios'
import { HMS_Base_Url } from '../../baseUrl'
import ErrorHandles from '../../errorHandles'
import { diagnosisEndpoints } from './diagnosisEndpoints'




export default async function diagnosisListApi (token:string){
const url = HMS_Base_Url + diagnosisEndpoints.List

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