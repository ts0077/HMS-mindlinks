import axios from 'axios'
import { HMS_Base_Url } from '../../baseUrl'
import ErrorHandles from '../../errorHandles'
import { PatientVisitInfoEndpoints } from './PatientVisitInfoEndpoints'



export default async function PatientQueueListApi (doctorID:string,token:string){
const url = HMS_Base_Url + PatientVisitInfoEndpoints.queue

try{
 const res = await axios.get(url,
   {
    params: {
            doctorID
    },
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