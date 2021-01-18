import Vue from 'vue'

import axios from 'axios'
Vue.use(axios)
const apiUrl="http://localhost:3000/api/";

export function getter(dataBase){
    return(axios.get(apiUrl+dataBase))
}
export function getterId(dataBase,id){
    console.log(apiUrl+dataBase+'/' +id);
    return(axios.get(apiUrl+dataBase+ '/' +id))
}
export function postData(dataBase,data){
    return(axios.post(apiUrl+dataBase,data))
}

export function searchPassengerByPhone(phone){
    console.log(phone);
    console.log(apiUrl+"passengers"+`?filter={"where":{"phone":"` + phone+`}}`)
    return(axios.get(apiUrl+"passengers"+`?filter={"where":{"phone":"` + phone +`"}}`));
}
export function getRout(pickUplocation,dropOflocation){
    var config = {
        headers: {'Access-Control-Allow-Origin': '*'}
    };
    return(axios.get(
        apiUrl+"trips/getRout?pickupLat="+pickUplocation.lat+"&pickupLng="+pickUplocation.lng+"&dropoffLat="+dropOflocation.lat+"&dropoffLng="+dropOflocation.lng
      ))
    }
   

     
    
