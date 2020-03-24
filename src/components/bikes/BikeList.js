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

// Let's not take _quite_ the entire browser screen.
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
    const bindingValue = binding[selector === "movie" ? "movies" : selector];
    // NOTE: In a production app, we would probably want to do this formatting elsewhere.
    return Array.isArray(bindingValue) ? bindingValue.join(", ") : bindingValue;
  }

  renderRowForBinding(binding, index) {
    return (
      // Use every "selector" to extract table cell data from each binding.
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

// Our SPARQL query returns a new "row" (i.e., variable binding) for each
// character for each movie in which the character appears. We don't want to
// _display_ multiple rows for the same character, though. Instead, we want
// to show _one_ row for each character, and, if the character was in several
// movies, we want to show them as a group within that character's single row. This
// method goes through the bindings, groups them under each individual
// character's id, then merges them together, aggregating the movies as an
// array of strings. It also cleans up some of the data so that it's more
// readable in the UI.
getBindingsFormattedForTable(bindings) {
  // Group the bindings by each character id, in case multiple rows were
  // returned for a single character.
  const bindingsById = bindings.reduce((groupedBindings, binding) => {
    const { value: number } = binding.number;
    groupedBindings[number] = groupedBindings[number] ? groupedBindings[number].concat(binding) : [binding];
    return groupedBindings;
  }, {});

  // Sort the bindings by id (ascending), then, if there are multiple
  // bindings for a single id, merge them together, aggregating movies as an
  // array.
  return Object.keys(bindingsById)
    .map(number => parseInt(number, 10)) // convert ids from strings to numbers for sorting
    .sort() // we do this sorting client-side because `Object.keys` ordering is not guaranteed
    .map(number => {
      // For each `id`, merge the bindings together as described above.
      return bindingsById[number].reduce(
        (bindingForTable, binding) => {
          // Quick cleanup to remove IRI data that we don't want to display:
          const bindingValues = Object.keys(binding).reduce((valueBinding, key) => {
            const { type, value } = binding[key];
            valueBinding[key] = type !== "uri" ? value : value.slice(value.lastIndexOf("/") + 1); // data cleanup
            return valueBinding;
          }, {});
          // Aggregate movies on the `movies` property, deleting `movie`:
          const movies = bindingValues.movie
            ? bindingForTable.movies.concat(bindingValues.movie)
            : bindingForTable.movies;
          delete bindingValues.movie;
          return {
            ...bindingForTable,
            ...bindingValues,
            movies
          };
        },
        { movies: [] }
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
              <i>Bike Stations</i> with Stardog
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