const { Connection, query } = require('stardog');
 
// Table column data, encoding the order, label, and "selector" for grabbing the
// data for each column.
const columnData = [
  
  {
    selector: "number",
    label: "Number"
  },{
    selector: "commune",
    label: "City"
  },
  {
    selector: "address",
    label: "Address"
  },{
    selector: "bikes",
    label: "Available bikes"
  },{
    selector: "stands",
    label: "Available stands"
  }
];

// For convenience, we'll also produce the array of selectors just once, and
// export it for re-use.
const columnSelectors = columnData.reduce(
  (selectors, { selector }) => [...selectors, selector],
  []
);

// In a typical application, the connection would be changeable. For our
// present purposes, though, this is unchanging and hard-coded.
const conn = new Connection({
  username: "admin",
  password: "admin",
  endpoint: "http://localhost:5820"
});

// An "enum" for the status of our request to Stardog for data.
const TableDataAvailabilityStatus = {
  NOT_REQUESTED: 'NOT_REQUESTED',
  LOADING: "LOADING",
  LOADED: "LOADED",
  FAILED: "FAILED"
};

module.exports = {
  dbName: 'lyon_bikes',
  columnData,
  columnSelectors,
  conn,
  TableDataAvailabilityStatus,
};

function Localisation(lat, lng) {
  return {
    latitude: lat,
    longitude: lng
  };
}



function ok(){
  return query.execute(conn, 'lyon_bikes', "select ?lat ?lng where { ?l <http://schema.org/number> ?number . ?l <http://schema.org/lat> ?lat . ?l <http://schema.org/lng> ?lng .}", 'application/sparql-results+json', {
    limit: 10,
    offset: 0,
  }).then(({ body }) => {
    const stores = []
    body.results.bindings.map(function(line){stores.push(Localisation(parseFloat(line.lat.value), parseFloat(line.lng.value)))}); 
    return(stores);
  });
}


async function myFunction() {
  var myVal = await ok();
  console.log(myVal)
}

