import axios from 'axios'
import { HMS_Base_Url } from '../../baseUrl'
import ErrorHandles from '../../errorHandles'
import { patientInfoEnpoints } from './patientInfoEndpoints'

type dataprops = {
    patientName: string,
    dob: Date
    gender: string,
    phone: String
    maritalStatus: string
    fatherName:string
    husbandName:string
    cnic:String   
}

export default async function patientInfoAddApi ({patientName,dob,gender,phone,maritalStatus,fatherName,husbandName,cnic}:dataprops,token:string){
const url = HMS_Base_Url + patientInfoEnpoints.Add

try{
 const res = await axios.post (url,
    {
        patientName,
        dob,
        gender,
        phone,
        maritalStatus,
        husbandName,
        fatherName,
        cnic
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