import React, { Component } from 'react';
import '../App.css'

class Homepage extends Component {
    render() {
        return (
<div className="wrapper">
            <h1 className="thin"> Bike Station App</h1>
                <p className="paragraph">Check bike availbility in France</p>
                <form action="/BikeMap">
                        <input className="button" type="submit" value="Map Your Bike !" />
                    </form>
                    <form action="/BikeList">
                        <input className="button" type="submit" value="City Bike Tour :)" />
                    </form>
                    <form action="/searchBike">
                        <input className="button" type="submit" value="Select your City" />
                    </form>
                </div>           
        );
    }
}
export default Homepage;