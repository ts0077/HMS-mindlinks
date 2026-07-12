

import { AxiosError } from "axios"
export default function ErrorHandles (error:unknown){
   
    if(error instanceof AxiosError)
    {

        if(error.response)
            {
                const status = error.response.status
                switch (status){
                    case 400: 
                    console.log("Bad Request")
                    break;

          case 401:
              console.error("Unauthorized")
              break;
              
              case 403:
                  console.log("Forbiddden")
            break;
        case 404:
            console.error("Not Found")
            break;
        case 408:
            console.error("request time out")
            break;
        case 429:
            console.error("Too many requests")
            break;
            case 500:
                console.error("Internal server error")
                break;
                
                default:
                    console.error("Unexpected error occur")
                    
                }
            }
            
            else if(error.request)
                {
                    console.log("Response Not Coming")
                }
            }

   else {
    console.log("Check Your internet connection")
   }
}