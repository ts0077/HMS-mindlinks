import axios from 'axios'
import { HMS_Base_Url } from '../../baseUrl'
import ErrorHandles from '../../errorHandles'
import { PatientVisitInfoEndpoints } from './PatientVisitInfoEndpoints'
import premorbidListApi from '../../Admin/Premorbid/premorbidList'
import medicineListApi from '../../Admin/Medecine/medicineList'
import diagnosisListApi from '../../Admin/Diagnosis/diagnosisList'
import investigationListApi from '../../Admin/Investigation/investigationList'


type medecineProps = {
    medicineName:string,
    dosage:string,
    frequency:string,
    duration:string,
    route:string,
    instructions:string
}

type dataprops = {
    visitID: number,
    premorbids:string,
    complaint: string,
    investigations: string,
    diagnosis: string,
    nextVisitDate: string,
    status: string,
    medicines: medecineProps[]
   
}


export default async function ConsultationAddApi ({visitID,premorbids,complaint,investigations,diagnosis,nextVisitDate,status,medicines}:dataprops,token:string){
const url = HMS_Base_Url + PatientVisitInfoEndpoints.ConsultationAdd

try{
 const res = await axios.post (url,
    {
        visitID,premorbids,complaint,investigations,diagnosis,nextVisitDate,status,medicines
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