<template>
  <div>
    <b-row>
      <b-col>
        <p>
          <img src="@/assets/img/blue.png" alt="" width="10%" /> Active Drivers
        </p>
      </b-col>
      <b-col>
        <p>
          <img src="@/assets/img/emerdg.png" alt="" width="10%" /> Busy Drivers
        </p>
      </b-col>
      <b-col>
        <p>
          <img src="@/assets/img/inactive.png" alt="" width="10%" /> Inactive
          Drivers
        </p>
      </b-col>
    </b-row>
    <b-row>
      <b-col md="3">
        <div style="height: 100%;background:white;padding:10px">
          <h5 style="text-align:center">Dispatcher Panel</h5>
          <strong>
            User Information
          </strong>
          <div class="input-group-prepend" style="padding-top:10px">
            <span
              class="input-group-text"
              style="background: white; 
                              border-top-right-radius: 0;
                              border-bottom-right-radius: 0;"
              >+251</span
            >
            <input
              style="border-top-left-radius: 0;
                              border-bottom-left-radius: 0;"
              name="phoneNumber"
              @change="userSearch()"
              v-model="trip.phone"
              id="phoneNumber"
              placeholder="Phone Number"
              type="text"
              class="form-control"
              required
            />
          </div>
          <div class="input-group-prepend" style="padding-top:10px">
            <input
              style="border-top-left-radius: 0;
                              border-bottom-left-radius: 0;"
              name="full name"
              id="fullName"
              placeholder="Full Name"
              type="text"
              :disabled="!newUser"
              v-model="trip.fullName"
              class="form-control"
              required
            />
          </div>
          <div class="input-group-prepend" style="padding-top:10px">
            <input
              style="border-top-left-radius: 0;
                              border-bottom-left-radius: 0;"
              name="email"
              id="email"
              placeholder="Email (optional)"
              type="email"
              :disabled="!newUser"
              v-model="trip.email"
              class="form-control"
              required
            />
          </div>
          <div v-if="newUser" style="padding-top:10px;padding-bottom:20px">
            <b-button
              variant="success"
              class="float-right"
              @click="registerPassenger"
              :disabled="!registerUser"
              >Register User</b-button
            >
          </div>
          <hr />
          <div class="position-relative form-group">
            <label for="pickupLocation" class>Pickup Location</label>
            <gmap-autocomplete
              class="form-control"
              @place_changed="setPickupLocation"
              :options="{
                bounds: (8.980603, 38.757759),
                strictBounds: true,
                types: ['establishment'],
                componentRestrictions: { country: 'et' },
              }"
              required
            ></gmap-autocomplete>
          </div>
          <div class="position-relative form-group">
            <label for="dropOffLocation" class>Drop Off Location</label>
            <gmap-autocomplete
              class="form-control"
              @place_changed="setDropOffLocation"
              :options="{
                bounds: (8.980603, 38.757759),
                strictBounds: true,
                types: ['establishment'],
                componentRestrictions: { country: 'et' },
              }"
              required
            ></gmap-autocomplete>
          </div>

          <div style="padding-top:10px">
            <b-form-radio-group
              v-model="selected"
              :options="options"
              class="mb-3"
              value-field="item"
              text-field="name"
              disabled-field="notEnabled"
            ></b-form-radio-group>
          </div>

          <div class="input-group-prepend" style="padding-top:10px">
            <input
              style="border-top-left-radius: 0;
                              border-bottom-left-radius: 0;"
              placeholder="Drop Off Location"
              type="time"
              class="form-control"
              :disabled="selected == 'Now'"
              required
            />
          </div>
          <div class="input-group-prepend" style="padding-top:10px">
            <CSelect
              label="Vehicle :"
              style="width:100%"
              size="sm"
              horizontal
              :options="value"
              placeholder="Vehicle Type"
            />
          </div>
          <div style="padding-top:10px">
            <button
              type="button"
              class="btn btn-primary col-md-8"
              @click="confirmTrip()"
            >
              Confirm Trip
            </button>
            <button type="button" class="btn btn-secondary col-md-4">
              ETA
            </button>
          </div>
        </div>
      </b-col>
      <b-col md="9">
        <GmapMap
          :center="{ lat: centerOfAddisAbaba.lat, lng: centerOfAddisAbaba.lng }"
          :zoom="12"
          map-type-id="terrain"
          style="width: 100%; height: 500px"
        >
          <GmapPolyline
            v-bind:path.sync="line"
            v-bind:options="{ strokeColor: '#008000' }"
          >
          </GmapPolyline>
          <GmapMarker
            v-for="(item, key) in coordinates"
            :key="key"
            :position="getPosition(item)"
            :clickable="true"
            :visible="VechicleVisiblitys"
            @click="toggleInfo(item, key)"
            :icon="markerImages(item, 'allVichicle')"
          />
          <GmapMarker
            v-for="(item, key) in pickupAnddropoff"
            :key="key"
            :position="getPosition(item)"
            :clickable="true"
            :visible="PickupAndDropOffMarker"
            @click="toggleInfo(item, key)"
            :icon="markerImages(item,'pickupAnddropoff')"
          />

          <GmapInfoWindow
            :options="infoOptions"
            :position="infoPosition"
            :opened="infoOpened"
            @closeclick="infoOpened = false"
          >
            <h6>{{ conntentHeader }}</h6>
            {{ infoContent }}
          </GmapInfoWindow>
        </GmapMap>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import Vue from "vue";
