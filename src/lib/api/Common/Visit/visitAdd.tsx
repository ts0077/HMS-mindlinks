import axios from 'axios'
import { HMS_Base_Url } from '../../baseUrl'
import ErrorHandles from '../../errorHandles'
import { VisitEndpoints } from './visitEndpoints'

type VitalProps = {
    temperature: number
    pulse: number
    bloodPressure: string
    respiratoryRate: number
    oxygenSaturation: number
    weight: number
    height: number
}

type dataprops = {
    mrNo: string
    doctorID: string, 
    department: string 
    complaint: string
    vitals : VitalProps
   
}


export default async function VisitAddApi ({mrNo,doctorID,department,complaint,vitals}:dataprops,token:string){
const url = HMS_Base_Url + VisitEndpoints.AddVisit

try{
 const res = await axios.post (url,
    {
        mrNo,
        doctorID,
        department,
        complaint,
        vitals
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