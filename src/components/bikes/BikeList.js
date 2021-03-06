import React, { Component } from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import CircularProgress from '@material-ui/core/CircularProgress';
import { query } from "stardog";
import {
  TableDataAvailabilityStatus,
  columnData,
  columnSelectors,
  conn,
  dbName,
} from "../../helpers/constants";

const readQuery = `select ?number ?address ?lat ?lng ?bikes ?stands ?commune
where {
    ?l <http://schema.org/number> ?number .
    ?l <http://schema.org/address> ?address .
    ?l <http://schema.org/available_bikes> ?bikes .
    ?l <http://schema.org/available_bike_stands> ?stands .
    ?l <http://schema.org/lat> ?lat .
    ?l <http://schema.org/commune> ?commune .
    
}
`;

const styles = {
  appInnerContainer: {
    width: "90%",
    margin: "20px auto 0"
  },
  paper: {
    overflowX: "auto"
  },
  spinner: {
    margin: "20px auto",
    display: "block"
  }
};

const columnHeaders = columnData.map(({ label }) => <TableCell key={label}>{label}</TableCell>);

class BikeList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataState: TableDataAvailabilityStatus.NOT_REQUESTED,
      data: []
    };
  }

  getBindingValueForSelector(selector, binding) {
    const bindingValue = binding[selector === "bike" ? "bikes" : selector];
    return Array.isArray(bindingValue) ? bindingValue.join(", ") : bindingValue;
  }

  renderRowForBinding(binding, index) {
    return (
      <TableRow key={binding.number}>
        {columnSelectors.map(selector => (
          <TableCell key={selector}>
            {this.getBindingValueForSelector(selector, binding)}
          </TableCell>
        ))}
      </TableRow>
    );
  }
  componentDidMount() {
  this.refreshData();
}

refreshData() {
  this.setState({
    dataState: TableDataAvailabilityStatus.LOADING
  });
  query.execute(conn, dbName, readQuery).then(res => {
    if (!res.ok) {
      this.setState({
        dataState: TableDataAvailabilityStatus.FAILED
      });
      return;
    }

    const { bindings } = res.body.results;
    const bindingsForTable = this.getBindingsFormattedForTable(bindings);

    this.setState({
      dataState: TableDataAvailabilityStatus.LOADED,
      data: bindingsForTable
    });
  });
}


getBindingsFormattedForTable(bindings) {

  const bindingsById = bindings.reduce((groupedBindings, binding) => {
    const { value: number } = binding.number;
    groupedBindings[number] = groupedBindings[number] ? groupedBindings[number].concat(binding) : [binding];
    return groupedBindings;
  }, {});


  return Object.keys(bindingsById)
    .map(number => parseInt(number, 10)) 
    .sort() 
    .map(number => {
      return bindingsById[number].reduce(
        (bindingForTable, binding) => {
   
          const bindingValues = Object.keys(binding).reduce((valueBinding, key) => {
            const { type, value } = binding[key];
            valueBinding[key] = type !== "uri" ? value : value.slice(value.lastIndexOf("/") + 1); // data cleanup
            return valueBinding;
          }, {});
          const bikes = bindingValues.bike
            ? bindingForTable.bikes.concat(bindingValues.bike)
            : bindingForTable.bikes;
          delete bindingValues.bike;
          return {
            ...bindingForTable,
            ...bindingValues,
            bikes
          };
        },
        { bikes: [] }
      );
    });
}
  render() {
    const { dataState, data } = this.state;
    const isLoading = dataState === TableDataAvailabilityStatus.LOADING;

    return (
      <div>
      <div className="App" style={styles.appInnerContainer}>
        <CssBaseline />
        <Paper style={styles.paper}>
          <Toolbar>
            <Typography variant="title">
              <i>Bikes Stations</i> 
            </Typography>
          </Toolbar>
          {isLoading ? <CircularProgress style={styles.spinner} /> : (
            <Table>
              <TableHead>
                <TableRow>
                  {columnHeaders}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((binding, index) => this.renderRowForBinding(binding, index))}
              </TableBody>
            </Table>
          )}
        </Paper>
      </div>
      </div>
    );
  }
}

export default BikeList;