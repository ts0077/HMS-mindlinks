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

export default async function VitalAddApi ({temperature,pulse,bloodPressure,respiratoryRate,oxygenSaturation,weight,height}:VitalProps,visitID:number,token:string){
const url = HMS_Base_Url + VisitEndpoints.AddVital

try{
 const res = await axios.post (url,
    {
        temperature,
        pulse,
        bloodPressure,
        respiratoryRate,
        oxygenSaturation,
        weight,
        height
    }
    ,{
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