import { gmapApi } from "vue2-google-maps";
import io from "socket.io-client";

const decode = require("geojson-polyline").decode;
import { BootstrapVue, BVToastPlugin } from "bootstrap-vue";
Vue.use(BootstrapVue);
const {
  getterId,
  searchPassengerByPhone,
  postData,
  getRout,
} = require("../../assets/js/service");
computed: {
  google: gmapApi;
}
export default {
  data() {
    return {
      VechicleVisiblitys: true,
      PickupAndDropOffMarker: false,
      registerUser: false,
      newUser: true,
      value: ["Normal", "Corporate", "Family Size"],
      trip: {
        trip_status: "searching",
        routing_line: null,
        google_distance: null,
        google_eta: null,
        passengerId: null,
        fullName: null,
        phone: null,
        email: null,
        vihicle_type: "Normal",
        pickup_location: {
          lat: null,
          lng: null,
        },

        pickup_name: null,
        dropoff_name: null,
        dropoff_location: {
          lat: null,
          lng: null,
        },
      },
      line: [],
      socket: null,

      centerOfAddisAbaba: { lat: 8.9806, lng: 38.7578 },
      coordinates: [],
      pickupAnddropoff: [],
      place: null,
      placename: [],
      infoPosition: null,
      infoContent: null,
      conntentHeader: null,
      infoOpened: false,
      infoCurrentKey: null,
      infoOptions: {
        pixelOffset: {
          width: 0,
          height: -35,
        },
      },
      selected: "Now",
      options: [
        { item: "Now", name: "Now" },
        { item: "Scadule", name: "Scadule" },
      ],
    };
  },
  mounted() {
    this.socket = io("http://localhost:3000/passenger-socket");
    this.socket.on("connect", function() {
      console.log("Connected");
    });

    this.socket.on("error", (data) => {
      console.log({ data });
    }),
      this.socket.emit("Dispacher Drivers Location Requiest", "getDrivers"),
      this.socket.on("All Drivers", (data) => {
        this.coordinates = data;
      });

    this.socket.on("response", (data) => {
      console.log({ data });
    });

    this.socket.on("disconnect", function() {
      console.log("Disconnected");
    });
    this.socket.on("place suggestions", (data) => {
      console.log("asdfghjkl;");
      console.log(data);
      this.placename = data.map((Place) => ({ value: Place.description }));
      console.log(test);
    });
  },
  methods: {
    setPickupLocation(place) {
      console.log(place);
      this.trip.pickup_location = [];
      this.nearDriverInfo = [];
      this.trip.pickup_location["lat"] = place.geometry.location.lat();
      this.trip.pickup_location["lng"] = place.geometry.location.lng();
      this.trip.pickup_name = place.formatted_address;
      console.log(this.trip);
    },
    setDropOffLocation(place) {
      console.log(place);
      this.trip.dropoff_location = [];
      this.nearDriverInfo = [];
      this.trip.dropoff_location["lat"] = place.geometry.location.lat();
      this.trip.dropoff_location["lng"] = place.geometry.location.lng();
      this.trip.dropoff_name = place.formatted_address;
      console.log(this.trip.dropoff_location);
    },
    SearchForPlace() {
      if (this.place.length > 3) {
        this.socket.emit("PlaceNameToLatLng", this.place);
      }
    },
    getPosition: function(marker) {
      return {
        lat: parseFloat(marker.location.lat),
        lng: parseFloat(marker.location.lng),
      };
    },
    toggleInfo: function(marker, key) {
      this.infoPosition = this.getPosition(marker);
      const database = "Drivers";
      const id = marker.driverId;
      getterId(database, id).then((resp) => {
        console.log(resp);
        this.infoContent =
          "Full Name :" + resp.data.firstName + " " + resp.data.lastName;
        if (marker.online == false) {
          this.conntentHeader = "Inactive";
        } else if (marker.online == true) {
          this.conntentHeader = "Active";
        }
        if (this.infoCurrentKey == key) {
          this.infoOpened = !this.infoOpened;
        } else {
          this.infoOpened = true;
          this.infoCurrentKey = key;
        }
      });
    },
    markerImages: function(data, type) {
      if (type == "allVichicle") {
        if (data.online == false) {
          return {
            url: require("../../assets/img/inactive.png"),
            scaledSize: { width: 28, height: 28 },
            labelOrigin: { x: 16, y: -10 },
          };
        } else if (data.online == true) {
          return {
            url: require("../../assets/img/blue.png"),
            scaledSize: { width: 28, height: 28 },
            labelOrigin: { x: 16, y: -10 },
          };
        }
      }else if(type == "pickupAnddropoff"){
        if(data.type == "pick"){
          return {
            url: require("../../assets/img/locP.png"),
            scaledSize: { width: 20, height: 28 },
            labelOrigin: { x: 16, y: -10 },
          };
        }
        else if(data.type == "drop"){
          return {
            url: require("../../assets/img/locD.png"),
            scaledSize: { width: 20, height: 28 },
            labelOrigin: { x: 16, y: -10 },
          };
        }
      }
    },

    userSearch() {
      console.log(
        "user search user searchuser searchuser searchuser searchuser search"
      );
      var userPhone = "251" + this.trip.phone;
      searchPassengerByPhone(userPhone).then((resp) => {
        console.log(resp);
        if (resp.data.length > 0) {
          console.log("user exist");
          this.trip.passengerId = resp.data[0].id;
          this.trip.fullName = resp.data[0].fullName;
          this.trip.email = resp.data[0].email;
          this.newUser = false;
        } else {
          console.log("new user");
          this.newUser = true;
          this.registerUser = true;
        }
      });
    },
    registerPassenger() {
      var database = "passengers";
      var userinfo = {
        fullName: this.trip.fullName,
        phone: "251" + this.trip.phone,
        email: this.trip.email,
      };

      postData(database, userinfo).then((resp) => {
        console.log("success");
        console.log(resp);
        this.trip.passengerId = resp.data[0].id;
      });
    },
    confirmTrip() {
      if (
        this.trip.passengerId != null &&
        this.trip.vihicle_type != null &&
        this.trip.pickup_location != null &&
        this.trip.dropoff_location != null
      ) {
        let routline = [];
        console.log("fill the form coorectly");
        getRout(this.trip.pickup_location, this.trip.dropoff_location).then(
          (resp) => {
            console.log(resp);
            this.trip.google_eta =
              resp["data"]["rout"]["routes"][0]["legs"][0]["duration"]["text"];

            this.trip.google_distance =
              resp["data"]["rout"]["routes"][0]["legs"][0]["distance"]["text"];

            this.trip.routing_line =
              resp["data"]["rout"]["routes"][0]["overview_polyline"]["points"];
            const pol = [this.trip.routing_line];
            const polygon = {
              type: "Polygon",
              coordinates: pol,
            };
            const geoJSON = decode(polygon);
            console.log(geoJSON);
            console.log(geoJSON.length);

            for (var i = 0; i < geoJSON.coordinates[0].length; i++) {
              this.line.push({
                lat: geoJSON.coordinates[0][i][1],
                lng: geoJSON.coordinates[0][i][0],
              });
            }
            this.pickupAnddropoff.push({"location":this.trip.pickup_location,"type":"pick"});
            this.pickupAnddropoff.push({"location":this.trip.dropoff_location,"type":"drop"});
            this.VechicleVisiblitys = false;
            this.PickupAndDropOffMarker =true;

            

          }
        );
      } else {
        console.log("gggggggggggggggggggggggggggg");
      }
    },
  },
};
</script>

<style></style>
