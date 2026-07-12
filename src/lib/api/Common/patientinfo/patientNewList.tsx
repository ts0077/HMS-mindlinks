import axios from 'axios'
import { HMS_Base_Url } from '../../baseUrl'
import ErrorHandles from '../../errorHandles'
import { patientInfoEnpoints } from './patientInfoEndpoints'



export default async function PatientNewListApi (token:string){
const url = HMS_Base_Url + patientInfoEnpoints.List

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