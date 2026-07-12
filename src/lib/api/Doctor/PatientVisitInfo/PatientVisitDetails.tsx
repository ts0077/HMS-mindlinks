import axios from 'axios'
import { HMS_Base_Url } from '../../baseUrl'
import ErrorHandles from '../../errorHandles'
import { PatientVisitInfoEndpoints } from './PatientVisitInfoEndpoints'



export default async function PatientVisitDetailsListApi (visitID:string,token:string){
const url = HMS_Base_Url + PatientVisitInfoEndpoints.visitDetail

try{
 const res = await axios.get(url,
   {
    params: {
        visitID
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