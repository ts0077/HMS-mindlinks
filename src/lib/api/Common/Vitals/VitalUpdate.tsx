import axios from 'axios'
import { HMS_Base_Url } from '../../baseUrl'
import ErrorHandles from '../../errorHandles'
import { VitalEndpoints } from './VitalEdnpoints'

type VitalProps = {
    vitalID: number
    temperature: number
    pulse: number
    bloodPressure: string
    respiratoryRate: number
    oxygenSaturation: number
    weight: number
    height: number
}




export default async function VitalUpdateApi({ vitalID,temperature,pulse,bloodPressure,respiratoryRate,oxygenSaturation,weight, height}: VitalProps, token: string) {

    const url = HMS_Base_Url + VitalEndpoints.Update

    try {
        const res = await axios.post(url,
            {
                vitalID,temperature,pulse,bloodPressure,respiratoryRate,oxygenSaturation,weight, height
            }
            , {
                headers: {
                    "Content-Type": "application/json",
                    Accept: "*/*",
                    Authorization: `Bearer ${token}`

                }
            })
        return res.data
    }
    catch (error) {
        ErrorHandles(error);
        throw error
    }

}