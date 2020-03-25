import { Map, GoogleApiWrapper, Marker,InfoWindow} from 'google-maps-react';
import React, { Component } from 'react';
import {query, Connection} from 'stardog';
import {
    dbName, markers
  } from "../../helpers/constants";
  const readQuery = `select ?lat ?lng 
where {
    ?l <http://schema.org/number> ?number .
    ?l <http://schema.org/lat> ?lat .
    ?l <http://schema.org/lng> ?lng .
}
`;
function Localisation(lat, lng) {
    return {
      latitude: lat,
      longitude: lng
    };
  }

  const conni = new Connection({
    username: "admin",
    password: "admin",
    endpoint: "http://localhost:5820"
  }); 




class BikeMap extends Component{
    constructor(props) {
        super(props);
        
        this.state = {
          stores: []
        }
      }  
      componentDidMount() {
        this.displayLocalisation();
      }
      displayLocalisation(){
        return query.execute(conni, 'lyon_bikes', "select ?lat ?lng where {?l <http://schema.org/number> ?number .?l <http://schema.org/lat> ?lat .?l <http://schema.org/lng> ?lng .?l <http://schema.org/status> 'OPEN' .}", 'application/sparql-results+json').then(({ body }) => {
          const resultat = []
          body.results.bindings.map(function(line){resultat.push(Localisation(parseFloat(line.lat.value), parseFloat(line.lng.value)))}); 
          this.setState({
              stores: resultat
          })
        });
      }
      displayMarkers = () => {
        return this.state.stores.map((store, index) => {
          return <Marker  key={index} id={index} position={{
           lat: store.latitude,
           lng: store.longitude
          }}
         onClick={() => console.log("You clicked me!")} ></Marker>
        })
      }
    render() {     
        const mapStyles = {
            width: '100%',
            height: '100%',
          };
        return (
          <div>
            <Map
          google={this.props.google}
          zoom={6}
          style={mapStyles}
          initialCenter={{ lat: 45.73, lng: 4.82}}
        >
          {this.displayMarkers()}
        </Map>
        </div>
        );
      }
}



export default GoogleApiWrapper({
    apiKey: 'enteryourcodehere'
  })(BikeMap);

