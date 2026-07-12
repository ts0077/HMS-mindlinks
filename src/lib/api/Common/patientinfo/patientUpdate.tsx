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
    mrNo:number
}

export default async function patientInfoUpdateApi ({patientName,dob,gender,phone,maritalStatus,husbandName,cnic,mrNo}:dataprops,token:string){
const url = HMS_Base_Url + patientInfoEnpoints.Update

try{
 const res = await axios.post (url,
    {
        patientName,
        dob,
        gender,
        phone,
        maritalStatus,
        husbandName,
        cnic,
        mrNo
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